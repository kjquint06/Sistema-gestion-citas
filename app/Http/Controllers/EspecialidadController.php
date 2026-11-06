<?php

namespace App\Http\Controllers;

use App\Http\Requests\EspecialidadRequest;
use App\Models\Especialidad;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class EspecialidadController extends Controller
{
    public function index(): Response
    {
        $especialidades = Especialidad::withCount('medicos')
            ->orderBy('nombre')
            ->get()
            ->map(fn (Especialidad $especialidad) => [
                'id' => $especialidad->id,
                'nombre' => $especialidad->nombre,
                'medicos_count' => (int) $especialidad->medicos_count,
            ]);

        return Inertia::render('especialidades/index', [
            'especialidades' => $especialidades,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('especialidades/create');
    }

    public function store(EspecialidadRequest $request): RedirectResponse
    {
        Especialidad::create($request->validated());

        return redirect()
            ->route('especialidades.index')
            ->with('success', 'Especialidad creada correctamente.');
    }

    public function edit(Especialidad $especialidad): Response
    {
        return Inertia::render('especialidades/edit', [
            'especialidad' => [
                'id' => $especialidad->id,
                'nombre' => $especialidad->nombre,
            ],
        ]);
    }

    public function update(EspecialidadRequest $request, Especialidad $especialidad): RedirectResponse
    {
        $especialidad->update($request->validated());

        return redirect()
            ->route('especialidades.index')
            ->with('success', 'Especialidad actualizada correctamente.');
    }

    public function destroy(Especialidad $especialidad): RedirectResponse
    {
        if ($especialidad->medicos()->exists()) {
            return back()->withErrors([
                'eliminar' => 'No se puede eliminar la especialidad "'.$especialidad->nombre.'" porque tiene médicos asignados.',
            ]);
        }

        $especialidad->delete();

        return redirect()
            ->route('especialidades.index')
            ->with('success', 'Especialidad eliminada correctamente.');
    }
}