<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Models\Company;
use App\Services\SupportGenOmn\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompanyManagementController extends ApiController
{
    public function __construct(private readonly AuditLogger $auditLogger)
    {
    }

    public function index(): JsonResponse
    {
        $companies = Company::query()->latest()->get()->map(fn (Company $company) => [
            'id' => $company->id,
            'name' => $company->name,
            'email' => $company->email,
            'status' => $company->status,
            'licenseType' => $company->license_type,
            'licenseExpiryDate' => optional($company->license_expiry_date)->toDateString(),
            'createdAt' => $company->created_at?->toJSON(),
        ]);

        return response()->json($companies);
    }

    public function suspend(Request $request, int $id): JsonResponse
    {
        $actor = $request->attributes->get('actorUser');
        $company = Company::query()->findOrFail($id);

        $data = $request->validate([
            'status' => ['required', 'in:active,suspended'],
            'licenseType' => ['nullable', 'in:annual,semiannual'],
            'licenseExpiryDate' => ['nullable', 'date'],
        ]);

        $company->update([
            'status' => $data['status'],
            'license_type' => $data['licenseType'] ?? $company->license_type,
            'license_expiry_date' => $data['licenseExpiryDate'] ?? $company->license_expiry_date,
        ]);

        $this->auditLogger->log($request, $actor->id, 'company_status_change', (string) $company->id, $company->id);

        return response()->json(['ok' => true]);
    }
}
