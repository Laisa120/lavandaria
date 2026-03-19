<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Servico extends Model
{
    use HasFactory;

    protected $fillable = [
        'empresa_id',
        'nome',
        'preco',
        'categoria',
    ];

    protected $casts = [
        'preco' => 'float',
    ];

    public function empresa()
    {
        return $this->belongsTo(Empresa::class);
    }
}
