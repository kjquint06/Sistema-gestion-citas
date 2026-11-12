<?php

use App\Models\Cita;
use App\Models\Consulta;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

require_once __DIR__.'/Concerns/AgendaHelpers.php';

beforeEach(function () {
    $this->admin = agendaAdmin();
    $this->medico = agendaMedico();
    agendaHorario($this->medico, 1, '08:00', '12:00');
    $this->paciente = agendaPaciente();
    $this->lunes = agendaLunes();
});

test('los invitados son enviados al login', function () {
    $this->get(route('citas.create'))->assertRedirect(route('login'));
});

test('solo el administrador puede gestionar citas', function () {
    foreach ([User::ROL_MEDICO, User::ROL_PACIENTE] as $rol) {
        $usuario = agendaUsuario($rol);

        $this->actingAs($usuario)->get(route('citas.create'))->assertForbidden();
        $this->actingAs($usuario)->post(route('citas.store'), [])->assertForbidden();
    }
});

test('el formulario de nueva reserva trae pacientes, médicos y los datos de la agenda', function () {
    $this->actingAs($this->admin)
        ->get(route('citas.create', [
            'fecha' => $this->lunes->toDateString(),
            'medico_id' => $this->medico->id,
            'hora' => '10:00',
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('citas/create')
            ->has('pacientes', 1)
            ->has('medicos', 1)
            ->where('medicos.0.duracion_cita', 30)
            ->where('medicos.0.consultorio', 'Consultorio 101')
            ->where('valores.fecha', $this->lunes->toDateString())
            ->where('valores.medico_id', $this->medico->id)
            ->where('valores.hora_inicio', '10:00'));
});

test('sin datos en la dirección el formulario usa la fecha de hoy', function () {
    $this->actingAs($this->admin)
        ->get(route('citas.create'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('valores.fecha', now()->toDateString())
            ->where('valores.medico_id', null)
            ->where('valores.hora_inicio', null));
});

test('el administrador puede crear una cita', function () {
    $inicio = $this->lunes->copy()->setTime(10, 0);

    $this->actingAs($this->admin)
        ->post(route('citas.store'), agendaDatosCita($this->medico, $this->paciente, $inicio))
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('agenda.index', ['fecha' => $inicio->toDateString()]));

    $cita = Cita::first();

    expect(Cita::count())->toBe(1)
        ->and($cita->inicia_en->format('Y-m-d H:i'))->toBe($inicio->format('Y-m-d H:i'))
        ->and($cita->termina_en->format('H:i'))->toBe('10:30')
        ->and($cita->estado)->toBe(Cita::ESTADO_PENDIENTE)
        ->and($cita->motivo)->toBe('Control general');
});

test('la cita dura lo que dura la consulta del médico', function () {
    $medico = agendaMedico('Luis Fuentes', 45, 'Cardiología');
    agendaHorario($medico, 1, '08:00', '12:00');
    $inicio = $this->lunes->copy()->setTime(10, 0);

    $this->actingAs($this->admin)
        ->post(route('citas.store'), agendaDatosCita($medico, $this->paciente, $inicio))
        ->assertSessionHasNoErrors();

    $cita = Cita::where('medico_id', $medico->id)->first();

    expect($cita->termina_en->format('H:i'))->toBe('10:45');
});

test('crear una cita valida los campos obligatorios', function () {
    $this->actingAs($this->admin)
        ->post(route('citas.store'), [])
        ->assertSessionHasErrors(['paciente_id', 'medico_id', 'fecha', 'hora_inicio']);

    expect(Cita::count())->toBe(0);
});

test('crear una cita valida el formato de los datos', function () {
    $this->actingAs($this->admin)
        ->post(route('citas.store'), [
            'paciente_id' => 9999,
            'medico_id' => 9999,
            'fecha' => '16/11/2026',
            'hora_inicio' => '25:00',
            'hora_llegada' => 'abc',
            'estado' => 'inventado',
        ])
        ->assertSessionHasErrors(['paciente_id', 'medico_id', 'fecha', 'hora_inicio', 'hora_llegada', 'estado']);
});

test('no se puede crear una cita que se cruza con otra del mismo médico', function () {
    agendaCita($this->medico, $this->paciente, $this->lunes->copy()->setTime(9, 0));

    $this->actingAs($this->admin)
        ->post(route('citas.store'), agendaDatosCita($this->medico, agendaPaciente('Carlos Mejía'), $this->lunes->copy()->setTime(9, 15)))
        ->assertSessionHasErrors([
            'hora_inicio' => 'Se cruza con otra cita del médico de 09:00 a 09:30.',
        ]);

    expect(Cita::count())->toBe(1);
});

test('no se puede crear una cita fuera del horario del médico', function () {
    $this->actingAs($this->admin)
        ->post(route('citas.store'), agendaDatosCita($this->medico, $this->paciente, $this->lunes->copy()->setTime(18, 0)))
        ->assertSessionHasErrors([
            'hora_inicio' => 'La cita queda fuera del horario de atención del médico.',
        ]);

    expect(Cita::count())->toBe(0);
});

test('no se puede crear una cita un día en que el médico no atiende', function () {
    $martes = $this->lunes->copy()->addDay()->setTime(10, 0);

    $this->actingAs($this->admin)
        ->post(route('citas.store'), agendaDatosCita($this->medico, $this->paciente, $martes))
        ->assertSessionHasErrors([
            'hora_inicio' => 'La cita queda fuera del horario de atención del médico.',
        ]);
});

test('se pueden crear citas seguidas del mismo médico', function () {
    agendaCita($this->medico, $this->paciente, $this->lunes->copy()->setTime(9, 0));

    $this->actingAs($this->admin)
        ->post(route('citas.store'), agendaDatosCita($this->medico, $this->paciente, $this->lunes->copy()->setTime(9, 30)))
        ->assertSessionHasNoErrors();

    expect(Cita::count())->toBe(2);
});

test('una cita cancelada libera el espacio para otra', function () {
    agendaCita($this->medico, $this->paciente, $this->lunes->copy()->setTime(9, 0), Cita::ESTADO_CANCELADA);

    $this->actingAs($this->admin)
        ->post(route('citas.store'), agendaDatosCita($this->medico, $this->paciente, $this->lunes->copy()->setTime(9, 15)))
        ->assertSessionHasNoErrors();

    expect(Cita::count())->toBe(2);
});

test('el formulario de editar trae los datos de la cita', function () {
    $cita = agendaCita($this->medico, $this->paciente, $this->lunes->copy()->setTime(9, 0), Cita::ESTADO_CONFIRMADA);

    $this->actingAs($this->admin)
        ->get(route('citas.edit', $cita))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('citas/edit')
            ->where('cita.id', $cita->id)
            ->where('cita.fecha', $this->lunes->toDateString())
            ->where('cita.hora_inicio', '09:00')
            ->where('cita.estado', Cita::ESTADO_CONFIRMADA)
            ->where('cita.hora_llegada', null)
            ->has('estados', 7)
            ->has('pacientes', 1)
            ->has('medicos', 1));
});

test('el administrador puede reprogramar una cita', function () {
    $cita = agendaCita($this->medico, $this->paciente, $this->lunes->copy()->setTime(9, 0));
    $nuevo = $this->lunes->copy()->setTime(11, 0);

    $this->actingAs($this->admin)
        ->put(route('citas.update', $cita), agendaDatosCita($this->medico, $this->paciente, $nuevo, [
            'estado' => Cita::ESTADO_CONFIRMADA,
        ]))
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('agenda.index', ['fecha' => $nuevo->toDateString()]));

    $cita->refresh();

    expect($cita->inicia_en->format('H:i'))->toBe('11:00')
        ->and($cita->termina_en->format('H:i'))->toBe('11:30')
        ->and($cita->estado)->toBe(Cita::ESTADO_CONFIRMADA);
});

