<?php

namespace App\Services;

use App\Models\Cita;
use App\Models\Horario;
use Carbon\CarbonInterface;

class DisponibilidadCitas
{
    /**
     * Devuelve el motivo por el que la cita no se puede guardar,
     * o null si el horario está libre y dentro de la atención del médico.
     *
     * Al editar una cita, pasa su id en $ignorarCitaId para que no se compare consigo misma.
     */
    public function motivo(int $medicoId, CarbonInterface $inicio, CarbonInterface $fin, ?int $ignorarCitaId = null): ?string
    {
        if ($fin->lessThanOrEqualTo($inicio)) {
            return 'La hora de fin debe ser posterior a la hora de inicio.';
        }

        if (! $inicio->isSameDay($fin)) {
            return 'La cita debe empezar y terminar el mismo día.';
        }

        if (! $this->dentroDeHorario($medicoId, $inicio, $fin)) {
            return 'La cita queda fuera del horario de atención del médico.';
        }

        $cruce = $this->citaEnCruce($medicoId, $inicio, $fin, $ignorarCitaId);

        if ($cruce !== null) {
            return 'Se cruza con otra cita del médico de '
                .$cruce->inicia_en->format('H:i').' a '.$cruce->termina_en->format('H:i').'.';
        }

        return null;
    }

    public function estaDisponible(int $medicoId, CarbonInterface $inicio, CarbonInterface $fin, ?int $ignorarCitaId = null): bool
    {
        return $this->motivo($medicoId, $inicio, $fin, $ignorarCitaId) === null;
    }

    private function dentroDeHorario(int $medicoId, CarbonInterface $inicio, CarbonInterface $fin): bool
    {
        return Horario::query()
            ->where('medico_id', $medicoId)
            ->where('dia_semana', $inicio->dayOfWeekIso)
            ->get()
            ->contains(function (Horario $horario) use ($inicio, $fin): bool {
                $desde = $inicio->copy()->setTimeFromTimeString((string) $horario->hora_inicio);
                $hasta = $inicio->copy()->setTimeFromTimeString((string) $horario->hora_fin);

                return $inicio->greaterThanOrEqualTo($desde) && $fin->lessThanOrEqualTo($hasta);
            });
    }

    private function citaEnCruce(int $medicoId, CarbonInterface $inicio, CarbonInterface $fin, ?int $ignorarCitaId): ?Cita
    {
        return Cita::query()
            ->where('medico_id', $medicoId)
            ->where('estado', '!=', Cita::ESTADO_CANCELADA)
            ->when($ignorarCitaId !== null, fn ($query) => $query->where('id', '!=', $ignorarCitaId))
            ->where('inicia_en', '<', $fin)
            ->where('termina_en', '>', $inicio)
            ->orderBy('inicia_en')
            ->first();
    }
}
