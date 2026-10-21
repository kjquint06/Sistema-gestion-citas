<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
}
