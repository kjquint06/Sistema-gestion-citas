<?php

namespace App\Http\Controllers;

use App\Models\Cita;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class AgendaController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var User $usuario */
        $usuario = $request->user();

        $query = Cita::with(['paciente.usuario', 'medico.usuario'])
            ->orderBy('inicia_en');

        // Admin y recepción ven todas las citas; médico y paciente solo las suyas
        if ($usuario->tieneRol(User::ROL_MEDICO)) {
            $query->where('medico_id', $usuario->medico?->id);
        } elseif ($usuario->tieneRol(User::ROL_PACIENTE)) {
            $query->where('paciente_id', $usuario->paciente?->id);
        } elseif (! $usuario->tieneRol(User::ROL_ADMIN, User::ROL_RECEPCIONISTA)) {
            $query->whereRaw('1 = 0');
        }

        $citas = $query->get()->map(function (Cita $cita) {
            $inicio = Carbon::parse($cita->inicia_en);
            $fin = Carbon::parse($cita->termina_en);

            return [
                'id' => $cita->id,
                'paciente' => $cita->paciente->usuario->name,
                'medico' => $cita->medico->usuario->name,
                'fecha' => $inicio->format('d/m/Y'),
                'hora' => $inicio->format('H:i').' - '.$fin->format('H:i'),
                'estado' => $cita->estado,
            ];
        });

        return Inertia::render('agenda/index', [
            'citas' => $citas,
        ]);
    }
}
