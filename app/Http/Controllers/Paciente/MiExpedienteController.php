<?php

namespace App\Http\Controllers\Paciente;

use App\Http\Controllers\Controller;
use App\Models\Consulta;
use App\Models\Alergia;
use App\Models\Antecedente;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MiExpedienteController extends Controller
{
    public function index(Request $request): Response
    {
        $usuario = $request->user();
        $paciente = $usuario->paciente;

        abort_unless($paciente !== null, 403);

        $consultas = $paciente->consultas()
            ->with(['cita.medico.usuario', 'cita.medico.especialidad', 'recetas'])
            ->orderByDesc('citas.inicia_en')
            ->get()
            ->map(fn (Consulta $consulta) => [
                'id' => $consulta->id,
                'fecha' => $consulta->cita->inicia_en->toIso8601String(),
                'medico' => $consulta->cita->medico->usuario->name ?? 'No disponible',
                'especialidad' => $consulta->cita->medico->especialidad->nombre ?? 'No disponible',
                'sintomas' => $consulta->sintomas,
                'diagnostico' => $consulta->diagnostico,
                'motivo' => $consulta->cita->motivo,
                'notas' => $consulta->notas,
                'signos_vitales' => $consulta->signos_vitales,
                'recetas' => $consulta->recetas->map(fn ($receta) => [
                    'id' => $receta->id,
                    'medicamento' => $receta->medicamento,
                    'dosis' => $receta->dosis,
                    'frecuencia' => $receta->frecuencia,
                    'duracion' => $receta->duracion,
                ])->values(),
            ])
            ->values();

        return Inertia::render('pacientes/mi-expediente', [
            'paciente' => [
                'id' => $paciente->id,
                'nombre' => $usuario->name,
                'correo' => $usuario->email,
                'telefono' => $usuario->telefono,
                'expediente' => 'EXP-'.str_pad((string) $paciente->id, 4, '0', STR_PAD_LEFT),
                'edad' => $paciente->fecha_nacimiento?->age,
                'fecha_nacimiento' => $paciente->fecha_nacimiento?->format('d/m/Y'),
                'sexo' => $paciente->sexo,
                'direccion' => $paciente->direccion,
                'contacto_emergencia' => $paciente->contacto_emergencia,
            ],
            'alergias' => $paciente->alergias()
                ->get()
                ->map(fn (Alergia $alergia) => [
                    'id' => $alergia->id,
                    'alergeno' => $alergia->alergeno,
                    'gravedad' => $alergia->gravedad,
                    'reaccion' => $alergia->reaccion,
                    'registrada_en' => $alergia->created_at?->toIso8601String(),
                ])
                ->values(),
            'antecedentes' => $paciente->antecedentes()
                ->orderByDesc('fecha')
                ->get()
                ->map(fn (Antecedente $antecedente) => [
                    'id' => $antecedente->id,
                    'tipo' => $antecedente->tipo,
                    'descripcion' => $antecedente->descripcion,
                    'fecha' => $antecedente->fecha?->format('d/m/Y'),
                ])
                ->values(),
            'consultas' => $consultas,
        ]);
    }
}
