<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Especialidad;

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
