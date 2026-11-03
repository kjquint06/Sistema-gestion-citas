<?php

namespace App\Http\Controllers;

use App\Models\Especialidad;
use Inertia\Inertia;
use Inertia\Response;

class EspecialidadController extends Controller
{
    public function index(): Response
    {
        $especialidades = Especialidad::withCount('medicos')->get();

        return Inertia::render('especialidades/index', [
            'especialidades' => $especialidades,
        ]);
    }
}
