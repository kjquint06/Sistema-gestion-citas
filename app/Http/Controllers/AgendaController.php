<?php

namespace App\Http\Controllers;

use App\Models\Cita;
use App\Models\Horario;
use App\Models\Medico;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class AgendaController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var User $usuario */
        $usuario = $request->user();

        $esPersonal = $usuario->tieneRol(User::ROL_ADMIN, User::ROL_RECEPCIONISTA);
        $esMedico = $usuario->tieneRol(User::ROL_MEDICO);
        $esPaciente = $usuario->tieneRol(User::ROL_PACIENTE);
        $sinAcceso = ! $esPersonal && ! $esMedico && ! $esPaciente;

        $fecha = $this->fecha($request->query('fecha'));
        $dia = $fecha->dayOfWeekIso;
        $medicoFiltro = $esPersonal ? ($request->integer('medico_id') ?: null) : null;

        // Médicos visibles según el rol
        $medicosBase = Medico::query()
            ->when($esMedico, fn (Builder $query) => $query->where('id', $usuario->medico?->id))
            ->when($esPaciente, fn (Builder $query) => $query->whereIn(
                'id',
                Cita::query()->where('paciente_id', $usuario->paciente?->id)->select('medico_id')
            ))
            ->when($sinAcceso, fn (Builder $query) => $query->whereRaw('1 = 0'))
            ->when($medicoFiltro, fn (Builder $query) => $query->where('id', $medicoFiltro));

        // Citas visibles según el rol
        $citasBase = Cita::query()
            ->when($esMedico, fn (Builder $query) => $query->where('medico_id', $usuario->medico?->id))
            ->when($esPaciente, fn (Builder $query) => $query->where('paciente_id', $usuario->paciente?->id))
            ->when($sinAcceso, fn (Builder $query) => $query->whereRaw('1 = 0'))
            ->when($medicoFiltro, fn (Builder $query) => $query->where('medico_id', $medicoFiltro));

        $medicos = (clone $medicosBase)
            ->with(['usuario:id,name', 'especialidad:id,nombre', 'horarios'])
            ->get();

        $citasDia = (clone $citasBase)
            ->with('paciente.usuario:id,name')
            ->whereDate('inicia_en', $fecha->toDateString())
            ->orderBy('inicia_en')
            ->get();

        $citasActivas = $citasDia->where('estado', '!=', Cita::ESTADO_CANCELADA);
        $idsConCitas = $citasDia->pluck('medico_id')->all();

        // Una columna por médico que atiende ese día o que tiene citas
        $columnas = $medicos
            ->filter(fn (Medico $medico) => $medico->horarios->contains('dia_semana', $dia)
                || in_array($medico->id, $idsConCitas, true))
            ->sortBy(fn (Medico $medico) => $medico->usuario->name)
            ->values();

        return Inertia::render('agenda/index', [
            'rol' => $usuario->rol,
            'puedeGestionar' => $esPersonal,
            'fecha' => $fecha->toDateString(),
            'hoy' => now()->toDateString(),
            'filtros' => ['medico_id' => $medicoFiltro],
            'medicosFiltro' => $esPersonal ? $this->medicosFiltro() : [],
            'semana' => $this->semana($fecha, $medicos, $citasBase),
            'medicos' => $columnas->map(fn (Medico $medico) => [
                'id' => $medico->id,
                'nombre' => $medico->usuario->name,
                'iniciales' => $this->iniciales($medico->usuario->name),
                'especialidad' => $medico->especialidad->nombre,
                'consultorio' => $medico->consultorio,
                'duracion_cita' => $medico->duracion_cita,
                'horarios' => $medico->horarios
                    ->where('dia_semana', $dia)
                    ->sortBy('hora_inicio')
                    ->map(fn (Horario $horario) => [
                        'inicio' => substr((string) $horario->hora_inicio, 0, 5),
                        'fin' => substr((string) $horario->hora_fin, 0, 5),
                    ])
                    ->values()
                    ->all(),
            ])->all(),
            'citas' => $citasDia->map(function (Cita $cita) use ($medicos) {
                $paciente = $cita->paciente;
                $medico = $medicos->firstWhere('id', $cita->medico_id);

                return [
                    'id' => $cita->id,
                    'medico_id' => $cita->medico_id,
                    'medico' => $medico?->usuario->name,
                    'consultorio' => $medico?->consultorio,
                    'fecha' => $cita->inicia_en->toDateString(),
                    'inicio' => $cita->inicia_en->format('H:i'),
                    'fin' => $cita->termina_en->format('H:i'),
                    'duracion' => (int) $cita->inicia_en->diffInMinutes($cita->termina_en),
                    'hora_llegada' => $cita->hora_llegada?->format('H:i'),
                    'estado' => $cita->estado,
                    'motivo' => $cita->motivo,
                    'paciente' => [
                        'id' => $paciente->id,
                        'nombre' => $paciente->usuario->name,
                        'iniciales' => $this->iniciales($paciente->usuario->name),
                        'expediente' => 'EXP-'.str_pad((string) $paciente->id, 5, '0', STR_PAD_LEFT),
                        'edad' => $paciente->fecha_nacimiento?->age,
                    ],
                ];
            })->all(),
            'resumen' => $this->resumen($columnas, $citasActivas, $dia),
            'horas' => $this->rangoHoras($columnas, $citasDia, $dia),
        ]);
    }

    private function fecha(mixed $valor): Carbon
    {
        if (is_string($valor) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $valor) === 1) {
            try {
                return Carbon::createFromFormat('Y-m-d', $valor)->startOfDay();
            } catch (Throwable) {
                // Si la fecha no es válida se usa hoy
            }
        }

        return now()->startOfDay();
    }

    /**
     * Iniciales del nombre, sin contar títulos como "Dr." o "Dra.".
     */
    private function iniciales(string $nombre): string
    {
        $partes = collect(explode(' ', $nombre))
            ->filter(fn (string $parte) => $parte !== '' && ! str_ends_with($parte, '.'))
            ->values();

        return mb_strtoupper($partes->take(2)->map(fn (string $parte) => mb_substr($parte, 0, 1))->implode(''));
    }

    /**
     * @return array<int, array{id: int, nombre: string}>
     */
    private function medicosFiltro(): array
    {
        return Medico::with('usuario:id,name')
            ->get()
            ->map(fn (Medico $medico) => ['id' => $medico->id, 'nombre' => $medico->usuario->name])
            ->sortBy('nombre')
            ->values()
            ->all();
    }

    /**
     * Los 7 días de la semana (lunes a domingo) con su número de citas.
     *
     * @param  \Illuminate\Support\Collection<int, Medico>  $medicos
     * @param  Builder<Cita>  $citasBase
     * @return array<int, array{fecha: string, dia_semana: int, citas: int, atiende: bool}>
     */
    private function semana(Carbon $fecha, $medicos, Builder $citasBase): array
    {
        $inicio = $fecha->copy()->startOfWeek(Carbon::MONDAY);

        $conteos = (clone $citasBase)
            ->whereBetween('inicia_en', [$inicio->copy()->startOfDay(), $inicio->copy()->addDays(6)->endOfDay()])
            ->where('estado', '!=', Cita::ESTADO_CANCELADA)
            ->get(['inicia_en'])
            ->groupBy(fn (Cita $cita) => $cita->inicia_en->toDateString())
            ->map(fn ($grupo) => $grupo->count());

        $dias = [];

        foreach (range(0, 6) as $i) {
            $dia = $inicio->copy()->addDays($i);

            $dias[] = [
                'fecha' => $dia->toDateString(),
                'dia_semana' => $dia->dayOfWeekIso,
                'citas' => (int) $conteos->get($dia->toDateString(), 0),
                'atiende' => $medicos->contains(
                    fn (Medico $medico) => $medico->horarios->contains('dia_semana', $dia->dayOfWeekIso)
                ),
            ];
        }

        return $dias;
    }

    /**
     * Resumen sobre la cuadrícula: citas, médicos, bloque estándar y disponibilidad calculada.
     *
     * @param  \Illuminate\Support\Collection<int, Medico>  $columnas
     * @param  \Illuminate\Support\Collection<int, Cita>  $citasActivas
     * @return array{citas: int, medicos: int, bloque_minutos: int|null, bloques_totales: int, bloques_libres: int}
     */
    private function resumen($columnas, $citasActivas, int $dia): array
    {
        $totales = 0;
        $libres = 0;

        foreach ($columnas as $medico) {
            $bloques = $medico->horarios
                ->where('dia_semana', $dia)
                ->sum(fn (Horario $horario) => intdiv($this->minutos($horario), max(1, $medico->duracion_cita)));

            $ocupados = $citasActivas->where('medico_id', $medico->id)->count();

            $totales += $bloques;
            $libres += max(0, $bloques - $ocupados);
        }

        $duraciones = $columnas->pluck('duracion_cita')->unique();

        return [
            'citas' => $citasActivas->count(),
            'medicos' => $columnas->count(),
            'bloque_minutos' => $duraciones->count() === 1 ? (int) $duraciones->first() : null,
            'bloques_totales' => (int) $totales,
            'bloques_libres' => (int) $libres,
        ];
    }

    private function minutos(Horario $horario): int
    {
        return (int) Carbon::parse($horario->hora_inicio)->diffInMinutes(Carbon::parse($horario->hora_fin));
    }

    /**
     * Hora inicial y final de la cuadrícula, según horarios y citas del día.
     *
     * @param  \Illuminate\Support\Collection<int, Medico>  $columnas
     * @param  \Illuminate\Support\Collection<int, Cita>  $citasDia
     * @return array{inicio: int, fin: int}
     */
    private function rangoHoras($columnas, $citasDia, int $dia): array
    {
        $inicios = [];
        $fines = [];

        foreach ($columnas as $medico) {
            foreach ($medico->horarios->where('dia_semana', $dia) as $horario) {
                $desde = Carbon::parse($horario->hora_inicio);
                $hasta = Carbon::parse($horario->hora_fin);

                $inicios[] = $desde->hour;
                $fines[] = (int) ceil(($hasta->hour * 60 + $hasta->minute) / 60);
            }
        }

        foreach ($citasDia as $cita) {
            $inicios[] = $cita->inicia_en->hour;
            $fines[] = (int) ceil(($cita->termina_en->hour * 60 + $cita->termina_en->minute) / 60);
        }

        $inicio = $inicios === [] ? 8 : min($inicios);
        $fin = $fines === [] ? 17 : max($fines);

        return ['inicio' => $inicio, 'fin' => max($fin, $inicio + 1)];
    }
}