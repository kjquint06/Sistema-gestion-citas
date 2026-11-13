<?php

use App\Models\Paciente;
use App\Models\User;

function datosRegistroPaciente(array $cambios = []): array
{
    return array_merge([
        'name' => 'Elena Martínez',
        'email' => 'elena@example.com',
        'telefono' => '9999-9999',
        'fecha_nacimiento' => '1990-05-20',
        'sexo' => 'Femenino',
        'direccion' => 'Col. Centro',
        'contacto_emergencia' => 'Luis Martínez 8888-8888',
        'privacidad' => '1',
        'password' => 'password',
        'password_confirmation' => 'password',
    ], $cambios);
}

test('la pantalla de registro se puede abrir', function () {
    $this->get(route('register'))->assertOk();
});

test('un paciente nuevo se registra y se crean su usuario y su ficha', function () {
    $response = $this->post(route('register.store'), datosRegistroPaciente());

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));

    $usuario = User::where('email', 'elena@example.com')->firstOrFail();
    expect($usuario->rol)->toBe(User::ROL_PACIENTE);
    expect($usuario->hasVerifiedEmail())->toBeTrue();   // <-- aquí

    $this->assertDatabaseHas('pacientes', [
        'usuario_id' => $usuario->id,
        'sexo' => 'Femenino',
    ]);
});

test('el rol no se puede elegir desde el formulario', function () {
    $this->post(route('register.store'), datosRegistroPaciente([
        'rol' => User::ROL_ADMIN,
    ]));

    $usuario = User::where('email', 'elena@example.com')->firstOrFail();
    expect($usuario->rol)->toBe(User::ROL_PACIENTE);
});

test('un correo ya registrado muestra error y no crea nada', function () {
    User::factory()->create(['email' => 'elena@example.com']);

    $this->post(route('register.store'), datosRegistroPaciente())
        ->assertSessionHasErrors('email');

    expect(User::where('email', 'elena@example.com')->count())->toBe(1);
    expect(Paciente::count())->toBe(0);
});

test('faltan fecha de nacimiento y sexo: da error y no crea nada', function () {
    $this->post(route('register.store'), datosRegistroPaciente([
        'fecha_nacimiento' => '',
        'sexo' => '',
    ]))->assertSessionHasErrors(['fecha_nacimiento', 'sexo']);

    $this->assertGuest();
    expect(User::where('email', 'elena@example.com')->exists())->toBeFalse();
    expect(Paciente::count())->toBe(0);
});

test('sin aceptar la privacidad no se crea la cuenta', function () {
    $this->post(route('register.store'), datosRegistroPaciente([
        'privacidad' => '',
    ]))->assertSessionHasErrors('privacidad');

    $this->assertGuest();
    expect(User::where('email', 'elena@example.com')->exists())->toBeFalse();
});
