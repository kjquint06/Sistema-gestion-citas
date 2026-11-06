<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReporteRequest;
use App\Models\Cita;
use App\Models\Medico;
use Illuminate\Database\Eloquent\Builder;
use Inertia\Inertia;
use Inertia\Response;

class ReporteController extends Controller
{
    private const ESTADOS = [
        Cita::ESTADO_PENDIENTE,
        Cita::ESTADO_CONFIRMADA,
        Cita::ESTADO_ATENDIDA,
        Cita::ESTADO_CANCELADA,
        Cita::ESTADO_INASISTENCIA,
    ];

    public function index(ReporteRequest $request): Response
    {
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
        foreach (self::ESTADOS as $estado) {
            $porEstado[$estado] = $conteos[$estado] ?? 0;
        }

        // Citas por médico con withCount (agregados de Eloquent)
        $conteosPorMedico = ['citas as total' => $enRango];
        foreach (self::ESTADOS as $estado) {
            /** @param Builder<Cita> $query */
            $conteosPorMedico['citas as '.$estado] = fn (Builder $query): Builder => $enRango($query)->where('estado', $estado);
        }

        $porMedico = Medico::query()
            ->with(['usuario:id,name', 'especialidad:id,nombre'])
            ->withCount($conteosPorMedico)
            ->get()
            ->map(fn (Medico $medico) => [
                'id' => $medico->id,
                'nombre' => $medico->usuario->name,
                'especialidad' => $medico->especialidad->nombre,
                'total' => (int) $medico->getAttribute('total'),
                'pendiente' => (int) $medico->getAttribute(Cita::ESTADO_PENDIENTE),
                'confirmada' => (int) $medico->getAttribute(Cita::ESTADO_CONFIRMADA),
                'atendida' => (int) $medico->getAttribute(Cita::ESTADO_ATENDIDA),
                'cancelada' => (int) $medico->getAttribute(Cita::ESTADO_CANCELADA),
                'inasistencia' => (int) $medico->getAttribute(Cita::ESTADO_INASISTENCIA),
            ])
            ->sortByDesc('total')
            ->values();

        return Inertia::render('reportes/index', [
            'filtros' => ['desde' => $desde, 'hasta' => $hasta],
            'total' => Cita::query()->tap($enRango)->count(),
            'porEstado' => $porEstado,
            'porMedico' => $porMedico,
        ]);
    }
}
