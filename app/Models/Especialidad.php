<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Especialidad extends Model
{
    protected $table = 'especialidades';

    protected $fillable = ['nombre'];

    /**
     * @return HasMany<Medico, $this>
     */
    public function medicos(): HasMany
    {
        return $this->hasMany(Medico::class);
    }
}
