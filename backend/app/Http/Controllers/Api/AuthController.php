<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends ApiController
{
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'role' => ['required', 'in:admin,cashier'],
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:6'],
        ]);

        $user = User::query()
            ->where('email', $data['email'])
            ->where('role', $data['role'])
            ->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Credenciais inválidas.'], 422);
        }

        if ($user->status === 'inactive') {
            return response()->json(['message' => 'Conta inativa. Entre em contacto com o administrador.'], 403);
        }

        if ($user->is_blocked) {
            return response()->json(['message' => 'Conta bloqueada. Entre em contacto com o suporte.'], 403);
        }

        return response()->json($this->mapUser($user));
    }
}
