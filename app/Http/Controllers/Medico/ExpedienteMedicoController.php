<?php

namespace App\Http\Controllers\Medico;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Paciente\MiExpedienteController;
use App\Models\Cita;
use App\Models\Paciente;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExpedienteMedicoController extends Controller
{
    /**
     * Expediente de solo lectura de un paciente, para el médico.
     * Solo de pacientes con los que tiene o tuvo una cita.
     */
    public function show(Request $request, Paciente $paciente): Response
    {
        $medico = $request->user()?->medico;

        abort_if($medico === null, 403, 'Tu usuario no tiene un perfil de médico.');

        $esSuPaciente = Cita::query()
            ->where('medico_id', $medico->id)
            ->where('paciente_id', $paciente->id)
            ->exists();

        abort_unless($esSuPaciente, 403, 'Solo puedes ver el expediente de tus pacientes.');

        return Inertia::render('pacientes/mi-expediente', [
            ...app(MiExpedienteController::class)->datosExpediente($paciente),
            'encabezado' => [
                'titulo' => 'Expediente de '.$paciente->usuario->name,
                'descripcion' => 'Vista de solo lectura para el médico tratante.',
            ],
        ]);
    }
}
