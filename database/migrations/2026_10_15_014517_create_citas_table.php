<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('citas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paciente_id')->constrained('pacientes')->cascadeOnDelete();
            $table->foreignId('medico_id')->constrained('medicos')->cascadeOnDelete();
            $table->dateTime('inicia_en');
            $table->dateTime('termina_en');
            // pendiente, confirmada, atendida, cancelada, inasistencia
            $table->string('estado')->default('pendiente');
            $table->string('motivo')->nullable();
            $table->timestamps();

            // Evita que dos personas agenden al mismo tiempo con el mismo médico
            $table->unique(['medico_id', 'inicia_en']);
            $table->index(['paciente_id', 'inicia_en']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('citas');
    }
};
