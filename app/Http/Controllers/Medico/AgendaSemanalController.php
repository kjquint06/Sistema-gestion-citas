<?php

namespace App\Http\Controllers\Medico;

use App\Http\Controllers\Controller;
use App\Models\Bloqueo;
use App\Models\Cita;
use App\Models\Horario;
use App\Models\Medico;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Throwable;

class AgendaSemanalController extends Controller
{
    /**
     * Datos de la agenda semanal del médico que inició sesión.
     *
     * @return array<string, mixed>
     */
    public function datos(Request $request): array
    {
        /** @var Medico|null $medico */
        $medico = $request->user()?->medico;

        abort_if($medico === null, 403, 'Tu usuario no tiene un perfil de médico.');

        $lunes = $this->inicioSemana($request->query('semana'));
        $domingo = $lunes->copy()->addDays(6)->endOfDay();

        // Solo las citas de este médico en la semana elegida
        $citasSemana = Cita::query()
            ->where('medico_id', $medico->id)
            ->whereBetween('inicia_en', [$lunes, $domingo])
            ->with('paciente.usuario:id,name')
            ->orderBy('inicia_en')
            ->get();

        // Las tarjetas siempre muestran el día de hoy
        $citasHoy = Cita::query()
            ->where('medico_id', $medico->id)
            ->whereDate('inicia_en', Carbon::today())
            ->where('estado', '!=', Cita::ESTADO_CANCELADA)
            ->with('paciente.usuario:id,name')
            ->orderBy('inicia_en')
            ->get();

        $primeraEnEspera = $citasHoy->firstWhere('estado', Cita::ESTADO_EN_ESPERA);
        $proximaConfirmada = $citasHoy
            ->where('estado', Cita::ESTADO_CONFIRMADA)
            ->first(fn (Cita $cita) => $cita->inicia_en->greaterThanOrEqualTo(Carbon::now()));

        $bloqueos = Bloqueo::query()
            ->where('medico_id', $medico->id)
            ->where('inicia_en', '<=', $domingo)
            ->where('termina_en', '>=', $lunes)
            ->orderBy('inicia_en')
            ->get();

        $horarios = $medico->horarios()->orderBy('dia_semana')->orderBy('hora_inicio')->get();

        return [
            'medico' => [
                'nombre' => $medico->usuario->name,
                'consultorio' => $medico->consultorio,
                'especialidad' => $medico->especialidad->nombre,
                'duracion_cita' => $medico->duracion_cita,
            ],
            'horarios' => $horarios->map(fn (Horario $horario) => [
                'dia' => (int) $horario->dia_semana,
                'inicio' => substr((string) $horario->hora_inicio, 0, 5),
                'fin' => substr((string) $horario->hora_fin, 0, 5),
            ])->values()->all(),
            'semana' => [
                'inicio' => $lunes->toDateString(),
                'fin' => $domingo->toDateString(),
                'anterior' => $lunes->copy()->subWeek()->toDateString(),
                'siguiente' => $lunes->copy()->addWeek()->toDateString(),
                'dias' => collect(range(0, 6))->map(fn (int $i) => $lunes->copy()->addDays($i)->toDateString())->all(),
            ],
            'hoy' => Carbon::today()->toDateString(),
            'ahora' => Carbon::now()->format('H:i'),
            'tarjetas' => [
                'citas_hoy' => $citasHoy->count(),
                'en_espera' => $citasHoy->where('estado', Cita::ESTADO_EN_ESPERA)->count(),
                'confirmadas' => $citasHoy->where('estado', Cita::ESTADO_CONFIRMADA)->count(),
                'en_espera_detalle' => $primeraEnEspera === null ? null : [
                    'nombre' => $primeraEnEspera->paciente->usuario->name,
                    'llegada' => $primeraEnEspera->hora_llegada?->format('H:i'),
                ],
                'proxima_confirmada' => $proximaConfirmada === null ? null : [
                    'nombre' => $proximaConfirmada->paciente->usuario->name,
                    'hora' => $proximaConfirmada->inicia_en->format('H:i'),
                ],
            ],
            'citas' => $citasSemana->map(fn (Cita $cita) => [
                'id' => $cita->id,
                'fecha' => $cita->inicia_en->toDateString(),
                'inicio' => $cita->inicia_en->format('H:i'),
                'fin' => $cita->termina_en->format('H:i'),
                'estado' => $cita->estado,
                'motivo' => $cita->motivo,
                'hora_llegada' => $cita->hora_llegada?->format('H:i'),
                'paciente' => [
                    'id' => $cita->paciente_id,
                    'nombre' => $cita->paciente->usuario->name,
                ],
            ])->values()->all(),
            'bloqueos' => $this->bloqueosPorDia($bloqueos, $lunes),
            'horas' => $this->rangoHoras($horarios, $citasSemana),
            'pacientesAtendidos' => $this->pacientesAtendidos($medico),
        ];
    }

