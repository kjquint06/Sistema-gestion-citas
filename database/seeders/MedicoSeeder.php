<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MedicoSeeder extends Seeder
{
    public function run(): void
    {
        $especialidades = ['Medicina General', 'Pediatría', 'Cardiología', 'Dermatología'];

        foreach ($especialidades as $nombre) {
            DB::table('especialidades')->updateOrInsert(
                ['nombre' => $nombre],
                ['created_at' => now(), 'updated_at' => now()]
            );
        }

        $idEspecialidad = fn (string $nombre) => DB::table('especialidades')->where('nombre', $nombre)->value('id');

        $medicos = [
            ['name' => 'Dr. Prueba',    'email' => 'medico@clinica.test',  'especialidad' => 'Medicina General', 'colegiado' => 'CMH-0001'],
            ['name' => 'Dra. Ana Morales', 'email' => 'ana@clinica.test',  'especialidad' => 'Pediatría',        'colegiado' => 'CMH-0002'],
            ['name' => 'Dr. Luis Fuentes', 'email' => 'luis@clinica.test', 'especialidad' => 'Cardiología',      'colegiado' => 'CMH-0003'],
        ];

        foreach ($medicos as $datos) {
            $usuario = User::updateOrCreate(
                ['email' => $datos['email']],
                [
                    'name' => $datos['name'],
                    'rol' => User::ROL_MEDICO,
                    'password' => 'password',
                    'telefono' => '99999999',
                    'email_verified_at' => now(),
                ]
            );

            DB::table('medicos')->updateOrInsert(
                ['usuario_id' => $usuario->id],
                [
                    'especialidad_id' => $idEspecialidad($datos['especialidad']),
                    'numero_colegiado' => $datos['colegiado'],
                    'duracion_cita' => 30,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}