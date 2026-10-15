<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Alergia extends Model
{
    protected $table = 'alergias';

    protected $fillable = [
        'paciente_id',
        'alergeno',
        'gravedad',
        'reaccion',
    ];

    public function paciente()
    {
        return $this->belongsTo(Paciente::class);
    }
}
