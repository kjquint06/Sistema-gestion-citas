<?php

use App\Models\Cita;
use App\Models\Horario;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

require_once __DIR__.'/Concerns/AgendaHelpers.php';

test('los invitados son enviados al login', function () {
    $this->get(route('horarios.index'))->assertRedirect('/login');
});

test('solo el administrador puede gestionar horarios', function () {
    foreach ([User::ROL_MEDICO, User::ROL_RECEPCIONISTA, User::ROL_PACIENTE] as $rol) {
        $this->actingAs(agendaUsuario($rol))
            ->get(route('horarios.index'))
            ->assertForbidden();
    }

    $this->actingAs(agendaAdmin())->get(route('horarios.index'))->assertOk();
});

test('el administrador ve la lista de horarios con el nombre del médico', function () {
    $medico = agendaMedico('Dr. Prueba');
    agendaHorario($medico, 1, '08:00', '12:00');
    agendaHorario($medico, 1, '14:00', '17:00');

    $this->actingAs(agendaAdmin())
        ->get(route('horarios.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('horarios/index')
            ->has('horarios', 2)
            ->where('horarios.0.medico', 'Dr. Prueba')
            ->where('horarios.0.dia', 'Lunes')
            ->where('horarios.0.hora_inicio', '08:00')
            ->where('horarios.0.hora_fin', '12:00'));
});

test('la lista de horarios se puede filtrar por médico', function () {
    $primero = agendaMedico('Dr. Prueba');
    $segundo = agendaMedico('Dra. Ana Morales', 30, 'Pediatría');
    agendaHorario($primero);
    agendaHorario($segundo);
    agendaHorario($segundo, 2);

    $this->actingAs(agendaAdmin())
        ->get(route('horarios.index', ['medico_id' => $segundo->id]))
        ->assertInertia(fn (Assert $page) => $page->has('horarios', 2));
});

test('el administrador puede crear un horario', function () {
    $medico = agendaMedico();

    $this->actingAs(agendaAdmin())
        ->post(route('horarios.store'), agendaDatosHorario($medico, ['dia_semana' => 6]))
        ->assertRedirect(route('horarios.index'))
        ->assertSessionHasNoErrors();

    expect(Horario::count())->toBe(1);

    $horario = Horario::first();

    expect($horario->dia_semana)->toBe(6)
        ->and(substr((string) $horario->hora_inicio, 0, 5))->toBe('08:00')
        ->and(substr((string) $horario->hora_fin, 0, 5))->toBe('12:00');
});

test('crear un horario valida los campos obligatorios', function () {
    $this->actingAs(agendaAdmin())
        ->post(route('horarios.store'), [])
        ->assertSessionHasErrors(['medico_id', 'dia_semana', 'hora_inicio', 'hora_fin']);

    expect(Horario::count())->toBe(0);
});

test('el médico elegido debe existir y el día debe estar entre 1 y 7', function () {
    $medico = agendaMedico();

    $this->actingAs(agendaAdmin())
        ->post(route('horarios.store'), agendaDatosHorario($medico, ['medico_id' => 9999, 'dia_semana' => 9]))
        ->assertSessionHasErrors(['medico_id', 'dia_semana']);
});

test('la hora de fin debe ser posterior a la de inicio', function () {
    $medico = agendaMedico();

    $this->actingAs(agendaAdmin())
        ->post(route('horarios.store'), agendaDatosHorario($medico, ['hora_inicio' => '12:00', 'hora_fin' => '08:00']))
        ->assertSessionHasErrors('hora_fin');
});

test('no se puede crear un bloque que se cruza con otro del mismo médico y día', function () {
    $medico = agendaMedico();
    agendaHorario($medico, 1, '08:00', '12:00');

    $this->actingAs(agendaAdmin())
        ->post(route('horarios.store'), agendaDatosHorario($medico, ['hora_inicio' => '10:00', 'hora_fin' => '13:00']))
        ->assertSessionHasErrors([
            'hora_inicio' => 'Se cruza con otro bloque del médico de 08:00 a 12:00.',
        ]);

    expect(Horario::count())->toBe(1);
});

test('se pueden crear bloques seguidos, de otro día o de otro médico', function () {
    $medico = agendaMedico();
    $otro = agendaMedico('Dra. Ana Morales', 30, 'Pediatría');
    agendaHorario($medico, 1, '08:00', '12:00');

    $admin = agendaAdmin();

    $this->actingAs($admin)
        ->post(route('horarios.store'), agendaDatosHorario($medico, ['hora_inicio' => '12:00', 'hora_fin' => '14:00']))
        ->assertSessionHasNoErrors();

    $this->actingAs($admin)
        ->post(route('horarios.store'), agendaDatosHorario($medico, ['dia_semana' => 2]))
        ->assertSessionHasNoErrors();

    $this->actingAs($admin)
        ->post(route('horarios.store'), agendaDatosHorario($otro))
        ->assertSessionHasNoErrors();

    expect(Horario::count())->toBe(4);
});

test('el administrador puede editar un horario', function () {
    $medico = agendaMedico();
    $horario = agendaHorario($medico);

    $this->actingAs(agendaAdmin())
        ->put(route('horarios.update', $horario), agendaDatosHorario($medico, ['hora_inicio' => '09:00', 'hora_fin' => '11:00']))
        ->assertRedirect(route('horarios.index'))
        ->assertSessionHasNoErrors();

    $horario->refresh();

    expect(substr((string) $horario->hora_inicio, 0, 5))->toBe('09:00')
        ->and(substr((string) $horario->hora_fin, 0, 5))->toBe('11:00');
});

test('se puede guardar un horario sin cambiar sus horas', function () {
    $medico = agendaMedico();
    $horario = agendaHorario($medico);

    $this->actingAs(agendaAdmin())
        ->put(route('horarios.update', $horario), agendaDatosHorario($medico))
        ->assertSessionHasNoErrors();
});

test('al editar no se puede cruzar con otro bloque del médico', function () {
    $medico = agendaMedico();
    agendaHorario($medico, 1, '08:00', '12:00');
    $tarde = agendaHorario($medico, 1, '14:00', '17:00');

    $this->actingAs(agendaAdmin())
        ->put(route('horarios.update', $tarde), agendaDatosHorario($medico, ['hora_inicio' => '11:00', 'hora_fin' => '15:00']))
        ->assertSessionHasErrors('hora_inicio');
});

test('el administrador puede eliminar un horario sin citas', function () {
    $horario = agendaHorario(agendaMedico());

    $this->actingAs(agendaAdmin())
        ->delete(route('horarios.destroy', $horario))
        ->assertRedirect(route('horarios.index'));

    $this->assertModelMissing($horario);
});

test('no se elimina un horario con citas asignadas y se muestra el motivo', function () {
    $medico = agendaMedico();
    $horario = agendaHorario($medico, 1, '08:00', '12:00');
    agendaCita($medico, agendaPaciente(), agendaLunes()->setTime(9, 0));

    $this->actingAs(agendaAdmin())
        ->delete(route('horarios.destroy', $horario))
        ->assertSessionHasErrors([
            'eliminar' => 'No se puede eliminar el horario porque tiene 1 cita asignada.',
        ]);

    $this->assertModelExists($horario);
});

test('las citas canceladas no impiden eliminar un horario', function () {
    $medico = agendaMedico();
    $horario = agendaHorario($medico, 1, '08:00', '12:00');
    agendaCita($medico, agendaPaciente(), agendaLunes()->setTime(9, 0), Cita::ESTADO_CANCELADA);

    $this->actingAs(agendaAdmin())
        ->delete(route('horarios.destroy', $horario))
        ->assertSessionHasNoErrors();

    $this->assertModelMissing($horario);
});