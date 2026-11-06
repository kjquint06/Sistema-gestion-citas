<?php

use App\Models\Cita;
use App\Models\Especialidad;
use App\Models\Medico;
use App\Models\Paciente;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->admin = User::factory()->create(['rol' => User::ROL_ADMIN]);
    $this->especialidad = Especialidad::create(['nombre' => 'Medicina General']);
});

function crearMedicoDePrueba(Especialidad $especialidad, string $nombre, string $colegiado): Medico
{
    $usuario = User::factory()->create([
        'name' => $nombre,
        'rol' => User::ROL_MEDICO,
    ]);

    return Medico::create([
        'usuario_id' => $usuario->id,
        'especialidad_id' => $especialidad->id,
        'numero_colegiado' => $colegiado,
        'duracion_cita' => 30,
    ]);
}

test('los invitados son enviados al login', function () {
    $this->get(route('medicos.index'))
        ->assertRedirect(route('login'));
});

test('solo el administrador puede gestionar médicos', function () {
    $paciente = User::factory()->create(['rol' => User::ROL_PACIENTE]);

    $this->actingAs($paciente)
        ->get(route('medicos.index'))
        ->assertForbidden();

    $this->actingAs($paciente)
        ->post(route('medicos.store'), [])
        ->assertForbidden();
});

