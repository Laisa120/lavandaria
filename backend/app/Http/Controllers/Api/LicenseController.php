<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LicenseController extends ApiController
{
    public function check(Request $request): JsonResponse
    {
        $actor = $request->attributes->get('actorUser');
        $company = $request->attributes->get('actorCompany');

        if (! $actor || ! $company) {
            return response()->json([
                'valid' => false,
                'message' => 'Contexto de usuário/licença não disponível.',
            ], 401);
        }

        $expiresAt = $company->license_expiry_date;
        $expired = $expiresAt ? now()->startOfDay()->greaterThan($expiresAt) : false;
        $active = $company->status === 'active' && ! $expired;

        return response()->json([
            'valid' => $active,
            'status' => $company->status,
            'licenseType' => $company->license_type,
            'expiresAt' => optional($expiresAt)->toDateString(),
            'daysRemaining' => $expiresAt ? now()->startOfDay()->diffInDays($expiresAt, false) : null,
            'message' => $active
                ? 'Licença válida.'
                : 'Licença expirada/suspensa. Contacte o suporte técnico.',
        ]);
    }
}
