<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('empresas', function (Blueprint $table) {
            $table->id();
            $table->text('logo')->nullable();
            $table->string('nome');
            $table->string('nome_comercial')->nullable();
            $table->string('nif')->nullable();
            $table->string('tipo_empresa')->nullable();
            $table->string('pais')->nullable();
            $table->string('provincia')->nullable();
            $table->string('municipio')->nullable();
            $table->string('endereco_completo')->nullable();
            $table->string('codigo_postal')->nullable();
            $table->string('telefone')->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            $table->enum('regime_iva', ['geral', 'nao_sujeicao', 'isento'])->default('geral');
            $table->decimal('taxa_iva_padrao', 5, 2)->default(14);
            $table->string('moeda')->default('Kz');
            $table->string('serie_fatura')->default('FT');
            $table->integer('numero_inicial_fatura')->default(1);
            $table->decimal('taxa_retencao', 5, 2)->nullable();
            $table->string('banco')->nullable();
            $table->string('numero_conta')->nullable();
            $table->string('iban')->nullable();
            $table->enum('modelo_fatura', ['A4', 'thermal'])->default('A4');
            $table->string('formato_numero_fatura')->default('SERIE/NUMERO');
            $table->boolean('permitir_venda_credito')->default(false);
            $table->integer('dias_vencimento_padrao')->default(30);
            $table->boolean('permitir_desconto_global')->default(true);
            $table->string('nome_impressora')->nullable();
            $table->enum('tipo_conexao_impressora', ['usb', 'network', 'bluetooth'])->default('usb');
            $table->string('ip_impressora')->nullable();
            $table->boolean('impressao_automatica')->default(false);
            $table->boolean('download_pdf_automatico')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('empresas');
    }
};
