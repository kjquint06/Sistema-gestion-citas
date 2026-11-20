<?php

use App\Models\Bloqueo;
use App\Models\Cita;
use App\Models\User;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;

require_once __DIR__.'/Concerns/AgendaHelpers.php';

beforeEach(function () {
    $this->lunes = agendaLunes();

    $this->ana = agendaMedico('Ana Morales', 30, 'Pediatría');
    $this->luis = agendaMedico('Luis Fuentes', 30, 'Cardiología');
    agendaHorario($this->ana, 1, '08:00', '12:00');

    $this->carlos = agendaPaciente('Carlos Mejía');
    $this->lucia = agendaPaciente('Lucía Fernández');
});

function urlSemana(Carbon $lunes): string
{
    return route('agenda.index', ['semana' => $lunes->toDateString()]);
}

test('el médico ve su agenda semanal solo con sus citas', function () {
    $citaAna = agendaCita($this->ana, $this->carlos, $this->lunes->copy()->setTime(9, 0));
    agendaCita($this->luis, $this->lucia, $this->lunes->copy()->setTime(14, 0));

    $this->actingAs($this->ana->usuario)
        ->get(urlSemana($this->lunes))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('medico/agenda')
            ->where('semana.inicio', $this->lunes->toDateString())
            ->has('semana.dias', 7)
            ->has('citas', 1)
            ->where('citas.0.id', $citaAna->id)
            ->where('citas.0.fecha', $this->lunes->toDateString())
            ->where('citas.0.inicio', '09:00')
            ->where('citas.0.estado', Cita::ESTADO_PENDIENTE)
            ->where('citas.0.paciente.nombre', 'Carlos Mejía')
        );
});

test('la agenda navega entre semanas', function () {
    agendaCita($this->ana, $this->carlos, $this->lunes->copy()->setTime(9, 0));
    $siguiente = $this->lunes->copy()->addWeek();

    $this->actingAs($this->ana->usuario)
        ->get(urlSemana($siguiente))
        ->assertInertia(fn (Assert $page) => $page
            ->where('semana.inicio', $siguiente->toDateString())
            ->where('semana.anterior', $this->lunes->toDateString())
            ->has('citas', 0)
        );
});

test('una semana inválida usa la semana actual', function () {
    $this->actingAs($this->ana->usuario)
        ->get(route('agenda.index', ['semana' => 'no-es-fecha']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('semana.inicio', Carbon::today()->startOfWeek(Carbon::MONDAY)->toDateString())
        );
});

test('las tarjetas cuentan las citas de hoy, en espera y confirmadas', function () {
    agendaCita($this->ana, $this->carlos, Carbon::today()->setTime(8, 0), Cita::ESTADO_EN_ESPERA);
    agendaCita($this->ana, $this->lucia, Carbon::today()->setTime(9, 0), Cita::ESTADO_CONFIRMADA);
    agendaCita($this->ana, $this->carlos, Carbon::today()->setTime(10, 0), Cita::ESTADO_CANCELADA);
    agendaCita($this->luis, $this->lucia, Carbon::today()->setTime(11, 0), Cita::ESTADO_CONFIRMADA);

    $this->actingAs($this->ana->usuario)
        ->get(route('agenda.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('tarjetas.citas_hoy', 2)
            ->where('tarjetas.en_espera', 1)
            ->where('tarjetas.confirmadas', 1)
        );
});

test('los bloqueos del médico se ven en su día', function () {
    Bloqueo::create([
        'medico_id' => $this->ana->id,
        'inicia_en' => $this->lunes->copy()->setTime(10, 0),
        'termina_en' => $this->lunes->copy()->setTime(11, 0),
        'motivo' => 'Reunión',
    ]);
    Bloqueo::create([
        'medico_id' => $this->luis->id,
        'inicia_en' => $this->lunes->copy()->setTime(10, 0),
        'termina_en' => $this->lunes->copy()->setTime(11, 0),
        'motivo' => 'De otro médico',
    ]);

    $this->actingAs($this->ana->usuario)
        ->get(urlSemana($this->lunes))
        ->assertInertia(fn (Assert $page) => $page
            ->has('bloqueos', 1)
            ->where('bloqueos.0.fecha', $this->lunes->toDateString())
            ->where('bloqueos.0.inicio', '10:00')
            ->where('bloqueos.0.fin', '11:00')
            ->where('bloqueos.0.motivo', 'Reunión')
        );
});

test('la tabla muestra solo los pacientes que el médico ya atendió', function () {
    agendaCita($this->ana, $this->carlos, $this->lunes->copy()->subWeeks(2)->setTime(9, 0), Cita::ESTADO_ATENDIDA);
    agendaCita($this->ana, $this->lucia, $this->lunes->copy()->setTime(10, 0));
    agendaCita($this->luis, $this->lucia, $this->lunes->copy()->subWeeks(2)->setTime(14, 0), Cita::ESTADO_ATENDIDA);

    $this->actingAs($this->ana->usuario)
        ->get(route('agenda.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('pacientesAtendidos', 1)
            ->where('pacientesAtendidos.0.id', $this->carlos->id)
            ->where('pacientesAtendidos.0.visitas', 1)
        );
});

test('el médico abre el expediente de sus pacientes en solo lectura', function () {
    agendaCita($this->ana, $this->carlos, $this->lunes->copy()->setTime(9, 0));

    $this->actingAs($this->ana->usuario)
        ->get(route('expediente-medico.show', $this->carlos))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('pacientes/mi-expediente')
            ->where('paciente.id', $this->carlos->id)
            ->where('encabezado.titulo', 'Expediente de Carlos Mejía')
        );
});

test('el médico no abre el expediente de pacientes que no son suyos', function () {
    agendaCita($this->luis, $this->lucia, $this->lunes->copy()->setTime(14, 0));

    $this->actingAs($this->ana->usuario)
        ->get(route('expediente-medico.show', $this->lucia))
        ->assertForbidden();
});

test('solo el médico puede usar la ruta del expediente del médico', function (string $rol) {
    agendaCita($this->ana, $this->carlos, $this->lunes->copy()->setTime(9, 0));

    $this->actingAs(agendaUsuario($rol))
        ->get(route('expediente-medico.show', $this->carlos))
        ->assertForbidden();
})->with([User::ROL_ADMIN, User::ROL_RECEPCIONISTA, User::ROL_PACIENTE]);

test('el paciente sigue viendo su propio expediente igual que antes', function () {
    $this->actingAs($this->carlos->usuario)
        ->get(route('mi-expediente.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('pacientes/mi-expediente')
            ->where('paciente.id', $this->carlos->id)
            ->missing('encabezado')
        );
});
