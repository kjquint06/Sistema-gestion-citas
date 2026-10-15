<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Especialidad extends Model
{
    protected $table = 'especialidades';

    protected $fillable = ['nombre'];

    public function medicos()
    {
        return $this->hasMany(Medico::class);
    }
    
}
