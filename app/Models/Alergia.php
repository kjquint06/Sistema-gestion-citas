<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Alergia extends Model
{
    protected $table = 'alergias';

    protected $fillable = [
        'paciente_id',
        'alergeno',
        'gravedad',
        'reaccion',
    ];

    /**
     * @return BelongsTo<Paciente, $this>
     */
    public function paciente(): BelongsTo
    {
        return $this->belongsTo(Paciente::class);
    }
}
