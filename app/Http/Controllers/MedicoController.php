<?php

namespace App\Http\Controllers;

use App\Models\Horario;
use App\Models\Medico;
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

    public function index(): Response
    {
        $medicos = Medico::with(['usuario', 'especialidad'])
            ->get()
            ->map(fn (Medico $medico) => [
                'id' => $medico->id,
                'nombre' => $medico->usuario->name,
                'especialidad' => $medico->especialidad->nombre,
                'numero_colegiado' => $medico->numero_colegiado,
                'duracion_cita' => $medico->duracion_cita,
            ]);

        return Inertia::render('medicos/index', [
            'medicos' => $medicos,
        ]);
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
