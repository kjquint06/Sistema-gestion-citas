<?php

namespace Database\Seeders;

use App\Models\Especialidad;
use Illuminate\Database\Seeder;

class EspecialidadSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (['Medicina General', 'Pediatría', 'Ginecología', 'Cardiología'] as $nombre) {
            Especialidad::firstOrCreate(['nombre' => $nombre]);
        }
    }
}
