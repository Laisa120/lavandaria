<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ItemPedido extends Model
{
    use HasFactory;

    protected $table = 'item_pedidos';

    protected $fillable = [
        'pedido_id',
        'servico_id',
        'quantidade',
        'preco_unitario',
        'subtotal',
    ];

    protected $casts = [
        'preco_unitario' => 'float',
        'subtotal' => 'float',
    ];

    public function pedido()
    {
        return $this->belongsTo(Pedido::class);
    }

    public function servico()
    {
        return $this->belongsTo(Servico::class);
    }
}
