<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consultas', function (Blueprint $table) {
            $table->id();
            // Una cita genera una sola consulta
            $table->foreignId('cita_id')->unique()->constrained('citas')->cascadeOnDelete();
            $table->text('sintomas')->nullable();
            $table->text('diagnostico')->nullable();
            $table->text('notas')->nullable();
            $table->json('signos_vitales')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consultas');
    }
};
