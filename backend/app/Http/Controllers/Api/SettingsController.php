<?php

namespace App\Http\Controllers\Api;

use App\Models\Empresa;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends ApiController
{
    public function show(): JsonResponse
    {
        $empresa = $this->currentEmpresa();

        if (! $empresa) {
            return response()->json(['message' => 'Empresa não registrada.'], 404);
        }

        return response()->json($this->mapSettings($empresa));
    }

    public function register(Request $request): JsonResponse
    {
        $data = $this->validateSettings($request);

        $empresa = $this->currentEmpresa() ?? new Empresa();
        $empresa = $this->fillEmpresaFromSettings($empresa, $data);
        $this->invalidateBootstrapCache();

        return response()->json($this->mapSettings($empresa), 201);
    }

    public function update(Request $request): JsonResponse
    {
        $empresa = $this->currentEmpresa();
        if (! $empresa) {
            return response()->json(['message' => 'Empresa não registrada.'], 404);
        }

        $data = $this->validateSettings($request);
        $empresa = $this->fillEmpresaFromSettings($empresa, $data);
        $this->invalidateBootstrapCache();

        return response()->json($this->mapSettings($empresa));
    }

    private function validateSettings(Request $request): array
    {
        return $request->validate([
            'logo' => ['nullable', 'string'],
            'companyName' => ['required', 'string', 'min:3'],
            'tradeName' => ['required', 'string', 'min:3'],
            'nif' => ['required', 'string', 'min:5'],
            'companyType' => ['required', 'string'],
            'country' => ['required', 'string'],
            'province' => ['required', 'string'],
            'municipality' => ['required', 'string'],
            'fullAddress' => ['required', 'string', 'min:5'],
            'postalCode' => ['nullable', 'string'],
            'phone' => ['required', 'string'],
            'email' => ['required', 'email'],
            'website' => ['nullable', 'string'],
            'ivaRegime' => ['required', 'in:geral,nao_sujeicao,isento'],
            'defaultIvaRate' => ['required', 'numeric', 'min:0'],
            'currency' => ['required', 'string'],
            'invoiceSeries' => ['required', 'string'],
            'startInvoiceNumber' => ['required', 'integer', 'min:1'],
            'withholdingTaxPercentage' => ['nullable', 'numeric', 'min:0'],
            'bankName' => ['nullable', 'string'],
            'accountNumber' => ['nullable', 'string'],
            'iban' => ['nullable', 'string'],
            'invoiceModel' => ['required', 'in:A4,thermal'],
            'invoiceNumberFormat' => ['required', 'string'],
            'allowCreditSales' => ['required', 'boolean'],
            'defaultDueDays' => ['required', 'integer', 'min:0'],
            'allowGlobalDiscount' => ['required', 'boolean'],
            'printerName' => ['nullable', 'string'],
            'printerConnectionType' => ['required', 'in:usb,network,bluetooth'],
            'printerIpAddress' => ['nullable', 'string'],
            'autoPrintReceipt' => ['required', 'boolean'],
            'autoDownloadPDF' => ['required', 'boolean'],
        ]);
    }
}
