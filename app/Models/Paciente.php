<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

/**
 * @property CarbonInterface|null $fecha_nacimiento
 */
class Paciente extends Model
{
    protected $fillable = [
        'usuario_id',
        'documento',
        'fecha_nacimiento',
        'sexo',
        'direccion',
        'contacto_emergencia',
    ];

    protected function casts(): array
    {
        return [
            'fecha_nacimiento' => 'date',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    /**
     * @return HasMany<Alergia, $this>
     */
    public function alergias(): HasMany
    {
        return $this->hasMany(Alergia::class);
    }

    /**
     * @return HasMany<Cita, $this>
     */
    public function citas(): HasMany
    {
        return $this->hasMany(Cita::class);
    }

    /**
     * @return HasMany<Antecedente, $this>
     */
    public function antecedentes(): HasMany
    {
        return $this->hasMany(Antecedente::class);
    }

    /**
     * @return HasManyThrough<Consulta, Cita, $this>
     */
    public function consultas(): HasManyThrough
    {
        return $this->hasManyThrough(Consulta::class, Cita::class);
    }

    /**
     * Indica si el paciente tiene citas o expediente (alergias o antecedentes).
     * Si es así, no se puede eliminar.
     */
    public function tieneDatosRelacionados(): bool
    {
        return $this->citas()->exists()
            || $this->alergias()->exists()
            || $this->antecedentes()->exists();
    }
}
