<?php

use App\Models\Cita;
use App\Models\User;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;

require_once __DIR__.'/Concerns/AgendaHelpers.php';

beforeEach(function () {
    $this->recepcionista = User::factory()->create(['rol' => User::ROL_RECEPCIONISTA]);
});

test('el recepcionista ve su panel general', function () {
    $this->actingAs($this->recepcionista)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('recepcion/panel')
            ->has('totales')
            ->has('citasHoy')
            ->has('pendientes')
            ->has('pacientesNuevos')
        );
});

test('el panel muestra las citas de hoy sin las canceladas', function () {
    $medico = agendaMedico();
    $paciente = agendaPaciente('Ana López');

    agendaCita($medico, $paciente, Carbon::today()->setTime(10, 0), Cita::ESTADO_CONFIRMADA);
    agendaCita($medico, $paciente, Carbon::today()->setTime(8, 0), Cita::ESTADO_PENDIENTE);
    agendaCita($medico, $paciente, Carbon::today()->setTime(11, 0), Cita::ESTADO_CANCELADA);
    agendaCita($medico, $paciente, agendaLunes()->setTime(9, 0));

    $this->actingAs($this->recepcionista)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('totales.citas_hoy', 2)
            ->has('citasHoy', 2)
            ->where('citasHoy.0.hora', '08:00')
            ->where('citasHoy.0.paciente', 'Ana López')
            ->where('citasHoy.1.hora', '10:00')
        );
});

test('el panel muestra solo las citas pendientes que aún no pasan', function () {
    $medico = agendaMedico();
    $paciente = agendaPaciente();

    agendaCita($medico, $paciente, agendaLunes()->setTime(9, 0), Cita::ESTADO_PENDIENTE);
    agendaCita($medico, $paciente, agendaLunes()->setTime(10, 0), Cita::ESTADO_CONFIRMADA);
    agendaCita($medico, $paciente, Carbon::now()->subDays(3)->setTime(9, 0), Cita::ESTADO_PENDIENTE);

    $this->actingAs($this->recepcionista)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('totales.pendientes', 1)
            ->has('pendientes', 1)
            ->where('pendientes.0.hora', '09:00')
        );
});

test('el panel muestra los pacientes registrados en los últimos 7 días', function () {
    agendaPaciente('Paciente Nuevo');

    $antiguo = agendaPaciente('Paciente Antiguo');
    $antiguo->created_at = now()->subDays(10);
    $antiguo->save();

    $this->actingAs($this->recepcionista)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('totales.pacientes_nuevos', 1)
            ->has('pacientesNuevos', 1)
            ->where('pacientesNuevos.0.nombre', 'Paciente Nuevo')
        );
});

test('los otros roles no ven el panel de recepción', function () {
    $admin = User::factory()->create(['rol' => User::ROL_ADMIN]);
    $medico = User::factory()->create(['rol' => User::ROL_MEDICO]);

    $this->actingAs($admin)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page->component('admin/dashboard'));

    $this->actingAs($medico)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page->component('dashboard'));
});
