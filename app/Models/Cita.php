<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Cita extends Model
{
    use HasFactory;

    public const ESTADO_PENDIENTE = 'pendiente';

    public const ESTADO_CONFIRMADA = 'confirmada';

    public const ESTADO_ATENDIDA = 'atendida';

    public const ESTADO_CANCELADA = 'cancelada';

    public const ESTADO_INASISTENCIA = 'inasistencia';

    protected $table = 'citas';

    protected $fillable = [
        'paciente_id',
        'medico_id',
        'inicia_en',
        'termina_en',
        'estado',
        'motivo',
    ];

    protected function casts(): array
    {
        return [
            'inicia_en' => 'datetime',
            'termina_en' => 'datetime',
        ];
    }

    public function paciente(): BelongsTo
    {
        return $this->belongsTo(Paciente::class);
    }

    public function medico(): BelongsTo
    {
        return $this->belongsTo(Medico::class);
    }

    public function consulta(): HasOne
    {
        return $this->hasOne(Consulta::class);
    }
}
