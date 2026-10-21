<?php

namespace Database\Seeders;

use App\Models\Cita;
use App\Models\Consulta;
use Illuminate\Database\Seeder;

class ConsultaRecetaSeeder extends Seeder
{
    public function run(): void
    {
        $citas = Cita::where('estado', Cita::ESTADO_ATENDIDA)->get();

        if ($citas->isEmpty()) {
            $this->command->warn('No hay citas atendidas: ejecuta primero HorarioCitaSeeder.');

            return;
        }

        $ejemplos = [
            [
                'sintomas' => 'Dolor de cabeza y fiebre leve desde hace dos días',
                'diagnostico' => 'Cuadro viral leve',
                'notas' => 'Reposo e hidratación. Volver si la fiebre persiste.',
                'signos_vitales' => ['presion' => '120/80', 'temperatura' => 37.8, 'frecuencia_cardiaca' => 78, 'peso' => 68],
                'recetas' => [
                    ['medicamento' => 'Paracetamol 500 mg', 'dosis' => '1 tableta', 'frecuencia' => 'Cada 8 horas', 'duracion' => '3 días'],
                ],
            ],
            [
                'sintomas' => 'Congestión nasal y tos seca',
                'diagnostico' => 'Rinitis alérgica',
                'notas' => 'Evitar polvo y cambios bruscos de temperatura.',
                'signos_vitales' => ['presion' => '110/70', 'temperatura' => 36.6, 'frecuencia_cardiaca' => 72, 'peso' => 60],
                'recetas' => [
                    ['medicamento' => 'Loratadina 10 mg', 'dosis' => '1 tableta', 'frecuencia' => 'Cada 24 horas', 'duracion' => '7 días'],
                    ['medicamento' => 'Suero fisiológico nasal', 'dosis' => '2 aplicaciones', 'frecuencia' => 'Cada 12 horas', 'duracion' => '7 días'],
                ],
            ],
            [
                'sintomas' => 'Control de rutina, sin molestias',
                'diagnostico' => 'Paciente sano',
                'notas' => 'Se recomienda control anual.',
                'signos_vitales' => ['presion' => '118/76', 'temperatura' => 36.5, 'frecuencia_cardiaca' => 70, 'peso' => 74],
                'recetas' => [],
            ],
        ];

        foreach ($citas as $i => $cita) {
            $ejemplo = $ejemplos[$i % count($ejemplos)];

            $consulta = Consulta::firstOrCreate(
                ['cita_id' => $cita->id],
                [
                    'sintomas' => $ejemplo['sintomas'],
                    'diagnostico' => $ejemplo['diagnostico'],
                    'notas' => $ejemplo['notas'],
                    'signos_vitales' => $ejemplo['signos_vitales'],
                ]
            );

            if ($consulta->wasRecentlyCreated) {
                foreach ($ejemplo['recetas'] as $receta) {
                    $consulta->recetas()->create($receta);
                }
            }
        }
    }
}
