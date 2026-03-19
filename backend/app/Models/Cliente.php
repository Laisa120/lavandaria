<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cliente extends Model
{
    use HasFactory;

    protected $fillable = [
        'empresa_id',
        'nome',
        'email',
        'telefone',
        'endereco',
    ];

    public function empresa()
    {
        return $this->belongsTo(Empresa::class);
    }
}
