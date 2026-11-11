<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Collection;

class Horario extends Model
{
    /** @use HasFactory<Factory<Horario>> */
    use HasFactory;

    protected $table = 'horarios';

    protected $fillable = [
        'medico_id',
        'dia_semana',
        'hora_inicio',
        'hora_fin',
    ];

    /** @return BelongsTo<Medico, $this> */
    public function medico(): BelongsTo
    {
        return $this->belongsTo(Medico::class);
    }

    /**
     * Citas vigentes (de hoy en adelante y no canceladas) del médico
     * que caen dentro de este bloque de horario.
     *
     * @return Collection<int, Cita>
     */
    public function citasAsignadas(): Collection
    {
        return Cita::query()
            ->where('medico_id', $this->medico_id)
            ->where('estado', '!=', Cita::ESTADO_CANCELADA)
            ->where('inicia_en', '>=', now()->startOfDay())
            ->get()
            ->filter(function (Cita $cita): bool {
                if ($cita->inicia_en->dayOfWeekIso !== (int) $this->dia_semana) {
                    return false;
                }

                $desde = $cita->inicia_en->copy()->setTimeFromTimeString((string) $this->hora_inicio);
                $hasta = $cita->inicia_en->copy()->setTimeFromTimeString((string) $this->hora_fin);

                return $cita->inicia_en->greaterThanOrEqualTo($desde)
                    && $cita->termina_en->lessThanOrEqualTo($hasta);
            })
            ->values();
    }
}