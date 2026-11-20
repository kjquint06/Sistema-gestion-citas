<?php

namespace Database\Seeders;

use App\Models\Cita;
use App\Models\Medico;
use App\Models\Paciente;
use Illuminate\Database\Seeder;

class CitasDeHoySeeder extends Seeder
{
    public function run(): void
    {
        $pacientes = Paciente::take(4)->get();

        if ($pacientes->isEmpty()) {
            $this->command->warn('No hay pacientes. Crea al menos uno antes de ejecutar este seeder.');

            return;
        }

        $plan = [
            [9, 0, Cita::ESTADO_ATENDIDA],
            [10, 0, Cita::ESTADO_EN_ESPERA],
            [11, 0, Cita::ESTADO_CONFIRMADA],
            [14, 0, Cita::ESTADO_PENDIENTE],
        ];

        foreach (Medico::all() as $medico) {
            foreach ($plan as $i => [$h, $m, $estado]) {
                $inicio = now()->setTime($h, $m);

                Cita::updateOrCreate(
                    [
                        'medico_id' => $medico->id,
                        'inicia_en' => $inicio,
                    ],
                    [
                        'paciente_id' => $pacientes[$i % $pacientes->count()]->id,
                        'termina_en' => $inicio->copy()->addMinutes((int) $medico->duracion_cita),
                        'estado' => $estado,
                        'motivo' => 'Consulta de prueba',
                        'hora_llegada' => $estado === Cita::ESTADO_EN_ESPERA ? $inicio : null,
                    ],
                );
            }
        }
    }
}
