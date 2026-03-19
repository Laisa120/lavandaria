<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pedido extends Model
{
    use HasFactory;

    protected $fillable = [
        'empresa_id',
        'cliente_id',
        'created_by_user_id',
        'data_pedido',
        'entrega_prevista',
        'status',
        'status_pagamento',
        'total',
    ];

    protected $casts = [
        'data_pedido' => 'date',
        'entrega_prevista' => 'datetime',
        'total' => 'float',
    ];

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class);
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class);
    }

    public function criadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function itens(): HasMany
    {
        return $this->hasMany(ItemPedido::class);
    }
}
