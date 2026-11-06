<?php

namespace App\Http\Controllers;

use App\Http\Requests\UsuarioRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UsuarioController extends Controller
{
    public function index(Request $request): Response
    {
        $rol = $request->string('rol')->toString();

        if (! in_array($rol, UsuarioRequest::ROLES, true)) {
            $rol = '';
        }

        $usuarios = User::query()
            ->select('id', 'name', 'email', 'rol', 'telefono')
            ->when($rol !== '', fn ($query) => $query->where('rol', $rol))
            ->orderBy('name')
            ->get();

        return Inertia::render('usuarios/index', [
            'usuarios' => $usuarios,
            'filtros' => ['rol' => $rol],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('usuarios/create');
    }

    public function store(UsuarioRequest $request): RedirectResponse
    {
        $usuario = new User($request->safe()->only(['name', 'email', 'telefono', 'rol', 'password']));

        // Las cuentas creadas por el administrador quedan verificadas para poder entrar
        $usuario->forceFill(['email_verified_at' => now()]);
        $usuario->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Usuario creado correctamente.']);

        return to_route('usuarios.index');
    }

    public function edit(Request $request, User $usuario): Response
    {
        return Inertia::render('usuarios/edit', [
            'usuario' => $usuario->only(['id', 'name', 'email', 'telefono', 'rol']),
            'esPropio' => $usuario->is($request->user()),
        ]);
    }

    public function update(UsuarioRequest $request, User $usuario): RedirectResponse
    {
        $datos = $request->safe()->only(['name', 'email', 'telefono', 'rol']);

        // La contraseña solo se cambia si se escribió una nueva
        if ($request->filled('password')) {
            $datos['password'] = $request->string('password')->toString();
        }

        $usuario->update($datos);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Usuario actualizado correctamente.']);

        return to_route('usuarios.index');
    }

    public function destroy(Request $request, User $usuario): RedirectResponse
    {
        if ($usuario->is($request->user())) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'No puedes eliminar tu propia cuenta.']);

            return back();
        }

        // No se borra si tiene un perfil de paciente o médico (con sus citas, expediente, etc.)
        if ($usuario->paciente()->exists() || $usuario->medico()->exists()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'No se puede eliminar a '.$usuario->name.' porque tiene un perfil de paciente o médico con datos relacionados.',
            ]);

            return back();
        }

        $usuario->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Usuario eliminado correctamente.']);

        return to_route('usuarios.index');
    }
}