test('al editar sin enviar el estado se conserva el que tenía', function () {
    $cita = agendaCita($this->medico, $this->paciente, $this->lunes->copy()->setTime(9, 0), Cita::ESTADO_CONFIRMADA);

    $this->actingAs($this->admin)
        ->put(route('citas.update', $cita), agendaDatosCita($this->medico, $this->paciente, $this->lunes->copy()->setTime(10, 0)))
        ->assertSessionHasNoErrors();

    expect($cita->refresh()->estado)->toBe(Cita::ESTADO_CONFIRMADA);
});

test('se puede registrar la hora de llegada y el estado en espera', function () {
    $cita = agendaCita($this->medico, $this->paciente, $this->lunes->copy()->setTime(9, 0), Cita::ESTADO_CONFIRMADA);

    $this->actingAs($this->admin)
        ->put(route('citas.update', $cita), agendaDatosCita($this->medico, $this->paciente, $this->lunes->copy()->setTime(9, 0), [
            'estado' => Cita::ESTADO_EN_ESPERA,
            'hora_llegada' => '08:50',
        ]))
        ->assertSessionHasNoErrors();

    $cita->refresh();

    expect($cita->estado)->toBe(Cita::ESTADO_EN_ESPERA)
        ->and($cita->hora_llegada->format('H:i'))->toBe('08:50');
});

