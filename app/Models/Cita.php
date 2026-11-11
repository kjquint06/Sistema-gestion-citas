<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Cita extends Model
{
    /** @use HasFactory<Factory<Cita>> */
    use HasFactory;

    public const ESTADO_PENDIENTE = 'pendiente';

    public const ESTADO_CONFIRMADA = 'confirmada';

    public const ESTADO_EN_ESPERA = 'en_espera';

    public const ESTADO_EN_CONSULTA = 'en_consulta';

    public const ESTADO_ATENDIDA = 'atendida';

    public const ESTADO_CANCELADA = 'cancelada';

    public const ESTADO_INASISTENCIA = 'inasistencia';

    public const ESTADOS = [
        self::ESTADO_PENDIENTE,
        self::ESTADO_CONFIRMADA,
        self::ESTADO_EN_ESPERA,
        self::ESTADO_EN_CONSULTA,
        self::ESTADO_ATENDIDA,
        self::ESTADO_CANCELADA,
        self::ESTADO_INASISTENCIA,
    ];

    protected $table = 'citas';

    protected $fillable = [
        'paciente_id',
        'medico_id',
        'inicia_en',
        'termina_en',
        'hora_llegada',
        'estado',
        'motivo',
    ];

    protected function casts(): array
    {
        return [
            'inicia_en' => 'datetime',
            'termina_en' => 'datetime',
            'hora_llegada' => 'datetime',
        ];
    }

    /** @return BelongsTo<Paciente, $this> */
    public function paciente(): BelongsTo
    {
        return $this->belongsTo(Paciente::class);
    }

    /** @return BelongsTo<Medico, $this> */
    public function medico(): BelongsTo
    {
        return $this->belongsTo(Medico::class);
    }

    /** @return HasOne<Consulta, $this> */
    public function consulta(): HasOne
    {
        return $this->hasOne(Consulta::class);
    }
}