<?php

use App\Models\Cita;
use App\Models\User;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;

require_once __DIR__.'/Concerns/AgendaHelpers.php';

function urlAgendaLunes(array $extra = []): string
{
    return route('agenda.index', ['fecha' => agendaLunes()->toDateString()] + $extra);
}

beforeEach(function () {
    $this->lunes = agendaLunes();

    $this->ana = agendaMedico('Ana Morales', 30, 'Pediatría');
    $this->luis = agendaMedico('Luis Fuentes', 30, 'Cardiología');
    agendaHorario($this->ana, 1, '08:00', '12:00');
    agendaHorario($this->luis, 1, '14:00', '17:00');

    $this->carlos = agendaPaciente('Carlos Mejía');
    $this->lucia = agendaPaciente('Lucía Fernández');

    $this->citaAna = agendaCita($this->ana, $this->carlos, $this->lunes->copy()->setTime(9, 0));
    $this->citaLuis = agendaCita($this->luis, $this->lucia, $this->lunes->copy()->setTime(14, 0), Cita::ESTADO_CONFIRMADA);
});

test('los invitados son enviados al login', function () {
    $this->get(route('agenda.index'))->assertRedirect(route('login'));
});

test('el administrador ve la vista Día con una columna por médico', function () {
    $this->actingAs(agendaAdmin())
        ->get(urlAgendaLunes())
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('agenda/index')
            ->where('rol', User::ROL_ADMIN)
            ->where('puedeGestionar', true)
            ->where('fecha', $this->lunes->toDateString())
            ->has('medicosFiltro', 2)
            ->has('medicos', 2)
            ->where('medicos.0.nombre', 'Ana Morales')
            ->where('medicos.0.iniciales', 'AM')
            ->where('medicos.0.especialidad', 'Pediatría')
            ->where('medicos.0.consultorio', 'Consultorio 101')
            ->where('medicos.0.duracion_cita', 30)
            ->where('medicos.0.horarios.0.inicio', '08:00')
            ->where('medicos.0.horarios.0.fin', '12:00')
            ->where('medicos.1.nombre', 'Luis Fuentes')
            ->has('citas', 2));
});

test('cada cita trae los datos del panel de detalle', function () {
    $this->citaAna->update(['hora_llegada' => $this->lunes->copy()->setTime(8, 50)]);

    $this->actingAs(agendaAdmin())
        ->get(urlAgendaLunes())
        ->assertInertia(fn (Assert $page) => $page
            ->where('citas.0.id', $this->citaAna->id)
            ->where('citas.0.medico', 'Ana Morales')
            ->where('citas.0.consultorio', 'Consultorio 101')
            ->where('citas.0.inicio', '09:00')
            ->where('citas.0.fin', '09:30')
            ->where('citas.0.duracion', 30)
            ->where('citas.0.hora_llegada', '08:50')
            ->where('citas.0.estado', Cita::ESTADO_PENDIENTE)
            ->where('citas.0.motivo', 'Control general')
            ->where('citas.0.paciente.nombre', 'Carlos Mejía')
            ->where('citas.0.paciente.iniciales', 'CM')
            ->where('citas.0.paciente.expediente', 'EXP-'.str_pad((string) $this->carlos->id, 5, '0', STR_PAD_LEFT))
            ->where('citas.0.paciente.edad', Carbon::parse('1995-03-12')->age)
            ->where('citas.1.estado', Cita::ESTADO_CONFIRMADA)
            ->where('citas.1.hora_llegada', null));
});

test('el resumen calcula citas, médicos, bloque y disponibilidad', function () {
    $this->actingAs(agendaAdmin())
        ->get(urlAgendaLunes())
        ->assertInertia(fn (Assert $page) => $page
            ->where('resumen.citas', 2)
            ->where('resumen.medicos', 2)
            ->where('resumen.bloque_minutos', 30)
            ->where('resumen.bloques_totales', 14)
            ->where('resumen.bloques_libres', 12)
            ->where('horas.inicio', 8)
            ->where('horas.fin', 17));
});

test('el bloque estándar es variable si los médicos tienen duraciones distintas', function () {
    $this->luis->update(['duracion_cita' => 45]);

    $this->actingAs(agendaAdmin())
        ->get(urlAgendaLunes())
        ->assertInertia(fn (Assert $page) => $page
            ->where('resumen.bloque_minutos', null)
            ->where('resumen.bloques_totales', 12)
            ->where('resumen.bloques_libres', 10));
});

