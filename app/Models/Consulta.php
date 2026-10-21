<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Consulta extends Model
{
    /** @use HasFactory<Factory<Consulta>> */
    use HasFactory;

    protected $table = 'consultas';

    protected $fillable = [
        'cita_id',
        'sintomas',
        'diagnostico',
        'notas',
        'signos_vitales',
    ];

    protected function casts(): array
    {
        return [
            'signos_vitales' => 'array',
        ];
    }

    /** @return BelongsTo<Cita, $this> */
    public function cita(): BelongsTo
    {
        return $this->belongsTo(Cita::class);
    }

    /** @return HasMany<Receta, $this> */
    public function recetas(): HasMany
    {
        return $this->hasMany(Receta::class);
    }
}
