<?php

use App\Models\Alergia;
use App\Models\Paciente;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

require_once __DIR__.'/Concerns/AgendaHelpers.php';

beforeEach(function () {
    $this->recepcionista = User::factory()->create(['rol' => User::ROL_RECEPCIONISTA]);
});

function pacienteDePrueba(string $nombre = 'Ana López', string $documento = '0501-1995-01234'): Paciente
{
    $usuario = User::factory()->create([
        'name' => $nombre,
        'rol' => User::ROL_PACIENTE,
        'telefono' => '99999999',
    ]);

    return Paciente::create([
        'usuario_id' => $usuario->id,
        'documento' => $documento,
        'fecha_nacimiento' => '1995-03-12',
        'sexo' => 'Femenino',
    ]);
}

/**
 * @param  array<string, string>  $cambios
 * @return array<string, string>
 */
function datosFormularioPaciente(array $cambios = []): array
{
    return $cambios + [
        'nombre' => 'Luis Martínez',
        'documento' => '0501-1990-55555',
        'telefono' => '98765432',
        'correo' => 'luis.martinez@clinica.test',
        'fecha_nacimiento' => '1990-05-20',
        'sexo' => 'Masculino',
        'direccion' => 'Col. Centro',
        'contacto_emergencia' => 'Rosa Martínez - 91234567',
    ];
}

test('los invitados son enviados al login', function () {
    $this->get(route('pacientes.index'))->assertRedirect(route('login'));
});

test('el recepcionista ve la lista con nombre, documento, teléfono y correo', function () {
    $paciente = pacienteDePrueba();

    $this->actingAs($this->recepcionista)
        ->get(route('pacientes.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('pacientes/index')
            ->has('pacientes', 1)
            ->where('pacientes.0.nombre', 'Ana López')
            ->where('pacientes.0.documento', '0501-1995-01234')
            ->where('pacientes.0.telefono', '99999999')
            ->where('pacientes.0.correo', $paciente->usuario->email)
            ->where('puedeGestionar', true)
        );
});

test('el recepcionista puede buscar pacientes por nombre', function () {
    pacienteDePrueba('Ana López', '0001');
    pacienteDePrueba('Carlos Mejía', '0002');

    $this->actingAs($this->recepcionista)
        ->get(route('pacientes.index', ['buscar' => 'carlos']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('pacientes', 1)
            ->where('pacientes.0.nombre', 'Carlos Mejía')
            ->where('filtros.buscar', 'carlos')
        );
});

test('el recepcionista puede crear un paciente', function () {
    $this->actingAs($this->recepcionista)
        ->post(route('pacientes.store'), datosFormularioPaciente())
        ->assertRedirect(route('pacientes.index'));

    $usuario = User::where('email', 'luis.martinez@clinica.test')->firstOrFail();

    expect($usuario->rol)->toBe(User::ROL_PACIENTE)
        ->and($usuario->name)->toBe('Luis Martínez');

    $this->assertDatabaseHas('pacientes', [
        'usuario_id' => $usuario->id,
        'documento' => '0501-1990-55555',
    ]);
});

test('los datos del paciente se validan', function () {
    $this->actingAs($this->recepcionista)
        ->post(route('pacientes.store'), [])
        ->assertSessionHasErrors(['nombre', 'documento', 'telefono', 'correo', 'fecha_nacimiento', 'sexo']);
});

test('el documento y el correo no se pueden repetir', function () {
    $existente = pacienteDePrueba();

    $this->actingAs($this->recepcionista)
        ->post(route('pacientes.store'), datosFormularioPaciente([
            'documento' => '0501-1995-01234',
            'correo' => $existente->usuario->email,
        ]))
        ->assertSessionHasErrors(['documento', 'correo']);
});

test('el recepcionista puede ver la ficha de un paciente', function () {
    $paciente = pacienteDePrueba();

    $this->actingAs($this->recepcionista)
        ->get(route('pacientes.show', $paciente))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('pacientes/show')
            ->where('paciente.nombre', 'Ana López')
            ->where('paciente.citas_count', 0)
        );
});

test('el recepcionista puede editar un paciente', function () {
    $paciente = pacienteDePrueba();

    $this->actingAs($this->recepcionista)
        ->get(route('pacientes.edit', $paciente))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('pacientes/edit'));

    $this->actingAs($this->recepcionista)
        ->put(route('pacientes.update', $paciente), datosFormularioPaciente([
            'nombre' => 'Ana María López',
            'documento' => '0501-1995-01234',
        ]))
        ->assertRedirect(route('pacientes.index'));

    expect($paciente->fresh()->usuario->name)->toBe('Ana María López');
});

test('el recepcionista puede eliminar un paciente sin datos relacionados', function () {
    $paciente = pacienteDePrueba();

    $this->actingAs($this->recepcionista)
        ->delete(route('pacientes.destroy', $paciente))
        ->assertRedirect(route('pacientes.index'));

    $this->assertModelMissing($paciente);
});

test('no se elimina un paciente que tiene citas', function () {
    $paciente = pacienteDePrueba();
    agendaCita(agendaMedico(), $paciente, agendaLunes()->setTime(9, 0));

    $this->actingAs($this->recepcionista)
        ->from(route('pacientes.index'))
        ->delete(route('pacientes.destroy', $paciente))
        ->assertRedirect(route('pacientes.index'))
        ->assertSessionHasErrors('eliminar');

    $this->assertModelExists($paciente);
});

test('no se elimina un paciente que tiene expediente', function () {
    $paciente = pacienteDePrueba();
    Alergia::create([
        'paciente_id' => $paciente->id,
        'alergeno' => 'Penicilina',
        'gravedad' => 'Alta',
        'reaccion' => 'Urticaria',
    ]);

    $this->actingAs($this->recepcionista)
        ->delete(route('pacientes.destroy', $paciente))
        ->assertSessionHasErrors('eliminar');

    $this->assertModelExists($paciente);
});

test('el administrador también puede gestionar pacientes', function () {
    $admin = User::factory()->create(['rol' => User::ROL_ADMIN]);

    $this->actingAs($admin)
        ->post(route('pacientes.store'), datosFormularioPaciente())
        ->assertRedirect(route('pacientes.index'));

    expect(Paciente::count())->toBe(1);
});

test('el médico ve la lista pero no puede gestionar pacientes', function () {
    $medico = User::factory()->create(['rol' => User::ROL_MEDICO]);
    $paciente = pacienteDePrueba();

    $this->actingAs($medico)
        ->get(route('pacientes.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('puedeGestionar', false));

    $this->actingAs($medico)->get(route('pacientes.create'))->assertForbidden();
    $this->actingAs($medico)->post(route('pacientes.store'), datosFormularioPaciente())->assertForbidden();
    $this->actingAs($medico)->delete(route('pacientes.destroy', $paciente))->assertForbidden();
});

test('el paciente no puede entrar a pacientes', function () {
    $usuario = User::factory()->create(['rol' => User::ROL_PACIENTE]);

    $this->actingAs($usuario)->get(route('pacientes.index'))->assertForbidden();
    $this->actingAs($usuario)->get(route('pacientes.create'))->assertForbidden();
});

test('el recepcionista no puede abrir rutas de administrador', function (string $ruta) {
    $this->actingAs($this->recepcionista)
        ->get(route($ruta))
        ->assertForbidden();
})->with(['medicos.index', 'especialidades.index', 'horarios.index', 'usuarios.index']);
