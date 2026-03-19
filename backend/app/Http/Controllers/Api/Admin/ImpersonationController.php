<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Models\ImpersonationSession;
use App\Models\User;
use App\Services\SupportGenOmn\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ImpersonationController extends ApiController
{
    public function __construct(private readonly AuditLogger $auditLogger)
    {
    }

    public function create(Request $request, int $userId): JsonResponse
    {
        $actor = $request->attributes->get('actorUser');
        $user = User::query()->findOrFail($userId);

        $token = bin2hex(random_bytes(32));
        $session = ImpersonationSession::query()->create([
            'admin_id' => $actor->id,
            'user_id' => $user->id,
            'token' => $token,
            'expires_at' => now()->addMinutes(20),
            'active' => true,
        ]);

        $this->auditLogger->log($request, $actor->id, 'impersonation_start', (string) $user->id, $user->company_id);

        return response()->json([
            'ok' => true,
            'token' => $session->token,
            'expiresAt' => $session->expires_at?->toJSON(),
            'user' => $this->mapUser($user),
        ]);
    }
}
