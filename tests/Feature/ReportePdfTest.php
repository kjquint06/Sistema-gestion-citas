<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('los invitados son enviados al login', function () {
    $this->get(route('reportes.pdf'))->assertRedirect(route('login'));
});

test('el recepcionista ve los reportes con su rol', function () {
    $recepcionista = User::factory()->create(['rol' => User::ROL_RECEPCIONISTA]);

    $this->actingAs($recepcionista)
        ->get(route('reportes.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('reportes/index')
            ->where('rol', User::ROL_RECEPCIONISTA)
        );
});

test('el recepcionista descarga el reporte en PDF', function () {
    $recepcionista = User::factory()->create(['rol' => User::ROL_RECEPCIONISTA]);

    $respuesta = $this->actingAs($recepcionista)
        ->get(route('reportes.pdf', ['desde' => '2026-01-01', 'hasta' => '2026-12-31']));

    $respuesta->assertOk()
        ->assertHeader('content-type', 'application/pdf');

    expect($respuesta->headers->get('content-disposition'))
        ->toContain('attachment')
        ->toContain('reporte-citas-2026-01-01-al-2026-12-31.pdf');
});

test('sin fechas el PDF usa el mes actual', function () {
    $recepcionista = User::factory()->create(['rol' => User::ROL_RECEPCIONISTA]);

    $desde = now()->startOfMonth()->toDateString();
    $hasta = now()->endOfMonth()->toDateString();

    $respuesta = $this->actingAs($recepcionista)->get(route('reportes.pdf'));

    $respuesta->assertOk();

    expect($respuesta->headers->get('content-disposition'))
        ->toContain("reporte-citas-{$desde}-al-{$hasta}.pdf");
});

test('el PDF valida que hasta no sea anterior a desde', function () {
    $recepcionista = User::factory()->create(['rol' => User::ROL_RECEPCIONISTA]);

    $this->actingAs($recepcionista)
        ->get(route('reportes.pdf', ['desde' => '2026-12-31', 'hasta' => '2026-01-01']))
        ->assertSessionHasErrors('hasta');
});

test('el administrador y el médico también pueden descargar el PDF', function (string $rol) {
    $usuario = User::factory()->create(['rol' => $rol]);

    $this->actingAs($usuario)
        ->get(route('reportes.pdf'))
        ->assertOk()
        ->assertHeader('content-type', 'application/pdf');
})->with([User::ROL_ADMIN, User::ROL_MEDICO]);

test('el paciente no puede descargar el PDF', function () {
    $paciente = User::factory()->create(['rol' => User::ROL_PACIENTE]);

    $this->actingAs($paciente)
        ->get(route('reportes.pdf'))
        ->assertForbidden();
});
