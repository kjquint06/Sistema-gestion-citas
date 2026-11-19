<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('los invitados son enviados al login', function () {
    $this->get(route('consultas.index'))->assertRedirect(route('login'));
    $this->get(route('mis-pacientes.index'))->assertRedirect(route('login'));
});

test('al iniciar sesión el médico entra a la agenda semanal', function () {
    $medico = User::factory()->create(['rol' => User::ROL_MEDICO]);

    $this->actingAs($medico)
        ->get(route('dashboard'))
        ->assertRedirect(route('agenda.index'));
});

test('el médico puede abrir Consultas y Mis pacientes', function () {
    $medico = User::factory()->create(['rol' => User::ROL_MEDICO]);

    $this->actingAs($medico)
        ->get(route('consultas.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('consultas/index'));

    $this->actingAs($medico)
        ->get(route('mis-pacientes.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('mis-pacientes/index'));
});

test('los otros roles no pueden abrir las rutas del médico', function (string $rol) {
    $usuario = User::factory()->create(['rol' => $rol]);

    $this->actingAs($usuario)->get(route('consultas.index'))->assertForbidden();
    $this->actingAs($usuario)->get(route('mis-pacientes.index'))->assertForbidden();
})->with([
    User::ROL_PACIENTE,
    User::ROL_RECEPCIONISTA,
    User::ROL_ADMIN,
]);
