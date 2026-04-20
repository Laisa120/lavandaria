<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('produtos_estoque', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->constrained()->cascadeOnDelete();
            $table->string('nome');
            $table->string('categoria');
            $table->decimal('quantidade_atual', 12, 2)->default(0);
            $table->decimal('quantidade_minima', 12, 2)->default(0);
            $table->string('unidade', 30)->default('un');
            $table->foreignId('servico_id')->nullable()->constrained('servicos')->nullOnDelete();
            $table->decimal('consumo_por_venda', 12, 2)->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('produtos_estoque');
    }
};