test('la tira de la semana trae el número de citas de cada día', function () {
    $this->actingAs(agendaAdmin())
        ->get(urlAgendaLunes())
        ->assertInertia(fn (Assert $page) => $page
            ->has('semana', 7)
            ->where('semana.0.fecha', $this->lunes->toDateString())
            ->where('semana.0.citas', 2)
            ->where('semana.0.atiende', true)
            ->where('semana.1.citas', 0)
            ->where('semana.1.atiende', false)
            ->where('semana.6.atiende', false));
});

test('las citas canceladas se muestran pero no cuentan en el resumen', function () {
    agendaCita($this->ana, $this->lucia, $this->lunes->copy()->setTime(10, 0), Cita::ESTADO_CANCELADA);

    $this->actingAs(agendaAdmin())
        ->get(urlAgendaLunes())
        ->assertInertia(fn (Assert $page) => $page
            ->has('citas', 3)
            ->where('citas.1.estado', Cita::ESTADO_CANCELADA)
            ->where('resumen.citas', 2)
            ->where('semana.0.citas', 2)
            ->where('resumen.bloques_libres', 12));
});

test('se puede filtrar la agenda por médico', function () {
    $this->actingAs(agendaAdmin())
        ->get(urlAgendaLunes(['medico_id' => $this->luis->id]))
        ->assertInertia(fn (Assert $page) => $page
            ->where('filtros.medico_id', $this->luis->id)
            ->has('medicos', 1)
            ->where('medicos.0.nombre', 'Luis Fuentes')
            ->has('citas', 1)
            ->where('resumen.medicos', 1)
            ->where('semana.0.citas', 1));
});

test('un día sin atención no muestra columnas', function () {
    $miercoles = $this->lunes->copy()->addDays(2)->toDateString();

    $this->actingAs(agendaAdmin())
        ->get(route('agenda.index', ['fecha' => $miercoles]))
        ->assertInertia(fn (Assert $page) => $page
            ->has('medicos', 0)
            ->has('citas', 0)
            ->where('resumen.citas', 0)
            ->where('resumen.bloque_minutos', null)
            ->where('horas.inicio', 8)
            ->where('horas.fin', 17));
});

test('un médico con cita en un día sin horario aparece igual en la agenda', function () {
    agendaCita($this->ana, $this->carlos, $this->lunes->copy()->addDay()->setTime(10, 0));

    $this->actingAs(agendaAdmin())
        ->get(route('agenda.index', ['fecha' => $this->lunes->copy()->addDay()->toDateString()]))
        ->assertInertia(fn (Assert $page) => $page
            ->has('medicos', 1)
            ->where('medicos.0.nombre', 'Ana Morales')
            ->has('medicos.0.horarios', 0)
            ->has('citas', 1));
});

test('una fecha inválida usa el día de hoy', function () {
    $this->actingAs(agendaAdmin())
        ->get(route('agenda.index', ['fecha' => 'hola']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('fecha', now()->toDateString())
            ->where('hoy', now()->toDateString()));
});

test('recepción ve toda la agenda y puede gestionarla', function () {
    $this->actingAs(agendaUsuario(User::ROL_RECEPCIONISTA))
        ->get(urlAgendaLunes())
        ->assertInertia(fn (Assert $page) => $page
            ->where('rol', User::ROL_RECEPCIONISTA)
            ->where('puedeGestionar', true)
            ->has('medicos', 2)
            ->has('citas', 2));
});

test('un médico ve solo sus citas y no puede gestionar la agenda', function () {
    $this->actingAs($this->ana->usuario)
        ->get(urlAgendaLunes(['medico_id' => $this->luis->id]))
        ->assertInertia(fn (Assert $page) => $page
            ->where('rol', User::ROL_MEDICO)
            ->where('puedeGestionar', false)
            ->has('medicosFiltro', 0)
            ->has('medicos', 1)
            ->where('medicos.0.nombre', 'Ana Morales')
            ->has('citas', 1)
            ->where('citas.0.id', $this->citaAna->id));
});

test('un paciente ve solo sus propias citas', function () {
    $this->actingAs($this->carlos->usuario)
        ->get(urlAgendaLunes())
        ->assertInertia(fn (Assert $page) => $page
            ->where('rol', User::ROL_PACIENTE)
            ->where('puedeGestionar', false)
            ->has('medicosFiltro', 0)
            ->has('medicos', 1)
            ->where('medicos.0.nombre', 'Ana Morales')
            ->has('citas', 1)
            ->where('citas.0.paciente.nombre', 'Carlos Mejía'));
});