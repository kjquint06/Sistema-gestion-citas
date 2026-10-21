<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $usuarios = [
            ['name' => 'Administrador',   'email' => 'admin@clinica.test',     'rol' => User::ROL_ADMIN],
            ['name' => 'Recepcionista',   'email' => 'recepcion@clinica.test', 'rol' => User::ROL_RECEPCIONISTA],
            ['name' => 'Dr. Prueba',      'email' => 'medico@clinica.test',    'rol' => User::ROL_MEDICO],
            ['name' => 'Paciente Prueba', 'email' => 'paciente@clinica.test',  'rol' => User::ROL_PACIENTE],
        ];

        foreach ($usuarios as $datos) {
            User::updateOrCreate(
                ['email' => $datos['email']],
                $datos + [
                    'password' => 'password',
                    'telefono' => '99999999',
                    'email_verified_at' => now(),
                ]
            );
        }

        $this->call([
            MedicoSeeder::class,
            PacienteSeeder::class,
            HorarioCitaSeeder::class,
            ConsultaRecetaSeeder::class,
        ]);
    }
}
