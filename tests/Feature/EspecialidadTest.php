<?php

use App\Models\Especialidad;
use App\Models\Medico;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->admin = User::factory()->create(['rol' => User::ROL_ADMIN]);
});

test('los invitados son enviados al login', function () {
    $this->get(route('especialidades.index'))
        ->assertRedirect(route('login'));
});

test('solo el administrador puede entrar a especialidades', function () {
    $medico = User::factory()->create(['rol' => User::ROL_MEDICO]);

    $this->actingAs($medico)
        ->get(route('especialidades.index'))
        ->assertForbidden();

    $this->actingAs($medico)
        ->post(route('especialidades.store'), ['nombre' => 'Neurología'])
        ->assertForbidden();

    expect(Especialidad::where('nombre', 'Neurología')->exists())->toBeFalse();
});

test('el administrador ve la lista con la cantidad de médicos', function () {
    Especialidad::create(['nombre' => 'Pediatría']);

    $this->actingAs($this->admin)
        ->get(route('especialidades.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('especialidades/index')
            ->has('especialidades', 1)
            ->where('especialidades.0.nombre', 'Pediatría')
            ->where('especialidades.0.medicos_count', 0)
        );
});

test('el administrador puede crear una especialidad', function () {
    $this->actingAs($this->admin)
        ->post(route('especialidades.store'), ['nombre' => 'Dermatología'])
        ->assertRedirect(route('especialidades.index'));

    $this->assertDatabaseHas('especialidades', ['nombre' => 'Dermatología']);
});

test('el nombre de la especialidad es obligatorio', function () {
    $this->actingAs($this->admin)
        ->post(route('especialidades.store'), ['nombre' => ''])
        ->assertSessionHasErrors('nombre');
});

test('el nombre de la especialidad no se puede repetir', function () {
    Especialidad::create(['nombre' => 'Pediatría']);

    $this->actingAs($this->admin)
        ->post(route('especialidades.store'), ['nombre' => 'Pediatría'])
        ->assertSessionHasErrors('nombre');

    expect(Especialidad::where('nombre', 'Pediatría')->count())->toBe(1);
});

test('el administrador puede editar una especialidad', function () {
    $especialidad = Especialidad::create(['nombre' => 'Cardiologia']);

    $this->actingAs($this->admin)
        ->put(route('especialidades.update', $especialidad), ['nombre' => 'Cardiología'])
        ->assertRedirect(route('especialidades.index'));

    $this->assertDatabaseHas('especialidades', [
        'id' => $especialidad->id,
        'nombre' => 'Cardiología',
    ]);
});

test('se puede guardar una especialidad sin cambiar su nombre', function () {
    $especialidad = Especialidad::create(['nombre' => 'Pediatría']);

    $this->actingAs($this->admin)
        ->put(route('especialidades.update', $especialidad), ['nombre' => 'Pediatría'])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('especialidades.index'));
});

test('el administrador puede eliminar una especialidad sin médicos', function () {
    $especialidad = Especialidad::create(['nombre' => 'Dermatología']);

    $this->actingAs($this->admin)
        ->delete(route('especialidades.destroy', $especialidad))
        ->assertRedirect(route('especialidades.index'));

    $this->assertDatabaseMissing('especialidades', ['id' => $especialidad->id]);
});

test('no se elimina una especialidad que tiene médicos y se muestra el motivo', function () {
    $especialidad = Especialidad::create(['nombre' => 'Cardiología']);
    $usuario = User::factory()->create(['rol' => User::ROL_MEDICO]);

    Medico::create([
        'usuario_id' => $usuario->id,
        'especialidad_id' => $especialidad->id,
        'numero_colegiado' => 'CMH-9001',
        'duracion_cita' => 30,
    ]);

    $this->actingAs($this->admin)
        ->from(route('especialidades.index'))
        ->delete(route('especialidades.destroy', $especialidad))
        ->assertRedirect(route('especialidades.index'))
        ->assertSessionHasErrors('eliminar');

    $this->assertDatabaseHas('especialidades', ['id' => $especialidad->id]);
});
