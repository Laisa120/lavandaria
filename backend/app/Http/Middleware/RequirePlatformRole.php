<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequirePlatformRole
{
    public function handle(Request $request, Closure $next, string ...$allowed): Response
    {
        $actor = $request->attributes->get('actorUser');
        if (! $actor) {
            return response()->json(['message' => 'Usuário não autenticado no módulo Support_GenOmn.'], 401);
        }

        $role = $actor->platform_role;
        if (! in_array($role, $allowed, true)) {
            return response()->json(['message' => 'Permissão insuficiente para esta ação.'], 403);
        }

        return $next($request);
    }
}
