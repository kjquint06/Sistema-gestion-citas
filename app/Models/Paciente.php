<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function alergias()
    {
        return $this->hasMany(Alergia::class);
    }
}
