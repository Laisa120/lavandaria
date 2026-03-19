<?php

namespace App\Services\SupportGenOmn;

use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogger
{
    public function log(Request $request, ?int $adminId, string $action, ?string $targetId = null, ?int $companyId = null): void
    {
        AuditLog::query()->create([
            'admin_id' => $adminId,
            'action' => $action,
            'target_id' => $targetId,
            'company_id' => $companyId,
            'ip_address' => $request->ip(),
        ]);
    }
}
