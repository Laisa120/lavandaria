<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureValidLicense
{
    public function handle(Request $request, Closure $next): Response
    {
        $actor = $request->attributes->get('actorUser');
        $company = $request->attributes->get('actorCompany');

        if (! $actor || ! $company) {
            return response()->json(['message' => 'Contexto de licença não disponível.'], 401);
        }

        if (in_array($actor->platform_role, ['super_admin', 'support'], true)) {
            return $next($request);
        }

        $isExpired = $company->license_expiry_date && now()->startOfDay()->greaterThan($company->license_expiry_date);
        if ($company->status !== 'active' || $isExpired) {
            return response()->json([
                'message' => 'Licença inválida. Contacte o suporte para regularização.',
                'license' => [
                    'status' => $company->status,
                    'expiresAt' => optional($company->license_expiry_date)->toDateString(),
                    'expired' => $isExpired,
                ],
            ], 402);
        }

        return $next($request);
    }
}
