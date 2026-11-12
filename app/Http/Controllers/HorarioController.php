<?php

namespace App\Http\Controllers;

use App\Http\Requests\HorarioRequest;
use App\Models\Horario;
use App\Models\Medico;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HorarioController extends Controller
{
    private const DIAS = [
        1 => 'Lunes',
        2 => 'Martes',
        3 => 'Miércoles',
        4 => 'Jueves',
        5 => 'Viernes',
        6 => 'Sábado',
        7 => 'Domingo',
    ];

    public function index(Request $request): Response
    {
        $medicoId = $request->integer('medico_id') ?: null;

        $horarios = Horario::with('medico.usuario')
            ->when($medicoId, fn ($query) => $query->where('medico_id', $medicoId))
            ->orderBy('medico_id')
            ->orderBy('dia_semana')
            ->orderBy('hora_inicio')
            ->get()
            ->map(fn (Horario $horario) => [
                'id' => $horario->id,
                'medico' => $horario->medico->usuario->name,
                'dia' => self::DIAS[$horario->dia_semana] ?? (string) $horario->dia_semana,
                'hora_inicio' => substr((string) $horario->hora_inicio, 0, 5),
                'hora_fin' => substr((string) $horario->hora_fin, 0, 5),
            ]);

        return Inertia::render('horarios/index', [
            'horarios' => $horarios,
            'medicos' => $this->medicos(),
            'filtros' => ['medico_id' => $medicoId],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('horarios/create', [
            'medicos' => $this->medicos(),
            'dias' => $this->dias(),
        ]);
    }

    public function store(HorarioRequest $request): RedirectResponse
    {
        Horario::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Horario creado correctamente.']);

        return redirect()->route('horarios.index');
    }

    public function edit(Horario $horario): Response
    {
        return Inertia::render('horarios/edit', [
            'horario' => [
                'id' => $horario->id,
                'medico_id' => $horario->medico_id,
                'dia_semana' => $horario->dia_semana,
                'hora_inicio' => substr((string) $horario->hora_inicio, 0, 5),
                'hora_fin' => substr((string) $horario->hora_fin, 0, 5),
            ],
            'medicos' => $this->medicos(),
            'dias' => $this->dias(),
        ]);
    }

    public function update(HorarioRequest $request, Horario $horario): RedirectResponse
    {
        $horario->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Horario actualizado correctamente.']);

        return redirect()->route('horarios.index');
    }

    public function destroy(Horario $horario): RedirectResponse
    {
        $citas = $horario->citasAsignadas()->count();

        if ($citas > 0) {
            return back()->withErrors([
                'eliminar' => $citas === 1
                    ? 'No se puede eliminar el horario porque tiene 1 cita asignada.'
                    : "No se puede eliminar el horario porque tiene {$citas} citas asignadas.",
            ]);
        }

        $horario->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Horario eliminado correctamente.']);

        return redirect()->route('horarios.index');
    }

    /**
     * @return array<int, array{id: int, nombre: string}>
     */
    private function medicos(): array
    {
        return Medico::with('usuario:id,name')
            ->get()
            ->map(fn (Medico $medico) => [
                'id' => $medico->id,
                'nombre' => $medico->usuario->name,
            ])
            ->sortBy('nombre')
            ->values()
            ->all();
    }

    /**
     * @return array<int, array{valor: int, etiqueta: string}>
     */
    private function dias(): array
    {
        $dias = [];

        foreach (self::DIAS as $valor => $etiqueta) {
            $dias[] = ['valor' => $valor, 'etiqueta' => $etiqueta];
        }

        return $dias;
    }
}
