<?php

namespace Database\Seeders;

use App\Models\Antecedente;
use App\Models\Paciente;
use Illuminate\Database\Seeder;

class AntecedenteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $datos = [
            'paciente@clinica.test' => [
                ['tipo' => 'Patológico', 'descripcion' => 'Asma diagnosticada en la infancia', 'fecha' => '2005-06-10'],
                ['tipo' => 'Familiar', 'descripcion' => 'Madre con hipertensión arterial', 'fecha' => null],
            ],
            'carlos.mejia@clinica.test' => [
                ['tipo' => 'Quirúrgico', 'descripcion' => 'Apendicectomía', 'fecha' => '2015-09-03'],
            ],
        ];

        foreach ($datos as $email => $antecedentes) {
            $paciente = Paciente::whereHas('usuario', fn ($q) => $q->where('email', $email))->first();

            if (! $paciente) {
                continue;
            }

            foreach ($antecedentes as $antecedente) {
                Antecedente::firstOrCreate(
                    ['paciente_id' => $paciente->id, 'descripcion' => $antecedente['descripcion']],
                    $antecedente
                );
            }
        }
    }
}
