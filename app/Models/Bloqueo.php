<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Bloqueo extends Model
{
    protected $table = 'bloqueos';

    protected $fillable = [
        'medico_id',
        'inicia_en',
        'termina_en',
        'motivo',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'inicia_en' => 'datetime',
            'termina_en' => 'datetime',
        ];
    }

    /** @return BelongsTo<Medico, $this> */
    public function medico(): BelongsTo
    {
        return $this->belongsTo(Medico::class);
    }
}