test('se puede guardar una cita sin cambiar su hora', function () {
    $cita = agendaCita($this->medico, $this->paciente, $this->lunes->copy()->setTime(9, 0));

    $this->actingAs($this->admin)
        ->put(route('citas.update', $cita), agendaDatosCita($this->medico, $this->paciente, $this->lunes->copy()->setTime(9, 0)))
        ->assertSessionHasNoErrors();
});

test('al reprogramar no se puede cruzar con otra cita del médico', function () {
    $cita = agendaCita($this->medico, $this->paciente, $this->lunes->copy()->setTime(9, 0));
    agendaCita($this->medico, agendaPaciente('Carlos Mejía'), $this->lunes->copy()->setTime(10, 0));

    $this->actingAs($this->admin)
        ->put(route('citas.update', $cita), agendaDatosCita($this->medico, $this->paciente, $this->lunes->copy()->setTime(10, 15)))
        ->assertSessionHasErrors([
            'hora_inicio' => 'Se cruza con otra cita del médico de 10:00 a 10:30.',
        ]);

    expect($cita->refresh()->inicia_en->format('H:i'))->toBe('09:00');
});

test('al reprogramar no se puede pasar fuera del horario del médico', function () {
    $cita = agendaCita($this->medico, $this->paciente, $this->lunes->copy()->setTime(9, 0));

    $this->actingAs($this->admin)
        ->put(route('citas.update', $cita), agendaDatosCita($this->medico, $this->paciente, $this->lunes->copy()->setTime(13, 0)))
        ->assertSessionHasErrors('hora_inicio');

    expect($cita->refresh()->inicia_en->format('H:i'))->toBe('09:00');
});

test('el administrador puede cancelar una cita', function () {
    $cita = agendaCita($this->medico, $this->paciente, $this->lunes->copy()->setTime(9, 0));

    $this->actingAs($this->admin)
        ->patch(route('citas.cancelar', $cita))
        ->assertSessionHasNoErrors();

    expect($cita->refresh()->estado)->toBe(Cita::ESTADO_CANCELADA);
});

test('no se cancela una cita que ya está cancelada', function () {
    $cita = agendaCita($this->medico, $this->paciente, $this->lunes->copy()->setTime(9, 0), Cita::ESTADO_CANCELADA);

    $this->actingAs($this->admin)
        ->patch(route('citas.cancelar', $cita))
        ->assertSessionHasErrors(['cancelar' => 'La cita ya está cancelada.']);
});

test('no se cancela una cita que ya fue atendida', function () {
    $cita = agendaCita($this->medico, $this->paciente, $this->lunes->copy()->setTime(9, 0), Cita::ESTADO_ATENDIDA);

    $this->actingAs($this->admin)
        ->patch(route('citas.cancelar', $cita))
        ->assertSessionHasErrors(['cancelar' => 'No se puede cancelar una cita que ya fue atendida.']);

    expect($cita->refresh()->estado)->toBe(Cita::ESTADO_ATENDIDA);
});

test('un médico no puede cancelar citas', function () {
    $cita = agendaCita($this->medico, $this->paciente, $this->lunes->copy()->setTime(9, 0));

    $this->actingAs($this->medico->usuario)
        ->patch(route('citas.cancelar', $cita))
        ->assertForbidden();

    expect($cita->refresh()->estado)->toBe(Cita::ESTADO_PENDIENTE);
});

test('el administrador puede eliminar una cita sin consulta', function () {
    $cita = agendaCita($this->medico, $this->paciente, $this->lunes->copy()->setTime(9, 0));

    $this->actingAs($this->admin)
        ->delete(route('citas.destroy', $cita))
        ->assertRedirect(route('agenda.index'));

    $this->assertModelMissing($cita);
});

test('no se elimina una cita con consulta registrada y se muestra el motivo', function () {
    $cita = agendaCita($this->medico, $this->paciente, $this->lunes->copy()->setTime(9, 0), Cita::ESTADO_ATENDIDA);

    Consulta::create([
        'cita_id' => $cita->id,
        'sintomas' => 'Dolor de cabeza',
        'diagnostico' => 'Migraña',
        'notas' => 'Reposo',
        'signos_vitales' => ['presion' => '120/80'],
    ]);

    $this->actingAs($this->admin)
        ->delete(route('citas.destroy', $cita))
        ->assertSessionHasErrors([
            'eliminar' => 'No se puede eliminar la cita porque tiene una consulta registrada.',
        ]);

    $this->assertModelExists($cita);
});