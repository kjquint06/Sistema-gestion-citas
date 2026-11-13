<?php

namespace App\Http\Controllers\Paciente;

use App\Http\Controllers\Controller;
use App\Models\Cita;
use Illuminate\Http\Request;

class MisCitasController extends Controller
{
    /** @return array<string, mixed> */
    public function datos(Request $request): array
    {
        $usuario = $request->user();
        $paciente = $usuario->paciente;

        abort_unless($paciente !== null, 403);

        $base = Cita::with(['medico.usuario', 'medico.especialidad', 'consulta'])
            ->where('paciente_id', $paciente->id);

        $proximas = (clone $base)
            ->where('inicia_en', '>=', today())
            ->whereNotIn('estado', [
                Cita::ESTADO_CANCELADA,
                Cita::ESTADO_ATENDIDA,
                Cita::ESTADO_INASISTENCIA,
            ])
            ->orderBy('inicia_en')
            ->get()
            ->map(fn (Cita $cita) => $this->formatearCita($cita))
            ->values();

        $pasadas = (clone $base)
            ->where('estado', Cita::ESTADO_ATENDIDA)
            ->orderByDesc('inicia_en')
            ->limit(10)
            ->get()
            ->map(fn (Cita $cita) => $this->formatearCita($cita))
            ->values();

        return [
            'paciente' => [
                'id' => $paciente->id,
                'nombre' => $usuario->name,
                'expediente' => 'EXP-'.str_pad((string) $paciente->id, 4, '0', STR_PAD_LEFT),
                'edad' => $paciente->fecha_nacimiento?->age,
            ],
            'proximaCita' => $proximas->first(),
            'proximas' => $proximas,
            'pasadas' => $pasadas,
            'ultimaReceta' => $base->get()
                ->filter(fn (Cita $cita) => $cita->consulta !== null)
                ->flatMap(fn (Cita $cita) => $cita->consulta->recetas->map(
                    fn ($receta) => [
                        'id' => $receta->id,
                        'fecha' => $cita->inicia_en->format('d/m/Y'),
                        'medicamento' => $receta->medicamento,
                        'dosis' => $receta->dosis,
                        'frecuencia' => $receta->frecuencia,
                        'duracion' => $receta->duracion,
                    ]
                ))
                ->sortByDesc('fecha_orden')
                ->first(),
        ];
    }

    /** @return array<string, mixed> */
    private function formatearCita(Cita $cita): array
    {
        return [
            'id' => $cita->id,
            'inicia_en' => $cita->inicia_en->toIso8601String(),
            'termina_en' => $cita->termina_en->toIso8601String(),
            'duracion' => (int) abs($cita->inicia_en->diffInMinutes($cita->termina_en)),
            'estado' => $cita->estado,
            'motivo' => $cita->motivo,
            'hora_llegada' => $cita->hora_llegada?->format('H:i'),
            'medico' => $cita->medico->usuario->name ?? 'No disponible',
            'especialidad' => $cita->medico->especialidad->nombre ?? 'No disponible',
            'consultorio' => $cita->medico->consultorio,
            'consulta_id' => $cita->consulta?->id,
        ];
    }
}
