<?php

namespace App\Http\Controllers\Recepcion;

use App\Http\Controllers\Controller;
use App\Models\Cita;
use App\Models\Paciente;

class PanelController extends Controller
{
    /**
     * @return array<string, mixed>
     */
    public function datos(): array
    {
        $relaciones = ['paciente.usuario:id,name', 'medico.usuario:id,name'];

        $citasHoy = Cita::query()
            ->with($relaciones)
            ->whereDate('inicia_en', today())
            ->where('estado', '!=', Cita::ESTADO_CANCELADA)
            ->orderBy('inicia_en')
            ->get()
            ->map(fn (Cita $cita) => $this->formatearCita($cita));

        $pendientesQuery = Cita::query()
            ->where('estado', Cita::ESTADO_PENDIENTE)
            ->where('inicia_en', '>=', now());

        $pendientes = (clone $pendientesQuery)
            ->with($relaciones)
            ->orderBy('inicia_en')
            ->limit(10)
            ->get()
            ->map(fn (Cita $cita) => $this->formatearCita($cita));

        // 3. Pacientes nuevos (últimos 7 días)
        $nuevosQuery = Paciente::query()
            ->where('created_at', '>=', now()->subDays(7));

        $pacientesNuevos = (clone $nuevosQuery)
            ->with('usuario:id,name,email,telefono')
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn (Paciente $paciente) => [
                'id' => $paciente->id,
                'nombre' => $paciente->usuario->name,
                'documento' => $paciente->documento,
                'telefono' => $paciente->usuario->telefono,
                'registrado' => $paciente->created_at?->format('d/m/Y'),
            ]);

        return [
            'totales' => [
                'citas_hoy' => $citasHoy->count(),
                'pendientes' => (clone $pendientesQuery)->count(),
                'pacientes_nuevos' => (clone $nuevosQuery)->count(),
            ],
            'citasHoy' => $citasHoy,
            'pendientes' => $pendientes,
            'pacientesNuevos' => $pacientesNuevos,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function formatearCita(Cita $cita): array
    {
        return [
            'id' => $cita->id,
            'fecha' => $cita->inicia_en->format('d/m/Y'),
            'hora' => $cita->inicia_en->format('H:i'),
            'paciente' => $cita->paciente->usuario->name,
            'paciente_id' => $cita->paciente_id,
            'medico' => $cita->medico->usuario->name,
            'estado' => $cita->estado,
        ];
    }
}
