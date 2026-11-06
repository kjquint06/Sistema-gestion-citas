<?php

namespace App\Http\Controllers;

use App\Http\Requests\MedicoRequest;
use App\Models\Especialidad;
use App\Models\Horario;
use App\Models\Medico;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class MedicoController extends Controller
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
        $buscar = trim((string) $request->query('buscar', ''));

        $medicos = Medico::with(['usuario', 'especialidad'])
            ->when($buscar !== '', fn ($query) => $query->whereHas(
                'usuario',
                fn ($usuario) => $usuario->where('name', 'like', '%'.$buscar.'%')
            ))
            ->get()
            ->sortBy(fn (Medico $medico) => $medico->usuario->name)
            ->values()
            ->map(fn (Medico $medico) => [
                'id' => $medico->id,
                'nombre' => $medico->usuario->name,
                'correo' => $medico->usuario->email,
                'especialidad' => $medico->especialidad->nombre,
                'numero_colegiado' => $medico->numero_colegiado,
                'duracion_cita' => $medico->duracion_cita,
            ]);

        return Inertia::render('medicos/index', [
            'medicos' => $medicos,
            'filtros' => ['buscar' => $buscar],
        ]);
    }

    public function create(): Response
    {
        $usuarios = User::where('rol', User::ROL_MEDICO)
            ->whereDoesntHave('medico')
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('medicos/create', [
            'especialidades' => Especialidad::orderBy('nombre')->get(['id', 'nombre']),
            'usuarios_disponibles' => $usuarios,
        ]);
    }

    public function store(MedicoRequest $request): RedirectResponse
    {
        $datos = $request->validated();

        DB::transaction(function () use ($datos) {
            if ($datos['modo_usuario'] === 'nuevo') {
                $usuario = User::create([
                    'name' => $datos['name'],
                    'email' => $datos['email'],
                    'telefono' => $datos['telefono'] ?? null,
                    'password' => $datos['password'],
                    'rol' => User::ROL_MEDICO,
                ]);

                // Las rutas exigen correo verificado
                $usuario->forceFill(['email_verified_at' => now()])->save();
                $usuarioId = $usuario->id;
            } else {
                $usuarioId = $datos['usuario_id'];
            }

            Medico::create([
                'usuario_id' => $usuarioId,
                'especialidad_id' => $datos['especialidad_id'],
                'numero_colegiado' => $datos['numero_colegiado'],
                'duracion_cita' => $datos['duracion_cita'],
            ]);
        });

        return redirect()
            ->route('medicos.index')
            ->with('success', 'Médico creado correctamente.');
    }

    public function edit(Medico $medico): Response
    {
        $medico->load('usuario');

        return Inertia::render('medicos/edit', [
            'medico' => [
                'id' => $medico->id,
                'nombre' => $medico->usuario->name,
                'correo' => $medico->usuario->email,
                'especialidad_id' => $medico->especialidad_id,
                'numero_colegiado' => $medico->numero_colegiado,
                'duracion_cita' => $medico->duracion_cita,
            ],
            'especialidades' => Especialidad::orderBy('nombre')->get(['id', 'nombre']),
        ]);
    }

    public function update(MedicoRequest $request, Medico $medico): RedirectResponse
    {
        $medico->update($request->validated());

        return redirect()
            ->route('medicos.index')
            ->with('success', 'Médico actualizado correctamente.');
    }

    public function destroy(Medico $medico): RedirectResponse
    {
        if ($medico->citas()->exists()) {
            return back()->withErrors([
                'eliminar' => 'No se puede eliminar al médico porque tiene citas registradas.',
            ]);
        }

        $medico->delete();

        return redirect()
            ->route('medicos.index')
            ->with('success', 'Médico eliminado correctamente.');
    }

    public function disponibilidad(): Response
    {
        $horarios = Horario::with('medico.usuario')
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

        return Inertia::render('disponibilidad/index', [
            'horarios' => $horarios,
        ]);
    }
}
