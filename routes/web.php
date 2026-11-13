<?php

use App\Http\Controllers\AgendaController;
use App\Http\Controllers\CitaController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EspecialidadController;
use App\Http\Controllers\ExpedienteController;
use App\Http\Controllers\HorarioController;
use App\Http\Controllers\MedicoController;
use App\Http\Controllers\Paciente\MiExpedienteController;
use App\Http\Controllers\PacienteController;
use App\Http\Controllers\ReporteController;
use App\Http\Controllers\UsuarioController;
use App\Models\User;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/login')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Resumen: todos los roles
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    // Agenda: todos los roles (el paciente ve solo sus citas)
    Route::get('agenda', [AgendaController::class, 'index'])->name('agenda.index');
    Route::middleware('rol:'.User::ROL_PACIENTE)->group(function () {
        Route::get('mis-citas/crear', [CitaController::class, 'crearPaciente'])
            ->name('mis-citas.crear');

        Route::post('mis-citas', [CitaController::class, 'guardarPaciente'])
            ->name('mis-citas.guardar');

        Route::get('mis-citas/{cita}/reprogramar', [CitaController::class, 'reprogramarPaciente'])
            ->name('mis-citas.reprogramar');

        Route::put('mis-citas/{cita}', [CitaController::class, 'actualizarPaciente'])
            ->name('mis-citas.actualizar');

        Route::patch('mis-citas/{cita}/cancelar', [CitaController::class, 'cancelarPaciente'])
            ->name('mis-citas.cancelar');

        Route::get('mis-citas/disponibilidad', [CitaController::class, 'disponibilidadPaciente'])
            ->name('mis-citas.disponibilidad');

        Route::get('mi-expediente', [MiExpedienteController::class, 'index'])
            ->name('mi-expediente.index');
    });

    // Pacientes: personal de la clínica
    Route::middleware('rol:'.User::ROL_MEDICO.','.User::ROL_RECEPCIONISTA.','.User::ROL_ADMIN)->group(function () {
        Route::get('pacientes', [PacienteController::class, 'index'])->name('pacientes.index');
    });

    // Expedientes: médico y paciente (el paciente ve solo el suyo)
    Route::middleware('rol:'.User::ROL_MEDICO.','.User::ROL_PACIENTE.','.User::ROL_ADMIN)->group(function () {
        Route::get('expedientes', [ExpedienteController::class, 'index'])->name('expedientes.index');
        Route::get('expedientes/{paciente}', [ExpedienteController::class, 'show'])->name('expedientes.show');
    });

    // Disponibilidad (horarios): médico y administrador
    Route::middleware('rol:'.User::ROL_MEDICO.','.User::ROL_ADMIN)->group(function () {
        Route::get('disponibilidad', [MedicoController::class, 'disponibilidad'])->name('disponibilidad.index');
    });

    // Médicos, especialidades, horarios y citas: solo administrador
    Route::middleware('rol:'.User::ROL_ADMIN)->group(function () {
        Route::resource('medicos', MedicoController::class)
            ->parameters(['medicos' => 'medico'])
            ->except('show');
        Route::resource('especialidades', EspecialidadController::class)
            ->parameters(['especialidades' => 'especialidad'])
            ->except('show');
        Route::resource('horarios', HorarioController::class)
            ->parameters(['horarios' => 'horario'])
            ->except('show');

        // El listado de citas es la agenda (agenda.index)
        Route::resource('citas', CitaController::class)
            ->parameters(['citas' => 'cita'])
            ->except(['index', 'show']);
        Route::patch('citas/{cita}/cancelar', [CitaController::class, 'cancelar'])->name('citas.cancelar');
    });

    // Usuarios: solo administrador (crear, editar y eliminar cuentas)
    Route::middleware('rol:'.User::ROL_ADMIN)->group(function () {
        Route::resource('usuarios', UsuarioController::class)
            ->except(['show'])
            ->parameters(['usuarios' => 'usuario']);
    });

    // Reportes: personal de la clínica
    Route::middleware('rol:'.User::ROL_MEDICO.','.User::ROL_RECEPCIONISTA.','.User::ROL_ADMIN)->group(function () {
        Route::get('reportes', [ReporteController::class, 'index'])->name('reportes.index');
    });
});

require __DIR__.'/settings.php';