    private function inicioSemana(mixed $valor): Carbon
    {
        try {
            $fecha = is_string($valor) && $valor !== '' ? Carbon::parse($valor) : Carbon::today();
        } catch (Throwable) {
            $fecha = Carbon::today();
        }

        return $fecha->startOfWeek(Carbon::MONDAY)->startOfDay();
    }

    /**
     * Parte cada bloqueo por día para dibujarlo en su columna.
     *
     * @param  Collection<int, Bloqueo>  $bloqueos
     * @return array<int, array{id: int, fecha: string, inicio: string, fin: string, motivo: string|null}>
     */
    private function bloqueosPorDia($bloqueos, Carbon $lunes): array
    {
        $resultado = [];

        foreach (range(0, 6) as $i) {
            $inicioDia = $lunes->copy()->addDays($i)->startOfDay();
            $finDia = $inicioDia->copy()->endOfDay();

            foreach ($bloqueos as $bloqueo) {
                $inicioBloqueo = Carbon::parse($bloqueo->inicia_en);
                $finBloqueo = Carbon::parse($bloqueo->termina_en);

                if ($inicioBloqueo->greaterThan($finDia) || $finBloqueo->lessThan($inicioDia)) {
                    continue;
                }

                $desde = $inicioBloqueo->greaterThan($inicioDia) ? $inicioBloqueo : $inicioDia;
                $hasta = $finBloqueo->lessThan($finDia) ? $finBloqueo : $finDia;

                $resultado[] = [
                    'id' => $bloqueo->id,
                    'fecha' => $inicioDia->toDateString(),
                    'inicio' => $desde->format('H:i'),
                    'fin' => $hasta->format('H:i') === '23:59' ? '24:00' : $hasta->format('H:i'),
                    'motivo' => $bloqueo->motivo,
                ];
            }
        }

        return $resultado;
    }

    /**
     * Horas que muestra el calendario: del inicio al fin del horario del médico y sus citas.
     *
     * @param  Collection<int, Horario>  $horarios
     * @param  Collection<int, Cita>  $citas
     * @return array{inicio: int, fin: int}
     */
    private function rangoHoras($horarios, $citas): array
    {
        $inicios = $horarios->map(fn (Horario $horario) => (int) substr((string) $horario->hora_inicio, 0, 2))
            ->merge($citas->map(fn (Cita $cita) => (int) $cita->inicia_en->format('G')));

        $fines = $horarios->map(fn (Horario $horario) => (int) ceil(((int) substr((string) $horario->hora_fin, 0, 2) * 60 + (int) substr((string) $horario->hora_fin, 3, 2)) / 60))
            ->merge($citas->map(fn (Cita $cita) => (int) ceil(((int) $cita->termina_en->format('G') * 60 + (int) $cita->termina_en->format('i')) / 60)));

        // Sin horario ni citas se muestra de 8:00 a 17:00
        $inicio = (int) ($inicios->min() ?? 8);
        $fin = (int) ($fines->max() ?? 17);

        return [
            'inicio' => $inicio,
            'fin' => max($fin, $inicio + 1),
        ];
    }

    /**
     * Pacientes que este médico ya atendió, del más reciente al más antiguo.
     *
     * @return array<int, array{id: int, nombre: string, ultima_visita: string, visitas: int}>
     */
    private function pacientesAtendidos(Medico $medico): array
    {
        return Cita::query()
            ->where('medico_id', $medico->id)
            ->where('estado', Cita::ESTADO_ATENDIDA)
            ->with('paciente.usuario:id,name')
            ->orderByDesc('inicia_en')
            ->get()
            ->groupBy('paciente_id')
            ->map(fn ($citas) => [
                'id' => (int) $citas->first()->paciente_id,
                'nombre' => $citas->first()->paciente->usuario->name,
                'ultima_visita' => $citas->first()->inicia_en->format('d/m/Y'),
                'visitas' => $citas->count(),
            ])
            ->take(10)
            ->values()
            ->all();
    }
}
