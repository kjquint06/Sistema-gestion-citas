<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReporteRequest;
use App\Models\Cita;
use App\Models\Medico;
use App\Models\User;
use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class ReporteController extends Controller
{
    private const MAX_MESES = 36;

    public function index(ReporteRequest $request): Response
    {
        /** @var User $usuario */
        $usuario = $request->user();

        $desde = $request->desde();
        $hasta = $request->hasta();

        /** @param Builder<Cita> $query */
        $enRango = fn (Builder $query): Builder => $query
            ->whereDate('inicia_en', '>=', $desde)
            ->whereDate('inicia_en', '<=', $hasta);

        // Distribución por estado en una sola consulta agrupada
        /** @var array<string, int> $conteos */
        $conteos = Cita::query()
            ->tap($enRango)
            ->selectRaw('estado, count(*) as total')
            ->groupBy('estado')
            ->pluck('total', 'estado')
            ->map(fn ($total) => (int) $total)
            ->all();

        $porEstado = [];
        foreach (Cita::ESTADOS as $estado) {
            $porEstado[$estado] = $conteos[$estado] ?? 0;
        }

        return Inertia::render('reportes/index', [
            'rol' => $usuario->rol,
            'filtros' => ['desde' => $desde, 'hasta' => $hasta],
            'total' => Cita::query()->tap($enRango)->count(),
            'porEstado' => $porEstado,
            'porMedico' => $this->porMedico($enRango),
            'porEspecialidad' => $this->porEspecialidad($enRango),
            'porMes' => $this->porMes($enRango, $desde, $hasta),
        ]);
    }

    /**
     * @return array<int, array<string, int|string>>
     */
    private function porMedico(Closure $enRango): array
    {
        $conteosPorMedico = ['citas as total' => $enRango];
        foreach (Cita::ESTADOS as $estado) {
            /** @param Builder<Cita> $query */
            $conteosPorMedico['citas as '.$estado] = fn (Builder $query): Builder => $enRango($query)->where('estado', $estado);
        }

        return Medico::query()
            ->with(['usuario:id,name', 'especialidad:id,nombre'])
            ->withCount($conteosPorMedico)
            ->get()
            ->map(function (Medico $medico) {
                $fila = [
                    'id' => $medico->id,
                    'nombre' => $medico->usuario->name,
                    'especialidad' => $medico->especialidad->nombre,
                    'total' => (int) $medico->getAttribute('total'),
                ];

                foreach (Cita::ESTADOS as $estado) {
                    $fila[$estado] = (int) $medico->getAttribute($estado);
                }

                return $fila;
            })
            ->sortByDesc('total')
            ->values()
            ->all();
    }

    /**
     * @return array<int, array{nombre: string, total: int}>
     */
    private function porEspecialidad(Closure $enRango): array
    {
        return Cita::query()
            ->tap($enRango)
            ->join('medicos', 'medicos.id', '=', 'citas.medico_id')
            ->join('especialidades', 'especialidades.id', '=', 'medicos.especialidad_id')
            ->selectRaw('especialidades.nombre as nombre, count(citas.id) as total')
            ->groupBy('especialidades.id', 'especialidades.nombre')
            ->orderByDesc('total')
            ->get()
            ->map(fn (Cita $fila) => [
                'nombre' => (string) $fila->getAttribute('nombre'),
                'total' => (int) $fila->getAttribute('total'),
            ])
            ->all();
    }

    /**
     * Un registro por cada mes del rango, aunque no tenga citas.
     *
     * @return array<int, array{mes: string, total: int}>
     */
    private function porMes(Closure $enRango, string $desde, string $hasta): array
    {
        $conteos = Cita::query()
            ->tap($enRango)
            ->pluck('inicia_en')
            ->countBy(fn ($fecha) => Carbon::parse($fecha)->format('Y-m'));

        $meses = [];
        $cursor = Carbon::parse($desde)->startOfMonth();
        $limite = Carbon::parse($hasta)->startOfMonth();

        while ($cursor->lessThanOrEqualTo($limite) && count($meses) < self::MAX_MESES) {
            $clave = $cursor->format('Y-m');
            $meses[] = ['mes' => $clave, 'total' => (int) $conteos->get($clave, 0)];
            $cursor->addMonth();
        }

        return $meses;
    }
}