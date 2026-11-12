<?php

use App\Models\Cita;
use App\Services\DisponibilidadCitas;

require_once __DIR__.'/Concerns/AgendaHelpers.php';

beforeEach(function () {
    $this->medico = agendaMedico();
    agendaHorario($this->medico, 1, '08:00', '12:00');
    $this->lunes = agendaLunes();
    $this->servicio = new DisponibilidadCitas;
    $this->paciente = agendaPaciente();
});

test('acepta una cita libre dentro del horario', function () {
    $inicio = $this->lunes->copy()->setTime(10, 0);
    $fin = $this->lunes->copy()->setTime(10, 30);

    expect($this->servicio->motivo($this->medico->id, $inicio, $fin))->toBeNull();
    expect($this->servicio->estaDisponible($this->medico->id, $inicio, $fin))->toBeTrue();
});

test('rechaza una cita que se cruza con otra del mismo médico y dice el motivo', function () {
    agendaCita($this->medico, $this->paciente, $this->lunes->copy()->setTime(9, 0));

    $motivo = $this->servicio->motivo(
        $this->medico->id,
        $this->lunes->copy()->setTime(9, 15),
        $this->lunes->copy()->setTime(9, 45),
    );

    expect($motivo)->toContain('Se cruza con otra cita')
        ->and($motivo)->toContain('09:00 a 09:30');
});

test('dos citas seguidas no se consideran un cruce', function () {
    agendaCita($this->medico, $this->paciente, $this->lunes->copy()->setTime(9, 0));

    $motivo = $this->servicio->motivo(
        $this->medico->id,
        $this->lunes->copy()->setTime(9, 30),
        $this->lunes->copy()->setTime(10, 0),
    );

    expect($motivo)->toBeNull();
});

test('rechaza una cita fuera del horario del médico', function () {
    $motivo = $this->servicio->motivo(
        $this->medico->id,
        $this->lunes->copy()->setTime(18, 0),
        $this->lunes->copy()->setTime(18, 30),
    );

    expect($motivo)->toContain('fuera del horario');
});

test('rechaza una cita que empieza dentro del horario pero termina fuera', function () {
    $motivo = $this->servicio->motivo(
        $this->medico->id,
        $this->lunes->copy()->setTime(11, 45),
        $this->lunes->copy()->setTime(12, 15),
    );

    expect($motivo)->toContain('fuera del horario');
});

test('rechaza una cita en un día en que el médico no atiende', function () {
    $martes = $this->lunes->copy()->addDay();

    $motivo = $this->servicio->motivo(
        $this->medico->id,
        $martes->copy()->setTime(10, 0),
        $martes->copy()->setTime(10, 30),
    );

    expect($motivo)->toContain('fuera del horario');
});

test('una cita cancelada no bloquea el espacio', function () {
    agendaCita($this->medico, $this->paciente, $this->lunes->copy()->setTime(9, 0), Cita::ESTADO_CANCELADA);

    $motivo = $this->servicio->motivo(
        $this->medico->id,
        $this->lunes->copy()->setTime(9, 15),
        $this->lunes->copy()->setTime(9, 45),
    );

    expect($motivo)->toBeNull();
});

test('al editar una cita no se compara contra sí misma', function () {
    $cita = agendaCita($this->medico, $this->paciente, $this->lunes->copy()->setTime(9, 0));

    $inicio = $this->lunes->copy()->setTime(9, 0);
    $fin = $this->lunes->copy()->setTime(9, 30);

    expect($this->servicio->motivo($this->medico->id, $inicio, $fin, $cita->id))->toBeNull();
    expect($this->servicio->motivo($this->medico->id, $inicio, $fin))->not->toBeNull();
});

test('las citas de otro médico no generan cruce', function () {
    $otro = agendaMedico('Dra. Ana Morales', 30, 'Pediatría');
    agendaHorario($otro, 1, '08:00', '12:00');
    agendaCita($otro, $this->paciente, $this->lunes->copy()->setTime(9, 0));

    $motivo = $this->servicio->motivo(
        $this->medico->id,
        $this->lunes->copy()->setTime(9, 0),
        $this->lunes->copy()->setTime(9, 30),
    );

    expect($motivo)->toBeNull();
});

test('rechaza una hora de fin que no es posterior a la de inicio', function () {
    $motivo = $this->servicio->motivo(
        $this->medico->id,
        $this->lunes->copy()->setTime(10, 0),
        $this->lunes->copy()->setTime(9, 30),
    );

    expect($motivo)->toContain('hora de fin debe ser posterior');
});
