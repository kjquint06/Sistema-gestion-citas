<?php

use App\Http\Controllers\MedicoController;
use App\Http\Controllers\PacienteController;
use App\Models\User;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/login')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Resumen: todos los roles
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Agenda: todos los roles (el paciente ve solo sus citas)
    Route::inertia('agenda', 'agenda/index')->name('agenda.index');

    // Pacientes: personal de la clínica
    Route::middleware('rol:'.User::ROL_MEDICO.','.User::ROL_RECEPCIONISTA.','.User::ROL_ADMIN)->group(function () {
        Route::get('pacientes', [PacienteController::class, 'index'])->name('pacientes.index');
    });

    // Expedientes: médico y paciente (el paciente ve solo el suyo)
    Route::middleware('rol:'.User::ROL_MEDICO.','.User::ROL_PACIENTE)->group(function () {
        Route::inertia('expedientes', 'expedientes/index')->name('expedientes.index');
    });

    // Disponibilidad (horarios): médico y administrador
    Route::middleware('rol:'.User::ROL_MEDICO.','.User::ROL_ADMIN)->group(function () {
        Route::get('disponibilidad', [MedicoController::class, 'disponibilidad'])->name('disponibilidad.index');
    });

    // Médicos y especialidades: solo administrador
    Route::middleware('rol:'.User::ROL_ADMIN)->group(function () {
        Route::get('medicos', [MedicoController::class, 'index'])->name('medicos.index');
    });

    // Reportes: personal de la clínica
    Route::middleware('rol:'.User::ROL_MEDICO.','.User::ROL_RECEPCIONISTA.','.User::ROL_ADMIN)->group(function () {
        Route::inertia('reportes', 'reportes/index')->name('reportes.index');
    });
});

require __DIR__.'/settings.php';
