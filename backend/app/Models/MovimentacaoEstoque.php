<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MovimentacaoEstoque extends Model
{
    use HasFactory;

    protected $table = 'movimentacoes_estoque';

    protected $fillable = [
        'produto_estoque_id',
        'tipo',
        'quantidade',
        'observacao',
    ];

    protected $casts = [
        'quantidade' => 'float',
    ];

    public function produto(): BelongsTo
    {
        return $this->belongsTo(ProdutoEstoque::class, 'produto_estoque_id');
    }
}
