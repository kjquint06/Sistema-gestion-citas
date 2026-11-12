<?php

use App\Models\Cita;
use App\Models\User;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;

require_once __DIR__.'/Concerns/AgendaHelpers.php';

beforeEach(function () {
    $this->admin = agendaAdmin();
    $this->paciente = agendaPaciente();
    $this->cardiologo = agendaMedico('Luis Fuentes', 30, 'Cardiología');
    $this->pediatra = agendaMedico('Ana Morales', 30, 'Pediatría');
});

test('el reporte cuenta los estados en espera y en consulta', function () {
    agendaCita($this->cardiologo, $this->paciente, Carbon::parse('2026-03-10 09:00'), Cita::ESTADO_EN_ESPERA);
    agendaCita($this->cardiologo, $this->paciente, Carbon::parse('2026-03-10 09:30'), Cita::ESTADO_EN_CONSULTA);

    $this->actingAs($this->admin)
        ->get(route('reportes.index', ['desde' => '2026-03-01', 'hasta' => '2026-03-31']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('total', 2)
            ->where('porEstado.en_espera', 1)
            ->where('porEstado.en_consulta', 1)
            ->where('porMedico.0.nombre', 'Luis Fuentes')
            ->where('porMedico.0.en_espera', 1)
            ->where('porMedico.0.en_consulta', 1));
});

test('el reporte agrupa las citas por mes y rellena los meses vacíos', function () {
    agendaCita($this->cardiologo, $this->paciente, Carbon::parse('2026-01-05 09:00'));
    agendaCita($this->cardiologo, $this->paciente, Carbon::parse('2026-01-06 09:00'));
    agendaCita($this->cardiologo, $this->paciente, Carbon::parse('2026-03-10 09:00'));
    agendaCita($this->cardiologo, $this->paciente, Carbon::parse('2026-04-01 09:00'));

    $this->actingAs($this->admin)
        ->get(route('reportes.index', ['desde' => '2026-01-01', 'hasta' => '2026-03-31']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('total', 3)
            ->has('porMes', 3)
            ->where('porMes.0.mes', '2026-01')
            ->where('porMes.0.total', 2)
            ->where('porMes.1.mes', '2026-02')
            ->where('porMes.1.total', 0)
            ->where('porMes.2.mes', '2026-03')
            ->where('porMes.2.total', 1));
});

test('el reporte por mes no pasa de 36 meses', function () {
    $this->actingAs($this->admin)
        ->get(route('reportes.index', ['desde' => '2020-01-01', 'hasta' => '2026-12-31']))
        ->assertInertia(fn (Assert $page) => $page->has('porMes', 36));
});

test('el reporte agrupa las citas por especialidad de mayor a menor', function () {
    agendaCita($this->cardiologo, $this->paciente, Carbon::parse('2026-03-10 09:00'));
    agendaCita($this->cardiologo, $this->paciente, Carbon::parse('2026-03-10 09:30'));
    agendaCita($this->pediatra, $this->paciente, Carbon::parse('2026-03-10 10:00'));

    $this->actingAs($this->admin)
        ->get(route('reportes.index', ['desde' => '2026-03-01', 'hasta' => '2026-03-31']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('porEspecialidad', 2)
            ->where('porEspecialidad.0.nombre', 'Cardiología')
            ->where('porEspecialidad.0.total', 2)
            ->where('porEspecialidad.1.nombre', 'Pediatría')
            ->where('porEspecialidad.1.total', 1));
});

test('las citas fuera del rango no aparecen por especialidad', function () {
    agendaCita($this->cardiologo, $this->paciente, Carbon::parse('2026-05-10 09:00'));

    $this->actingAs($this->admin)
        ->get(route('reportes.index', ['desde' => '2026-03-01', 'hasta' => '2026-03-31']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('total', 0)
            ->has('porEspecialidad', 0));
});

test('el reporte recibe el rol de quien lo consulta', function () {
    foreach ([User::ROL_ADMIN, User::ROL_RECEPCIONISTA, User::ROL_MEDICO] as $rol) {
        $this->actingAs(agendaUsuario($rol))
            ->get(route('reportes.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('reportes/index')
                ->where('rol', $rol));
    }
});
