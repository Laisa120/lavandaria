<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Models\PasswordReset;
use App\Models\User;
use App\Services\SupportGenOmn\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserManagementController extends ApiController
{
    public function __construct(private readonly AuditLogger $auditLogger)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $companyId = $request->query('company_id');

        $query = User::query()->latest();
        if (is_string($companyId) && ctype_digit($companyId)) {
            $query->where('company_id', (int) $companyId);
        }

        $users = $query->get()->map(fn (User $user) => [
            'id' => (string) $user->id,
            'companyId' => $user->company_id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'platformRole' => $user->platform_role,
            'status' => $user->status,
            'isBlocked' => (bool) $user->is_blocked,
            'createdAt' => $user->created_at?->toJSON(),
        ]);

        return response()->json($users);
    }

    public function block(Request $request, int $id): JsonResponse
    {
        $actor = $request->attributes->get('actorUser');
        $user = User::query()->findOrFail($id);

        $user->update([
            'is_blocked' => true,
            'blocked_at' => now(),
            'status' => 'inactive',
        ]);

        $this->auditLogger->log($request, $actor->id, 'user_block', (string) $user->id, $user->company_id);

        return response()->json(['ok' => true]);
    }

    public function resetPassword(Request $request, int $id): JsonResponse
    {
        $actor = $request->attributes->get('actorUser');
        $user = User::query()->findOrFail($id);

        $plainToken = bin2hex(random_bytes(32));
        $hashedToken = hash('sha256', $plainToken);

        $reset = PasswordReset::query()->create([
            'user_id' => $user->id,
            'token' => $hashedToken,
            'expires_at' => now()->addMinutes(30),
            'used' => false,
        ]);

        $this->auditLogger->log($request, $actor->id, 'user_reset_password', (string) $user->id, $user->company_id);

        return response()->json([
            'ok' => true,
            'resetId' => $reset->id,
            'resetToken' => $plainToken,
            'expiresAt' => $reset->expires_at?->toJSON(),
        ]);
    }
}
