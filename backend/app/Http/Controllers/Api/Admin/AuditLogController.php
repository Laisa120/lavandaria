<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;

class AuditLogController extends ApiController
{
    public function index(): JsonResponse
    {
        $logs = AuditLog::query()->latest()->limit(500)->get()->map(fn (AuditLog $log) => [
            'id' => $log->id,
            'adminId' => $log->admin_id,
            'action' => $log->action,
            'targetId' => $log->target_id,
            'companyId' => $log->company_id,
            'ipAddress' => $log->ip_address,
            'createdAt' => $log->created_at?->toJSON(),
        ]);

        return response()->json($logs);
    }
}
