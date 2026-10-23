<?php

namespace App\Http\Controllers;

use App\Models\Paciente;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class PacienteController extends Controller
{
    public function index(): Response
    {
        $pacientes = Paciente::with('usuario')
            ->get()
            ->map(fn (Paciente $paciente) => [
                'id' => $paciente->id,
                'nombre' => $paciente->usuario->name,
                'correo' => $paciente->usuario->email,
                'telefono' => $paciente->usuario->telefono,
                'fecha_nacimiento' => Carbon::parse($paciente->fecha_nacimiento)->format('d/m/Y'),
            ]);

        return Inertia::render('pacientes/index', [
            'pacientes' => $pacientes,
        ]);
    }
}
