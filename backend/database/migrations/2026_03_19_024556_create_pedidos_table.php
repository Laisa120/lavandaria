<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pedidos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->constrained()->cascadeOnDelete();
            $table->foreignId('cliente_id')->constrained()->cascadeOnDelete();
            $table->date('data_pedido');
            $table->dateTime('entrega_prevista')->nullable();
            $table->enum('status', ['pending', 'processing', 'ready', 'delivered', 'cancelled'])->default('pending');
            $table->enum('status_pagamento', ['paid', 'unpaid'])->default('unpaid');
            $table->decimal('total', 10, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pedidos');
    }
};
