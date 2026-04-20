<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProdutoEstoque extends Model
{
    use HasFactory;

    protected $table = 'produtos_estoque';

    protected $fillable = [
        'empresa_id',
        'nome',
        'categoria',
        'quantidade_atual',
        'quantidade_minima',
        'unidade',
        'servico_id',
        'consumo_por_venda',
    ];

    protected $casts = [
        'quantidade_atual' => 'float',
        'quantidade_minima' => 'float',
        'consumo_por_venda' => 'float',
    ];

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class);
    }

    public function servico(): BelongsTo
    {
        return $this->belongsTo(Servico::class);
    }

    public function movimentacoes(): HasMany
    {
        return $this->hasMany(MovimentacaoEstoque::class, 'produto_estoque_id');
    }
}
