<?php

use App\Models\Cita;
use App\Models\Especialidad;
use App\Models\Medico;
use App\Models\Paciente;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function crearMedicoReporte(string $nombre, string $colegiado): Medico
{
    $especialidad = Especialidad::firstOrCreate(['nombre' => 'Medicina General']);

    return Medico::create([
        'usuario_id' => User::factory()->create(['name' => $nombre, 'rol' => User::ROL_MEDICO])->id,
        'especialidad_id' => $especialidad->id,
        'numero_colegiado' => $colegiado,
    ]);
}

function crearCitaReporte(Medico $medico, Paciente $paciente, string $inicio, string $estado): Cita
{
    return Cita::create([
        'medico_id' => $medico->id,
        'paciente_id' => $paciente->id,
        'inicia_en' => $inicio,
        'termina_en' => date('Y-m-d H:i:s', (int) strtotime($inicio.' +30 minutes')),
        'estado' => $estado,
    ]);
}

beforeEach(function () {
    $this->admin = User::factory()->create(['rol' => User::ROL_ADMIN]);

    $paciente = Paciente::create([
        'usuario_id' => User::factory()->create(['rol' => User::ROL_PACIENTE])->id,
        'fecha_nacimiento' => '1990-05-10',
        'sexo' => 'masculino',
    ]);

    $this->medicoA = crearMedicoReporte('Dra. Ana', 'CMH-1');
    $this->medicoB = crearMedicoReporte('Dr. Beto', 'CMH-2');

    // Dentro del rango 2026-11-01 al 2026-11-15
    crearCitaReporte($this->medicoA, $paciente, '2026-11-02 08:00:00', Cita::ESTADO_ATENDIDA);
    crearCitaReporte($this->medicoA, $paciente, '2026-11-03 08:00:00', Cita::ESTADO_PENDIENTE);
    crearCitaReporte($this->medicoA, $paciente, '2026-11-15 17:00:00', Cita::ESTADO_CANCELADA);
    crearCitaReporte($this->medicoB, $paciente, '2026-11-10 09:00:00', Cita::ESTADO_CONFIRMADA);

    // Fuera del rango
    crearCitaReporte($this->medicoB, $paciente, '2026-10-31 09:00:00', Cita::ESTADO_ATENDIDA);
    crearCitaReporte($this->medicoB, $paciente, '2026-11-16 09:00:00', Cita::ESTADO_PENDIENTE);
});

test('el reporte cuenta solo las citas del rango y por estado', function () {
    $this->actingAs($this->admin)
        ->get(route('reportes.index', ['desde' => '2026-11-01', 'hasta' => '2026-11-15']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('reportes/index')
            ->where('filtros.desde', '2026-11-01')
            ->where('filtros.hasta', '2026-11-15')
            ->where('total', 4)
            ->where('porEstado.pendiente', 1)
            ->where('porEstado.confirmada', 1)
            ->where('porEstado.atendida', 1)
            ->where('porEstado.cancelada', 1)
            ->where('porEstado.inasistencia', 0)
            ->has('porMedico', 2)
            ->where('porMedico.0.nombre', 'Dra. Ana')
            ->where('porMedico.0.total', 3)
            ->where('porMedico.0.atendida', 1)
            ->where('porMedico.1.nombre', 'Dr. Beto')
            ->where('porMedico.1.total', 1)
            ->where('porMedico.1.confirmada', 1));
});

test('el reporte cambia al modificar el rango de fechas', function () {
    $this->actingAs($this->admin)
        ->get(route('reportes.index', ['desde' => '2026-10-01', 'hasta' => '2026-11-30']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('total', 6)
            ->where('porEstado.atendida', 2)
            ->where('porEstado.pendiente', 2));

    $this->actingAs($this->admin)
        ->get(route('reportes.index', ['desde' => '2026-12-01', 'hasta' => '2026-12-31']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('total', 0)
            ->where('porMedico.0.total', 0));
});

test('sin fechas el reporte usa el mes actual', function () {
    $this->actingAs($this->admin)
        ->get(route('reportes.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('filtros.desde', now()->startOfMonth()->toDateString())
            ->where('filtros.hasta', now()->endOfMonth()->toDateString()));
});

test('hasta no puede ser anterior a desde', function () {
    $this->actingAs($this->admin)
        ->get(route('reportes.index', ['desde' => '2026-11-15', 'hasta' => '2026-11-01']))
        ->assertSessionHasErrors('hasta');
});

test('el paciente no puede ver reportes', function () {
    $paciente = User::factory()->create(['rol' => User::ROL_PACIENTE]);

    $this->actingAs($paciente)
        ->get(route('reportes.index'))
        ->assertForbidden();
});
