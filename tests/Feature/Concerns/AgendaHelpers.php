<?php

use App\Models\Cita;
use App\Models\Especialidad;
use App\Models\Horario;
use App\Models\Medico;
use App\Models\Paciente;
use App\Models\User;
use Illuminate\Support\Carbon;

function agendaUsuario(string $rol): User
{
    return User::factory()->create(['rol' => $rol, 'telefono' => '99999999']);
}

function agendaAdmin(): User
{
    return agendaUsuario(User::ROL_ADMIN);
}

/**
 * Lunes de la próxima semana a las 00:00 (siempre es una fecha futura).
 */
function agendaLunes(): Carbon
{
    return Carbon::parse('monday next week')->startOfDay();
}

function agendaMedico(string $nombre = 'Dr. Prueba', int $duracion = 30, string $especialidad = 'Medicina General'): Medico
{
    $especialidadModelo = Especialidad::firstOrCreate(['nombre' => $especialidad]);

    $usuario = User::factory()->create([
        'name' => $nombre,
        'rol' => User::ROL_MEDICO,
        'telefono' => '99999999',
    ]);

    return Medico::create([
        'usuario_id' => $usuario->id,
        'especialidad_id' => $especialidadModelo->id,
        'numero_colegiado' => 'CMH-'.fake()->unique()->numberBetween(1000, 99999),
        'duracion_cita' => $duracion,
        'consultorio' => 'Consultorio 101',
    ]);
}

function agendaHorario(Medico $medico, int $dia = 1, string $inicio = '08:00', string $fin = '12:00'): Horario
{
    return Horario::create([
        'medico_id' => $medico->id,
        'dia_semana' => $dia,
        'hora_inicio' => $inicio,
        'hora_fin' => $fin,
    ]);
}

function agendaPaciente(string $nombre = 'Paciente Prueba'): Paciente
{
    $usuario = User::factory()->create([
        'name' => $nombre,
        'rol' => User::ROL_PACIENTE,
        'telefono' => '99999999',
    ]);

    return Paciente::create([
        'usuario_id' => $usuario->id,
        'fecha_nacimiento' => '1995-03-12',
        'sexo' => 'Femenino',
        'direccion' => 'San Pedro Sula',
        'contacto_emergencia' => 'Contacto - 98765432',
    ]);
}

function agendaCita(Medico $medico, Paciente $paciente, Carbon $inicio, string $estado = Cita::ESTADO_PENDIENTE): Cita
{
    return Cita::create([
        'medico_id' => $medico->id,
        'paciente_id' => $paciente->id,
        'inicia_en' => $inicio,
        'termina_en' => $inicio->copy()->addMinutes($medico->duracion_cita),
        'estado' => $estado,
        'motivo' => 'Control general',
    ]);
}

/**
 * @param  array<string, mixed>  $cambios
 * @return array<string, mixed>
 */
function agendaDatosHorario(Medico $medico, array $cambios = []): array
{
    return array_merge([
        'medico_id' => $medico->id,
        'dia_semana' => 1,
        'hora_inicio' => '08:00',
        'hora_fin' => '12:00',
    ], $cambios);
}

/**
 * @param  array<string, mixed>  $cambios
 * @return array<string, mixed>
 */
function agendaDatosCita(Medico $medico, Paciente $paciente, Carbon $inicio, array $cambios = []): array
{
    return array_merge([
        'paciente_id' => $paciente->id,
        'medico_id' => $medico->id,
        'fecha' => $inicio->toDateString(),
        'hora_inicio' => $inicio->format('H:i'),
        'motivo' => 'Control general',
    ], $cambios);
}