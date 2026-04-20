<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('empresas', function (Blueprint $table) {
            $table->unique('nome', 'empresas_nome_unique');
            $table->unique('nome_comercial', 'empresas_nome_comercial_unique');
            $table->unique('nif', 'empresas_nif_unique');
            $table->unique('tipo_empresa', 'empresas_tipo_empresa_unique');
            $table->unique('email', 'empresas_email_unique');
        });
    }

    public function down(): void
    {
        Schema::table('empresas', function (Blueprint $table) {
            $table->dropUnique('empresas_nome_unique');
            $table->dropUnique('empresas_nome_comercial_unique');
            $table->dropUnique('empresas_nif_unique');
            $table->dropUnique('empresas_tipo_empresa_unique');
            $table->dropUnique('empresas_email_unique');
        });
    }
};
