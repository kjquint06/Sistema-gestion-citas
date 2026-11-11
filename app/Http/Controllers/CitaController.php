<?php

namespace App\Http\Controllers;

use App\Http\Requests\CitaRequest;
use App\Models\Cita;
use App\Models\Medico;
use App\Models\Paciente;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
                'especialidad' => $medico->especialidad->nombre,
                'duracion_cita' => $medico->duracion_cita,
                'consultorio' => $medico->consultorio,
            ])
            ->sortBy('nombre')
            ->values()
            ->all();
    }
}