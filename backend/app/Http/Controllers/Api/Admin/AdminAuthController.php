<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Services\SupportGenOmn\AdminSessionService;
use App\Services\SupportGenOmn\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminAuthController extends ApiController
{
    public function __construct(
        private readonly AdminSessionService $sessionService,
        private readonly AuditLogger $auditLogger,
    ) {
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:6'],
        ]);

        $user = \App\Models\User::query()
            ->where('email', $data['email'])
            ->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Credenciais inválidas.'], 422);
        }

        if (! in_array($user->platform_role, ['super_admin', 'support'], true)) {
            return response()->json(['message' => 'Acesso restrito à equipa técnica.'], 403);
        }

        if ($user->status !== 'active' || $user->is_blocked) {
            return response()->json(['message' => 'Conta bloqueada ou inativa.'], 403);
        }

        $token = $this->sessionService->issue($user);
        $this->auditLogger->log($request, $user->id, 'admin_login', (string) $user->id, $user->company_id);

        return response()->json([
            'token' => $token,
            'user' => $this->mapUser($user),
        ]);
    }
}
