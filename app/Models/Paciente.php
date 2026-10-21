<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Paciente extends Model
{
    protected $fillable = [
        'usuario_id',
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
}
