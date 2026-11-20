<?php

use App\Models\Cita;
use App\Models\User;
use Illuminate\Support\Carbon;

require_once __DIR__.'/Concerns/AgendaHelpers.php';

beforeEach(function () {
    $this->recepcionista = agendaUsuario(User::ROL_RECEPCIONISTA);
    $this->medico = agendaMedico();
    agendaHorario($this->medico, 1, '08:00', '12:00');
    $this->paciente = agendaPaciente();
    $this->lunes = agendaLunes();
});

test('recepción confirma una cita pendiente', function () {
    $cita = agendaCita($this->medico, $this->paciente, $this->lunes->copy()->setTime(9, 0));

    $this->actingAs($this->recepcionista)
        ->patch(route('citas.confirmar', $cita))
        ->assertSessionHasNoErrors();

    expect($cita->fresh()->estado)->toBe(Cita::ESTADO_CONFIRMADA);
});

test('no se confirma una cita que no está pendiente', function () {
    $cita = agendaCita($this->medico, $this->paciente, $this->lunes->copy()->setTime(9, 0), Cita::ESTADO_CANCELADA);

    $this->actingAs($this->recepcionista)
        ->patch(route('citas.confirmar', $cita))
        ->assertSessionHasErrors('confirmar');

    expect($cita->fresh()->estado)->toBe(Cita::ESTADO_CANCELADA);
});

test('recepción registra la llegada de una cita de hoy y queda en espera', function () {
    $cita = agendaCita($this->medico, $this->paciente, Carbon::today()->setTime(9, 0), Cita::ESTADO_CONFIRMADA);

    $this->actingAs($this->recepcionista)
        ->patch(route('citas.llegada', $cita))
        ->assertSessionHasNoErrors();

    $cita->refresh();

    expect($cita->estado)->toBe(Cita::ESTADO_EN_ESPERA)
        ->and($cita->hora_llegada)->not->toBeNull();
});

test('no se registra la llegada de una cita de otro día', function () {
    $cita = agendaCita($this->medico, $this->paciente, $this->lunes->copy()->setTime(9, 0));

    $this->actingAs($this->recepcionista)
        ->patch(route('citas.llegada', $cita))
        ->assertSessionHasErrors('llegada');

    expect($cita->fresh()->estado)->toBe(Cita::ESTADO_PENDIENTE)
        ->and($cita->fresh()->hora_llegada)->toBeNull();
});

test('no se registra la llegada de una cita cancelada', function () {
    $cita = agendaCita($this->medico, $this->paciente, Carbon::today()->setTime(9, 0), Cita::ESTADO_CANCELADA);

    $this->actingAs($this->recepcionista)
        ->patch(route('citas.llegada', $cita))
        ->assertSessionHasErrors('llegada');

    expect($cita->fresh()->estado)->toBe(Cita::ESTADO_CANCELADA);
});

test('recepción puede reprogramar una cita', function () {
    $cita = agendaCita($this->medico, $this->paciente, $this->lunes->copy()->setTime(9, 0));
    $nuevo = $this->lunes->copy()->setTime(11, 0);

    $this->actingAs($this->recepcionista)
        ->get(route('citas.edit', $cita))
        ->assertOk();

    $this->actingAs($this->recepcionista)
        ->put(route('citas.update', $cita), agendaDatosCita($this->medico, $this->paciente, $nuevo))
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('agenda.index', ['fecha' => $nuevo->toDateString()]));

    expect($cita->fresh()->inicia_en->format('H:i'))->toBe('11:00');
});

test('recepción no puede crear, cancelar ni eliminar citas', function () {
    $cita = agendaCita($this->medico, $this->paciente, $this->lunes->copy()->setTime(9, 0));

    $this->actingAs($this->recepcionista)->get(route('citas.create'))->assertForbidden();
    $this->actingAs($this->recepcionista)->post(route('citas.store'), [])->assertForbidden();
    $this->actingAs($this->recepcionista)->patch(route('citas.cancelar', $cita))->assertForbidden();
    $this->actingAs($this->recepcionista)->delete(route('citas.destroy', $cita))->assertForbidden();

    expect($cita->fresh()->estado)->toBe(Cita::ESTADO_PENDIENTE);
});

test('el médico y el paciente no pueden confirmar, registrar llegada ni reprogramar', function (string $rol) {
    $usuario = agendaUsuario($rol);
    $cita = agendaCita($this->medico, $this->paciente, Carbon::today()->setTime(9, 0));

    $this->actingAs($usuario)->patch(route('citas.confirmar', $cita))->assertForbidden();
    $this->actingAs($usuario)->patch(route('citas.llegada', $cita))->assertForbidden();
    $this->actingAs($usuario)->get(route('citas.edit', $cita))->assertForbidden();

    expect($cita->fresh()->estado)->toBe(Cita::ESTADO_PENDIENTE);
})->with([User::ROL_MEDICO, User::ROL_PACIENTE]);

test('el administrador también puede confirmar citas', function () {
    $cita = agendaCita($this->medico, $this->paciente, $this->lunes->copy()->setTime(9, 0));

    $this->actingAs(agendaAdmin())
        ->patch(route('citas.confirmar', $cita))
        ->assertSessionHasNoErrors();

    expect($cita->fresh()->estado)->toBe(Cita::ESTADO_CONFIRMADA);
});
