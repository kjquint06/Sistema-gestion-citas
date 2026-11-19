<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bloqueos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medico_id')->constrained('medicos')->cascadeOnDelete();
            $table->dateTime('inicia_en');
            $table->dateTime('termina_en');
            $table->string('motivo')->nullable();
            $table->timestamps();

            $table->index(['medico_id', 'inicia_en']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bloqueos');
    }
};
