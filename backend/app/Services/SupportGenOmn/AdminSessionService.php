<?php

namespace App\Services\SupportGenOmn;

use App\Models\User;
use Illuminate\Support\Facades\Cache;

class AdminSessionService
{
    private const PREFIX = 'support_genomn_admin_session:';

    public function issue(User $user): string
    {
        $token = bin2hex(random_bytes(32));
        Cache::put(self::PREFIX.$token, [
            'user_id' => $user->id,
            'issued_at' => now()->toISOString(),
        ], now()->addHours(8));

        return $token;
    }

    public function resolve(string $token): ?User
    {
        $payload = Cache::get(self::PREFIX.$token);
        if (! is_array($payload) || ! isset($payload['user_id'])) {
            return null;
        }

        return User::query()->find((int) $payload['user_id']);
    }

    public function revoke(string $token): void
    {
        Cache::forget(self::PREFIX.$token);
    }
}
