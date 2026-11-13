<?php

namespace App\Http\Controllers;

use App\Http\Requests\PacienteRequest;
use App\Models\Paciente;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PacienteController extends Controller
{
    public function index(Request $request): Response
    {
        $buscar = trim((string) $request->string('buscar'));

        $pacientes = Paciente::query()
            ->with('usuario')
            ->when($buscar !== '', fn (Builder $query) => $query->whereHas(
                'usuario',
                fn (Builder $usuario) => $usuario->where('name', 'like', '%'.$buscar.'%')
            ))
            ->get()
            ->sortBy(fn (Paciente $paciente) => $paciente->usuario->name)
            ->values()
            ->map(fn (Paciente $paciente) => [
                'id' => $paciente->id,
                'nombre' => $paciente->usuario->name,
                'documento' => $paciente->documento,
                'telefono' => $paciente->usuario->telefono,
                'correo' => $paciente->usuario->email,
            ]);

        return Inertia::render('pacientes/index', [
            'pacientes' => $pacientes,
            'filtros' => ['buscar' => $buscar],
            'puedeGestionar' => $request->user()?->tieneRol(User::ROL_RECEPCIONISTA, User::ROL_ADMIN) ?? false,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('pacientes/create');
    }

    public function store(PacienteRequest $request): RedirectResponse
    {
        $datos = $request->validated();

        DB::transaction(function () use ($datos) {
            $usuario = User::create([
                'name' => $datos['nombre'],
                'email' => $datos['correo'],
                'telefono' => $datos['telefono'],
                'rol' => User::ROL_PACIENTE,

                'password' => Str::password(16),
            ]);

            $usuario->paciente()->create($this->datosPaciente($datos));
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Paciente registrado correctamente.']);

        return redirect()->route('pacientes.index');
    }

    public function show(Paciente $paciente): Response
    {
        $paciente->load('usuario')->loadCount('citas');

        return Inertia::render('pacientes/show', [
            'paciente' => [
                ...$this->formatear($paciente),
                'citas_count' => (int) $paciente->citas_count,
            ],
        ]);
    }

    public function edit(Paciente $paciente): Response
    {
        $paciente->load('usuario');

        return Inertia::render('pacientes/edit', [
            'paciente' => $this->formatear($paciente),
        ]);
    }

    public function update(PacienteRequest $request, Paciente $paciente): RedirectResponse
    {
        $datos = $request->validated();

        DB::transaction(function () use ($datos, $paciente) {
            $paciente->usuario->update([
                'name' => $datos['nombre'],
                'email' => $datos['correo'],
                'telefono' => $datos['telefono'],
            ]);

            $paciente->update($this->datosPaciente($datos));
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Paciente actualizado correctamente.']);

        return redirect()->route('pacientes.index');
    }

    public function destroy(Paciente $paciente): RedirectResponse
    {
        if ($paciente->tieneDatosRelacionados()) {
            return back()->withErrors([
                'eliminar' => 'No se puede eliminar a "'.$paciente->usuario->name.'" porque tiene citas o expediente registrados.',
            ]);
        }

        $paciente->usuario->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Paciente eliminado correctamente.']);

        return redirect()->route('pacientes.index');
    }

    /**
     * @param  array<string, mixed>  $datos
     * @return array<string, mixed>
     */
    private function datosPaciente(array $datos): array
    {
        return [
            'documento' => $datos['documento'],
            'fecha_nacimiento' => $datos['fecha_nacimiento'],
            'sexo' => $datos['sexo'],
            'direccion' => $datos['direccion'] ?? null,
            'contacto_emergencia' => $datos['contacto_emergencia'] ?? null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function formatear(Paciente $paciente): array
    {
        return [
            'id' => $paciente->id,
            'nombre' => $paciente->usuario->name,
            'documento' => $paciente->documento,
            'telefono' => $paciente->usuario->telefono,
            'correo' => $paciente->usuario->email,
            'fecha_nacimiento' => $paciente->fecha_nacimiento?->format('Y-m-d'),
            'sexo' => $paciente->sexo,
            'direccion' => $paciente->direccion,
            'contacto_emergencia' => $paciente->contacto_emergencia,
        ];
    }
}
