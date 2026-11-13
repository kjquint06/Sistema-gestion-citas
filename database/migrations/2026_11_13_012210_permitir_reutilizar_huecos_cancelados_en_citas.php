<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Columna calculada: NULL si la cita está cancelada
        Schema::table('citas', function (Blueprint $table) {
            $table->dateTime('inicia_en_activa')
                ->nullable()
                ->virtualAs("CASE WHEN estado = 'cancelada' THEN NULL ELSE inicia_en END");
        });

        // 2. Nuevo único: solo cuentan las citas no canceladas
        Schema::table('citas', function (Blueprint $table) {
            $table->unique(['medico_id', 'inicia_en_activa']);
        });

        // 3. Se elimina el único anterior
        Schema::table('citas', function (Blueprint $table) {
            $table->dropUnique(['medico_id', 'inicia_en']);
        });
    }

    public function down(): void
    {
        Schema::table('citas', function (Blueprint $table) {
            $table->unique(['medico_id', 'inicia_en']);
        });

        Schema::table('citas', function (Blueprint $table) {
            $table->dropUnique(['medico_id', 'inicia_en_activa']);
        });

        Schema::table('citas', function (Blueprint $table) {
            $table->dropColumn('inicia_en_activa');
        });
    }
};
