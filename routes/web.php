<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EspecialidadController;
use App\Http\Controllers\ExpedienteController;
use App\Http\Controllers\MedicoController;
use App\Http\Controllers\PacienteController;
use App\Http\Controllers\UsuarioController;
use App\Models\User;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/login')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Resumen: todos los roles
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    // Agenda: todos los roles (el paciente ve solo sus citas)
    Route::inertia('agenda', 'agenda/index')->name('agenda.index');

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

                // Médicos y especialidades: solo administrador
    Route::middleware('rol:'.User::ROL_ADMIN)->group(function () {
        Route::resource('medicos', MedicoController::class)
            ->parameters(['medicos' => 'medico'])
            ->except('show');
        Route::resource('especialidades', EspecialidadController::class)
            ->parameters(['especialidades' => 'especialidad'])
            ->except('show');
    });

    Route::middleware('rol:'.User::ROL_ADMIN)->group(function () {
        Route::get('usuarios', [UsuarioController::class, 'index'])->name('usuarios.index');
    });

    // Reportes: personal de la clínica
    Route::middleware('rol:'.User::ROL_MEDICO.','.User::ROL_RECEPCIONISTA.','.User::ROL_ADMIN)->group(function () {
        Route::inertia('reportes', 'reportes/index')->name('reportes.index');
    });
});

require __DIR__.'/settings.php';
