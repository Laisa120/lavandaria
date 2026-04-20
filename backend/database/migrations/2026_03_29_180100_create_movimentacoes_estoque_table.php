<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('movimentacoes_estoque', function (Blueprint $table) {
            $table->id();
            $table->foreignId('produto_estoque_id')->constrained('produtos_estoque')->cascadeOnDelete();
            $table->enum('tipo', ['entrada', 'saida']);
            $table->decimal('quantidade', 12, 2);
            $table->text('observacao')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('movimentacoes_estoque');
    }
};
