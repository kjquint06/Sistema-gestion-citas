<?php

namespace App\Http\Controllers;

use App\Http\Requests\CitaRequest;
use App\Http\Requests\PacienteCitaRequest;
use App\Models\Cita;
use App\Models\Especialidad;
use App\Models\Horario;
use App\Models\Medico;
use App\Models\Paciente;
use App\Services\DisponibilidadCitas;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class CitaController extends Controller
{
    public function create(Request $request): Response
    {
        return Inertia::render('citas/create', [
            'pacientes' => $this->pacientes(),
            'medicos' => $this->medicos(),
            'valores' => [
                'fecha' => (string) $request->query('fecha', now()->toDateString()),
                'medico_id' => $request->integer('medico_id') ?: null,
                'hora_inicio' => $request->query('hora'),
            ],
        ]);
    }

    public function store(CitaRequest $request): RedirectResponse
    {
        try {
            Cita::create($request->datosCita());
        } catch (UniqueConstraintViolationException) {
            return back()->withInput()->withErrors([
                'hora_inicio' => 'Ya existe una cita del médico a esa hora.',
            ]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Cita creada correctamente.']);

        return redirect()->route('agenda.index', ['fecha' => $request->input('fecha')]);
    }

    public function edit(Cita $cita): Response
    {
        return Inertia::render('citas/edit', [
            'cita' => [
                'id' => $cita->id,
                'paciente_id' => $cita->paciente_id,
                'medico_id' => $cita->medico_id,
                'fecha' => $cita->inicia_en->format('Y-m-d'),
                'hora_inicio' => $cita->inicia_en->format('H:i'),
                'hora_llegada' => $cita->hora_llegada?->format('H:i'),
                'estado' => $cita->estado,
                'motivo' => $cita->motivo,
            ],
            'pacientes' => $this->pacientes(),
            'medicos' => $this->medicos(),
            'estados' => Cita::ESTADOS,
        ]);
    }

    public function update(CitaRequest $request, Cita $cita): RedirectResponse
    {
        try {
            $cita->update($request->datosCita());
        } catch (UniqueConstraintViolationException) {
            return back()->withInput()->withErrors([
                'hora_inicio' => 'Ya existe una cita del médico a esa hora.',
            ]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Cita actualizada correctamente.']);

        return redirect()->route('agenda.index', ['fecha' => $request->input('fecha')]);
    }

    public function cancelar(Cita $cita): RedirectResponse
    {
        if ($cita->estado === Cita::ESTADO_CANCELADA) {
            return back()->withErrors(['cancelar' => 'La cita ya está cancelada.']);
        }

        if ($cita->estado === Cita::ESTADO_ATENDIDA) {
            return back()->withErrors(['cancelar' => 'No se puede cancelar una cita que ya fue atendida.']);
        }

        $cita->update(['estado' => Cita::ESTADO_CANCELADA]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Cita cancelada correctamente.']);

        return back();
    }

    public function destroy(Cita $cita): RedirectResponse
    {
        if ($cita->consulta()->exists()) {
            return back()->withErrors([
                'eliminar' => 'No se puede eliminar la cita porque tiene una consulta registrada.',
            ]);
        }

        $cita->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Cita eliminada correctamente.']);

        return redirect()->route('agenda.index');
    }

    /**
     * Mostrar formulario para reservar una cita.
     */
    public function crearPaciente(Request $request): Response
    {
        return Inertia::render('mis-citas/crear', [
            'especialidades' => Especialidad::query()
                ->select('id', 'nombre')
                ->withCount('medicos')
                ->orderBy('nombre')
                ->get(),

            'medicos' => $this->medicos(),

            'valores' => [
                'fecha' => (string) $request->query('fecha', now()->toDateString()),
                'medico_id' => $request->integer('medico_id') ?: null,
                'hora_inicio' => $request->query('hora'),
            ],
        ]);
    }

    /**
     * Guardar una nueva cita del paciente autenticado.
     */
    public function guardarPaciente(PacienteCitaRequest $request): RedirectResponse
    {
        try {
            Cita::create([
                ...$request->datosCita(),
                'estado' => Cita::ESTADO_PENDIENTE,
            ]);
        } catch (UniqueConstraintViolationException) {
            return back()->withInput()->withErrors([
                'hora_inicio' => 'Ya existe una cita del médico a esa hora.',
            ]);
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Tu cita fue reservada correctamente.',
        ]);

        return redirect()->route('dashboard');
    }

    /**
     * Mostrar formulario para reprogramar una cita propia.
     */
    public function reprogramarPaciente(Cita $cita): Response
    {
        $cita = $this->citaDelPaciente($cita);

        abort_unless(
            in_array($cita->estado, [
                Cita::ESTADO_PENDIENTE,
                Cita::ESTADO_CONFIRMADA,
            ], true),
            403,
            'Esta cita no se puede reprogramar.'
        );

        return Inertia::render('mis-citas/reprogramar', [
            'cita' => [
                'id' => $cita->id,
                'medico_id' => $cita->medico_id,
                'fecha' => $cita->inicia_en->format('Y-m-d'),
                'hora_inicio' => $cita->inicia_en->format('H:i'),
                'motivo' => $cita->motivo,
            ],
            'medicos' => $this->medicos(),
        ]);
    }

    /**
     * Actualizar fecha y hora de una cita propia.
     */
    public function actualizarPaciente(
        PacienteCitaRequest $request,
        Cita $cita
    ): RedirectResponse {
        $cita = $this->citaDelPaciente($cita);

        abort_unless(
            in_array($cita->estado, [
                Cita::ESTADO_PENDIENTE,
                Cita::ESTADO_CONFIRMADA,
            ], true),
            403,
            'Esta cita no se puede reprogramar.'
        );

        if ($request->integer('medico_id') !== $cita->medico_id) {
            return back()->withErrors([
                'medico_id' => 'Para reprogramar no puedes cambiar de médico. Cancela la cita y reserva una nueva.',
            ]);
        }

        try {
            $cita->update($request->datosCita());
        } catch (UniqueConstraintViolationException) {
            return back()->withInput()->withErrors([
                'hora_inicio' => 'Ya existe una cita del médico a esa hora.',
            ]);
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Tu cita fue reprogramada correctamente.',
        ]);

        return redirect()->route('dashboard');
    }

    /**
     * Cancelar una cita propia.
     */
    public function cancelarPaciente(Cita $cita): RedirectResponse
    {
        $cita = $this->citaDelPaciente($cita);

        abort_unless(
            in_array($cita->estado, [
                Cita::ESTADO_PENDIENTE,
                Cita::ESTADO_CONFIRMADA,
            ], true),
            403,
            'Esta cita no se puede cancelar.'
        );

        if ($cita->consulta()->exists()) {
            return back()->withErrors([
                'cancelar' => 'No se puede cancelar una cita que tiene una consulta registrada.',
            ]);
        }

        $cita->update([
            'estado' => Cita::ESTADO_CANCELADA,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Tu cita fue cancelada correctamente.',
        ]);

        return redirect()->route('dashboard');
    }

    /**
     * Consultar horarios disponibles y ocupados para un médico.
     */
    public function disponibilidadPaciente(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'medico_id' => ['required', 'integer', 'exists:medicos,id'],
            'fecha' => ['required', 'date_format:Y-m-d', 'after_or_equal:today'],
        ]);

        $medico = Medico::query()->whereKey($datos['medico_id'])->firstOrFail();

        $fecha = Carbon::createFromFormat('Y-m-d', $datos['fecha']);
        $diaSemana = $fecha->dayOfWeekIso;

        $duracion = $medico->duracion_cita ?: 30;

        $bloques = Horario::query()
            ->where('medico_id', $medico->id)
            ->where('dia_semana', $diaSemana)
            ->orderBy('hora_inicio')
            ->get();

        $horarios = [];

        foreach ($bloques as $bloque) {
            $desde = Carbon::parse(
                $fecha->toDateString().' '.$bloque->hora_inicio
            );

            $hasta = Carbon::parse(
                $fecha->toDateString().' '.$bloque->hora_fin
            );

            for (
                $inicio = $desde->copy();
                $inicio->copy()->addMinutes($duracion)->lessThanOrEqualTo($hasta);
                $inicio->addMinutes($duracion)
            ) {
                $fin = $inicio->copy()->addMinutes($duracion);

                $motivo = $inicio->isPast()
                    ? 'Este horario ya pasó.'
                    : app(DisponibilidadCitas::class)->motivo(
                        $medico->id,
                        $inicio,
                        $fin
                    );

                $horarios[] = [
                    'hora_inicio' => $inicio->format('H:i'),
                    'hora_fin' => $fin->format('H:i'),
                    'disponible' => $motivo === null,
                    'motivo' => $motivo,
                ];
            }
        }

        return response()->json([
            'fecha' => $fecha->toDateString(),
            'duracion' => $duracion,
            'horarios' => $horarios,
        ]);
    }

    /**
     * Obtener una cita y comprobar que pertenece al paciente autenticado.
     */
    private function citaDelPaciente(Cita $cita): Cita
    {
        abort_unless(
            $cita->paciente()->where(
                'usuario_id',
                auth()->id()
            )->exists(),
            403,
            'No tienes permiso para gestionar esta cita.'
        );

        return $cita;
    }

    /**
     * @return array<int, array{id: int, nombre: string}>
     */
    private function pacientes(): array
    {
        return Paciente::with('usuario:id,name')
            ->get()
            ->map(fn (Paciente $paciente) => [
                'id' => $paciente->id,
                'nombre' => $paciente->usuario->name,
            ])
            ->sortBy('nombre')
            ->values()
            ->all();
    }

    /**
     * @return array<int, array{id: int, nombre: string, especialidad: string, duracion_cita: int, consultorio: string|null}>
     */
    private function medicos(): array
    {
        return Medico::with(['usuario:id,name', 'especialidad:id,nombre'])
            ->get()
            ->map(fn (Medico $medico) => [
                'id' => $medico->id,
                'nombre' => $medico->usuario->name,
                'especialidad_id' => $medico->especialidad_id,
                'especialidad' => $medico->especialidad->nombre,
                'duracion_cita' => $medico->duracion_cita,
                'consultorio' => $medico->consultorio,
            ])
            ->sortBy('nombre')
            ->values()
            ->all();
    }
}