test('el administrador ve la lista de médicos', function () {
    crearMedicoDePrueba($this->especialidad, 'Dra. Ana Morales', 'CMH-9001');

    $this->actingAs($this->admin)
        ->get(route('medicos.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('medicos/index')
            ->has('medicos', 1)
            ->where('medicos.0.nombre', 'Dra. Ana Morales')
            ->where('medicos.0.especialidad', 'Medicina General')
        );
});

test('el buscador filtra médicos por nombre', function () {
    crearMedicoDePrueba($this->especialidad, 'Dra. Ana Morales', 'CMH-9001');
    crearMedicoDePrueba($this->especialidad, 'Dr. Luis Fuentes', 'CMH-9002');

    $this->actingAs($this->admin)
        ->get(route('medicos.index', ['buscar' => 'Luis']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('medicos', 1)
            ->where('medicos.0.nombre', 'Dr. Luis Fuentes')
        );
});

test('se puede crear un médico con un usuario nuevo', function () {
    $this->actingAs($this->admin)
        ->post(route('medicos.store'), [
            'modo_usuario' => 'nuevo',
            'name' => 'Dr. Carlos Rivera',
            'email' => 'carlos.rivera@clinica.test',
            'telefono' => '99999999',
            'password' => 'Clave-Segura-2026!',
            'especialidad_id' => $this->especialidad->id,
            'numero_colegiado' => 'CMH-9100',
            'duracion_cita' => 30,
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('medicos.index'));

    $usuario = User::where('email', 'carlos.rivera@clinica.test')->first();

    expect($usuario)->not->toBeNull()
        ->and($usuario->rol)->toBe(User::ROL_MEDICO)
        ->and($usuario->email_verified_at)->not->toBeNull();

    $this->assertDatabaseHas('medicos', [
        'usuario_id' => $usuario->id,
        'numero_colegiado' => 'CMH-9100',
    ]);
});

test('se puede crear un médico con un usuario existente con rol médico', function () {
    $usuario = User::factory()->create(['rol' => User::ROL_MEDICO]);

    $this->actingAs($this->admin)
        ->post(route('medicos.store'), [
            'modo_usuario' => 'existente',
            'usuario_id' => $usuario->id,
            'especialidad_id' => $this->especialidad->id,
            'numero_colegiado' => 'CMH-9101',
            'duracion_cita' => 45,
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('medicos.index'));

    $this->assertDatabaseHas('medicos', [
        'usuario_id' => $usuario->id,
        'duracion_cita' => 45,
    ]);
});

test('no se puede vincular un usuario que no tiene rol médico', function () {
    $paciente = User::factory()->create(['rol' => User::ROL_PACIENTE]);

    $this->actingAs($this->admin)
        ->post(route('medicos.store'), [
            'modo_usuario' => 'existente',
            'usuario_id' => $paciente->id,
            'especialidad_id' => $this->especialidad->id,
            'numero_colegiado' => 'CMH-9102',
            'duracion_cita' => 30,
        ])
        ->assertSessionHasErrors('usuario_id');

    expect(Medico::count())->toBe(0);
});

test('la especialidad es obligatoria', function () {
    $usuario = User::factory()->create(['rol' => User::ROL_MEDICO]);

    $this->actingAs($this->admin)
        ->post(route('medicos.store'), [
            'modo_usuario' => 'existente',
            'usuario_id' => $usuario->id,
            'numero_colegiado' => 'CMH-9103',
            'duracion_cita' => 30,
        ])
        ->assertSessionHasErrors('especialidad_id');

    expect(Medico::count())->toBe(0);
});

test('el número de colegiado no se puede repetir', function () {
    crearMedicoDePrueba($this->especialidad, 'Dra. Ana Morales', 'CMH-9001');
    $usuario = User::factory()->create(['rol' => User::ROL_MEDICO]);

    $this->actingAs($this->admin)
        ->post(route('medicos.store'), [
            'modo_usuario' => 'existente',
            'usuario_id' => $usuario->id,
            'especialidad_id' => $this->especialidad->id,
            'numero_colegiado' => 'CMH-9001',
            'duracion_cita' => 30,
        ])
        ->assertSessionHasErrors('numero_colegiado');

    expect(Medico::count())->toBe(1);
});

test('el administrador puede editar un médico', function () {
    $medico = crearMedicoDePrueba($this->especialidad, 'Dra. Ana Morales', 'CMH-9001');
    $otra = Especialidad::create(['nombre' => 'Pediatría']);

    $this->actingAs($this->admin)
        ->put(route('medicos.update', $medico), [
            'especialidad_id' => $otra->id,
            'numero_colegiado' => 'CMH-9500',
            'duracion_cita' => 20,
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('medicos.index'));

    $this->assertDatabaseHas('medicos', [
        'id' => $medico->id,
        'especialidad_id' => $otra->id,
        'numero_colegiado' => 'CMH-9500',
        'duracion_cita' => 20,
    ]);
});

test('un médico puede conservar su propio número de colegiado al editar', function () {
    $medico = crearMedicoDePrueba($this->especialidad, 'Dra. Ana Morales', 'CMH-9001');

    $this->actingAs($this->admin)
        ->put(route('medicos.update', $medico), [
            'especialidad_id' => $this->especialidad->id,
            'numero_colegiado' => 'CMH-9001',
            'duracion_cita' => 40,
        ])
        ->assertSessionHasNoErrors();
});

test('al editar no se puede usar el colegiado de otro médico', function () {
    crearMedicoDePrueba($this->especialidad, 'Dra. Ana Morales', 'CMH-9001');
    $medico = crearMedicoDePrueba($this->especialidad, 'Dr. Luis Fuentes', 'CMH-9002');

    $this->actingAs($this->admin)
        ->put(route('medicos.update', $medico), [
            'especialidad_id' => $this->especialidad->id,
            'numero_colegiado' => 'CMH-9001',
            'duracion_cita' => 30,
        ])
        ->assertSessionHasErrors('numero_colegiado');
});

test('el administrador puede eliminar un médico sin citas', function () {
    $medico = crearMedicoDePrueba($this->especialidad, 'Dra. Ana Morales', 'CMH-9001');

    $this->actingAs($this->admin)
        ->delete(route('medicos.destroy', $medico))
        ->assertRedirect(route('medicos.index'));

    $this->assertDatabaseMissing('medicos', ['id' => $medico->id]);
});

test('no se elimina un médico que tiene citas y se muestra el motivo', function () {
    $medico = crearMedicoDePrueba($this->especialidad, 'Dra. Ana Morales', 'CMH-9001');

    $usuarioPaciente = User::factory()->create(['rol' => User::ROL_PACIENTE]);
    $paciente = Paciente::create([
        'usuario_id' => $usuarioPaciente->id,
        'fecha_nacimiento' => '1995-03-12',
        'sexo' => 'F',
    ]);

    Cita::create([
        'paciente_id' => $paciente->id,
        'medico_id' => $medico->id,
        'inicia_en' => now()->addDay(),
        'termina_en' => now()->addDay()->addMinutes(30),
        'estado' => Cita::ESTADO_PENDIENTE,
    ]);

    $this->actingAs($this->admin)
        ->from(route('medicos.index'))
        ->delete(route('medicos.destroy', $medico))
        ->assertRedirect(route('medicos.index'))
        ->assertSessionHasErrors('eliminar');

    $this->assertDatabaseHas('medicos', ['id' => $medico->id]);
});
