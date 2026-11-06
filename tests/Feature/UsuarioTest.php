<?php

use App\Models\Especialidad;
use App\Models\Medico;
use App\Models\Paciente;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;

function crearAdminUsuarios(): User
{
    return User::factory()->create(['rol' => User::ROL_ADMIN]);
}

test('solo el administrador puede entrar a usuarios', function () {
    $recepcion = User::factory()->create(['rol' => User::ROL_RECEPCIONISTA]);

    $this->actingAs($recepcion)->get(route('usuarios.index'))->assertForbidden();
    $this->actingAs($recepcion)->get(route('usuarios.create'))->assertForbidden();
    $this->actingAs(crearAdminUsuarios())->get(route('usuarios.index'))->assertOk();
});

test('el listado muestra los usuarios y se puede filtrar por rol', function () {
    $admin = crearAdminUsuarios();
    User::factory()->count(2)->create(['rol' => User::ROL_MEDICO]);
    User::factory()->create(['rol' => User::ROL_PACIENTE]);

    $this->actingAs($admin)
        ->get(route('usuarios.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('usuarios/index')
            ->has('usuarios', 4)
            ->where('filtros.rol', ''));

    $this->actingAs($admin)
        ->get(route('usuarios.index', ['rol' => User::ROL_MEDICO]))
        ->assertInertia(fn (Assert $page) => $page
            ->has('usuarios', 2)
            ->where('usuarios.0.rol', User::ROL_MEDICO)
            ->where('usuarios.1.rol', User::ROL_MEDICO)
            ->where('filtros.rol', User::ROL_MEDICO));
});

test('un filtro de rol inválido se ignora', function () {
    $admin = crearAdminUsuarios();
    User::factory()->create(['rol' => User::ROL_PACIENTE]);

    $this->actingAs($admin)
        ->get(route('usuarios.index', ['rol' => 'inventado']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('usuarios', 2)
            ->where('filtros.rol', ''));
});

test('el administrador puede crear un usuario', function () {
    $this->actingAs(crearAdminUsuarios())
        ->post(route('usuarios.store'), [
            'name' => 'Nueva Recepcionista',
            'email' => 'nueva@clinica.test',
            'telefono' => '9999-0000',
            'rol' => User::ROL_RECEPCIONISTA,
            'password' => 'password123',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('usuarios.index'));

    $usuario = User::where('email', 'nueva@clinica.test')->firstOrFail();

    expect($usuario->name)->toBe('Nueva Recepcionista')
        ->and($usuario->rol)->toBe(User::ROL_RECEPCIONISTA)
        ->and($usuario->telefono)->toBe('9999-0000')
        ->and($usuario->email_verified_at)->not->toBeNull()
        ->and(Hash::check('password123', $usuario->password))->toBeTrue();
});

test('un usuario médico se crea solo como cuenta, sin perfil', function () {
    $this->actingAs(crearAdminUsuarios())
        ->post(route('usuarios.store'), [
            'name' => 'Dr. Nuevo',
            'email' => 'drnuevo@clinica.test',
            'rol' => User::ROL_MEDICO,
            'password' => 'password123',
        ])
        ->assertSessionHasNoErrors();

    $usuario = User::where('email', 'drnuevo@clinica.test')->firstOrFail();

    expect($usuario->rol)->toBe(User::ROL_MEDICO)
        ->and($usuario->medico()->exists())->toBeFalse();
});

test('crear valida los campos obligatorios', function () {
    $this->actingAs(crearAdminUsuarios())
        ->post(route('usuarios.store'), [])
        ->assertSessionHasErrors(['name', 'email', 'rol', 'password']);
});

test('el correo debe ser único y el rol válido', function () {
    $existente = User::factory()->create();

    $this->actingAs(crearAdminUsuarios())
        ->post(route('usuarios.store'), [
            'name' => 'Repetido',
            'email' => $existente->email,
            'rol' => 'superusuario',
            'password' => 'password123',
        ])
        ->assertSessionHasErrors(['email', 'rol']);
});

test('el administrador puede editar un usuario sin cambiar su contraseña', function () {
    $usuario = User::factory()->create(['rol' => User::ROL_PACIENTE]);
    $hashAnterior = $usuario->password;

    $this->actingAs(crearAdminUsuarios())
        ->put(route('usuarios.update', $usuario), [
            'name' => 'Nombre Editado',
            'email' => $usuario->email,
            'telefono' => '',
            'rol' => User::ROL_RECEPCIONISTA,
            'password' => '',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('usuarios.index'));

    $usuario->refresh();

    expect($usuario->name)->toBe('Nombre Editado')
        ->and($usuario->rol)->toBe(User::ROL_RECEPCIONISTA)
        ->and($usuario->password)->toBe($hashAnterior);
});

test('al editar se puede cambiar la contraseña', function () {
    $usuario = User::factory()->create(['rol' => User::ROL_PACIENTE]);

    $this->actingAs(crearAdminUsuarios())
        ->put(route('usuarios.update', $usuario), [
            'name' => $usuario->name,
            'email' => $usuario->email,
            'rol' => User::ROL_PACIENTE,
            'password' => 'otraClave123',
        ])
        ->assertSessionHasNoErrors();

    expect(Hash::check('otraClave123', $usuario->refresh()->password))->toBeTrue();
});

test('el administrador no puede quitarse su propio rol', function () {
    $admin = crearAdminUsuarios();

    $this->actingAs($admin)
        ->put(route('usuarios.update', $admin), [
            'name' => $admin->name,
            'email' => $admin->email,
            'rol' => User::ROL_PACIENTE,
        ])
        ->assertSessionHasErrors('rol');

    expect($admin->refresh()->rol)->toBe(User::ROL_ADMIN);
});

test('el administrador no puede eliminarse a sí mismo', function () {
    $admin = crearAdminUsuarios();

    $this->actingAs($admin)->delete(route('usuarios.destroy', $admin));

    $this->assertDatabaseHas('users', ['id' => $admin->id]);
});

test('no se elimina un usuario con perfil de paciente', function () {
    $usuario = User::factory()->create(['rol' => User::ROL_PACIENTE]);
    Paciente::create([
        'usuario_id' => $usuario->id,
        'fecha_nacimiento' => '1990-01-01',
        'sexo' => 'femenino',
    ]);

    $this->actingAs(crearAdminUsuarios())->delete(route('usuarios.destroy', $usuario));

    $this->assertDatabaseHas('users', ['id' => $usuario->id]);
});

test('no se elimina un usuario con perfil de médico', function () {
    $usuario = User::factory()->create(['rol' => User::ROL_MEDICO]);
    Medico::create([
        'usuario_id' => $usuario->id,
        'especialidad_id' => Especialidad::create(['nombre' => 'Pediatría'])->id,
        'numero_colegiado' => 'CMH-9999',
    ]);

    $this->actingAs(crearAdminUsuarios())->delete(route('usuarios.destroy', $usuario));

    $this->assertDatabaseHas('users', ['id' => $usuario->id]);
});

test('el administrador puede eliminar un usuario sin datos relacionados', function () {
    $usuario = User::factory()->create(['rol' => User::ROL_RECEPCIONISTA]);

    $this->actingAs(crearAdminUsuarios())
        ->delete(route('usuarios.destroy', $usuario))
        ->assertRedirect(route('usuarios.index'));

    $this->assertDatabaseMissing('users', ['id' => $usuario->id]);
});
