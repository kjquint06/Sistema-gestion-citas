<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('antecedentes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paciente_id')->constrained('pacientes')->cascadeOnDelete();
            // Ej.: personal, familiar, quirúrgico, hospitalización
            $table->string('tipo');
            $table->text('descripcion');
            $table->date('fecha')->nullable();
            $table->timestamps();

            $table->index('paciente_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('antecedentes');
    }
};