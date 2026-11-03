<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class UsuarioController extends Controller
{
    public function index(): Response
    {
        $usuarios = User::query()
            ->select('id', 'name', 'email', 'rol', 'telefono')
            ->latest()
            ->get();

        return Inertia::render('usuarios/index', [
            'usuarios' => $usuarios,
        ]);
    }
}
