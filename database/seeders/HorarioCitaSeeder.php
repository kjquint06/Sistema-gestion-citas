<?php

namespace Database\Seeders;

use App\Models\Cita;
use App\Models\Horario;
use App\Models\Medico;
use App\Models\Paciente;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class HorarioCitaSeeder extends Seeder
{
    public function run(): void
    {
        $medicos = Medico::all();
        $pacientes = Paciente::all();

        if ($medicos->isEmpty() || $pacientes->isEmpty()) {
            $this->command?->warn('Faltan médicos o pacientes: ejecuta primero sus seeders.');

            return;
        }

        // Horarios: lunes a viernes, mañana y tarde
        foreach ($medicos as $medico) {
            foreach (range(1, 5) as $dia) {
                foreach ([['08:00', '12:00'], ['14:00', '17:00']] as [$inicio, $fin]) {
                    Horario::firstOrCreate([
                        'medico_id' => $medico->id,
                        'dia_semana' => $dia,
                        'hora_inicio' => $inicio,
                        'hora_fin' => $fin,
                    ]);
                }
            }
        }

        // Citas de ejemplo (sin cruces: cada una usa un bloque distinto del médico)
        $lunesPasado = Carbon::parse('last monday')->setTime(8, 0);
        $lunesProximo = Carbon::parse('next monday')->setTime(8, 0);

        foreach ($medicos as $medico) {
            $duracion = $medico->duracion_cita ?: 30;

            for ($i = 0; $i < 3; $i++) {
                $this->crearCita($medico, $pacientes[$i % $pacientes->count()], $lunesPasado->copy()->addMinutes($i * $duracion), $duracion, Cita::ESTADO_ATENDIDA, 'Control general');
            }

            $estados = [Cita::ESTADO_PENDIENTE, Cita::ESTADO_CONFIRMADA, Cita::ESTADO_PENDIENTE];
            foreach ($estados as $i => $estado) {
                $this->crearCita($medico, $pacientes[$i % $pacientes->count()], $lunesProximo->copy()->addMinutes($i * $duracion), $duracion, $estado, 'Consulta de seguimiento');
            }
        }
    }

    private function crearCita(Medico $medico, Paciente $paciente, Carbon $inicio, int $duracion, string $estado, string $motivo): void
    {
        Cita::firstOrCreate(
            ['medico_id' => $medico->id, 'inicia_en' => $inicio],
            [
                'paciente_id' => $paciente->id,
                'termina_en' => $inicio->copy()->addMinutes($duracion),
                'estado' => $estado,
                'motivo' => $motivo,
            ]
        );
    }
}
