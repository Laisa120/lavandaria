<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ImpersonationSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'admin_id',
        'user_id',
        'token',
        'expires_at',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'active' => 'boolean',
        ];
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
