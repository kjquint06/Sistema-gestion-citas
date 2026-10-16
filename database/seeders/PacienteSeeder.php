<?php

namespace Database\Seeders;

use App\Models\Alergia;
use App\Models\Paciente;
use App\Models\User;
use Illuminate\Database\Seeder;

class PacienteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $pacientes = [
            [
                'usuario' => ['name' => 'Paciente Prueba', 'email' => 'paciente@clinica.test'],
                'datos' => [
                    'fecha_nacimiento' => '1995-03-12',
                    'sexo' => 'Femenino',
                    'direccion' => 'Col. Los Andes, San Pedro Sula',
                    'contacto_emergencia' => 'María López - 98765432',
                ],
                'alergias' => [
                    ['alergeno' => 'Penicilina', 'gravedad' => 'Alta', 'reaccion' => 'Urticaria y dificultad para respirar'],
                    ['alergeno' => 'Polen', 'gravedad' => 'Leve', 'reaccion' => 'Estornudos y congestión nasal'],
                ],
            ],
            [
                'usuario' => ['name' => 'Carlos Mejía', 'email' => 'carlos.mejia@clinica.test'],
                'datos' => [
                    'fecha_nacimiento' => '1988-07-25',
                    'sexo' => 'Masculino',
                    'direccion' => 'Barrio Guamilito, San Pedro Sula',
                    'contacto_emergencia' => 'Ana Mejía - 97654321',
                ],
                'alergias' => [
                    ['alergeno' => 'Mariscos', 'gravedad' => 'Moderada', 'reaccion' => 'Hinchazón de labios y picazón'],
                ],
            ],
            [
                'usuario' => ['name' => 'Lucía Fernández', 'email' => 'lucia.fernandez@clinica.test'],
                'datos' => [
                    'fecha_nacimiento' => '2001-11-02',
                    'sexo' => 'Femenino',
                    'direccion' => 'Res. Las Colinas, Choloma',
                    'contacto_emergencia' => 'José Fernández - 99887766',
                ],
                'alergias' => [],
            ],
        ];

        foreach ($pacientes as $item) {
            $usuario = User::updateOrCreate(
                ['email' => $item['usuario']['email']],
                $item['usuario'] + [
                    'rol' => User::ROL_PACIENTE,
                    'telefono' => '99999999',
                    'password' => 'password',
                    'email_verified_at' => now(),
                ]
            );

            $paciente = Paciente::updateOrCreate(
                ['usuario_id' => $usuario->id],
                $item['datos']
            );

            foreach ($item['alergias'] as $alergia) {
                Alergia::firstOrCreate(
                    ['paciente_id' => $paciente->id, 'alergeno' => $alergia['alergeno']],
                    $alergia
                );
            }
        }
    }
}
