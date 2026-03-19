<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use App\Models\Empresa;
use App\Models\Pedido;
use App\Models\Servico;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

abstract class ApiController extends Controller
{
    protected const BOOTSTRAP_CACHE_KEY = 'api_bootstrap_payload';

    protected function currentEmpresa(): ?Empresa
    {
        return Empresa::query()->first();
    }

    protected function currentEmpresaOrCreate(): Empresa
    {
        $empresa = $this->currentEmpresa();
        if ($empresa) {
            return $empresa;
        }

        return Empresa::query()->create([
            'nome' => 'Empresa Padrão',
            'nome_comercial' => 'Empresa Padrão',
            'nif' => '000000000',
            'tipo_empresa' => 'Lda',
            'pais' => 'Angola',
            'regime_iva' => 'geral',
            'taxa_iva_padrao' => 14,
            'moeda' => 'Kz',
            'serie_fatura' => date('Y'),
            'numero_inicial_fatura' => 1,
            'modelo_fatura' => 'A4',
            'formato_numero_fatura' => 'SERIE/NUMERO',
            'permitir_venda_credito' => false,
            'dias_vencimento_padrao' => 30,
            'permitir_desconto_global' => true,
            'tipo_conexao_impressora' => 'usb',
            'impressao_automatica' => false,
            'download_pdf_automatico' => false,
        ]);
    }

    protected function mapUser(User $user): array
    {
        return [
            'id' => (string) $user->id,
            'companyId' => $user->company_id ? (string) $user->company_id : null,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'platformRole' => $user->platform_role,
            'status' => $user->status,
            'isBlocked' => (bool) $user->is_blocked,
            'createdAt' => $user->created_at?->toJSON(),
        ];
    }

    protected function mapCustomer(Cliente $cliente): array
    {
        return [
            'id' => (string) $cliente->id,
            'name' => $cliente->nome,
            'email' => $cliente->email ?? '',
            'phone' => $cliente->telefone ?? '',
            'address' => $cliente->endereco ?? '',
            'createdAt' => $cliente->created_at?->toJSON(),
        ];
    }

    protected function mapService(Servico $servico): array
    {
        return [
            'id' => (string) $servico->id,
            'name' => $servico->nome,
            'price' => (float) $servico->preco,
            'priceFormatted' => $this->formatCurrencyAO((float) $servico->preco),
            'category' => $servico->categoria,
        ];
    }

    protected function mapOrder(Pedido $pedido): array
    {
        $items = $pedido->itens->map(function ($item) {
            $price = (float) $item->preco_unitario;
            $subtotal = (float) $item->subtotal;

            return [
                'itemId' => (string) $item->servico_id,
                'quantity' => (int) $item->quantidade,
                'priceAtTime' => $price,
                'priceAtTimeFormatted' => $this->formatCurrencyAO($price),
                'lineTotal' => $subtotal,
                'lineTotalFormatted' => $this->formatCurrencyAO($subtotal),
            ];
        })->values();

        $total = (float) $pedido->total;

        return [
            'id' => (string) $pedido->id,
            'customerId' => (string) $pedido->cliente_id,
            'createdByUserId' => $pedido->created_by_user_id ? (string) $pedido->created_by_user_id : null,
            'createdByUserName' => $pedido->criadoPor?->name ?? 'Sistema',
            'createdByUserRole' => $pedido->criadoPor?->role ?? null,
            'items' => $items,
            'status' => $pedido->status,
            'total' => $total,
            'totalFormatted' => $this->formatCurrencyAO($total),
            'createdAt' => $pedido->created_at?->toJSON(),
            'updatedAt' => $pedido->updated_at?->toJSON(),
            'expectedDelivery' => $pedido->entrega_prevista?->toJSON(),
            'paymentStatus' => $pedido->status_pagamento,
        ];
    }

    protected function mapSettings(Empresa $empresa): array
    {
        return [
            'logo' => $empresa->logo,
            'companyName' => $empresa->nome,
            'tradeName' => $empresa->nome_comercial ?? '',
            'nif' => $empresa->nif ?? '',
            'companyType' => $empresa->tipo_empresa ?? 'Lda',
            'country' => $empresa->pais ?? 'Angola',
            'province' => $empresa->provincia ?? '',
            'municipality' => $empresa->municipio ?? '',
            'fullAddress' => $empresa->endereco_completo ?? '',
            'postalCode' => $empresa->codigo_postal ?? '',
            'phone' => $empresa->telefone ?? '',
            'email' => $empresa->email ?? '',
            'website' => $empresa->website,
            'ivaRegime' => $empresa->regime_iva,
            'defaultIvaRate' => (float) $empresa->taxa_iva_padrao,
            'currency' => $empresa->moeda,
            'invoiceSeries' => $empresa->serie_fatura,
            'startInvoiceNumber' => (int) $empresa->numero_inicial_fatura,
            'withholdingTaxPercentage' => $empresa->taxa_retencao,
            'bankName' => $empresa->banco,
            'accountNumber' => $empresa->numero_conta,
            'iban' => $empresa->iban,
            'invoiceModel' => $empresa->modelo_fatura,
            'invoiceNumberFormat' => $empresa->formato_numero_fatura,
            'allowCreditSales' => (bool) $empresa->permitir_venda_credito,
            'defaultDueDays' => (int) $empresa->dias_vencimento_padrao,
            'allowGlobalDiscount' => (bool) $empresa->permitir_desconto_global,
            'printerName' => $empresa->nome_impressora,
            'printerConnectionType' => $empresa->tipo_conexao_impressora,
            'printerIpAddress' => $empresa->ip_impressora,
            'autoPrintReceipt' => (bool) $empresa->impressao_automatica,
            'autoDownloadPDF' => (bool) $empresa->download_pdf_automatico,
        ];
    }

    protected function fillEmpresaFromSettings(Empresa $empresa, array $settings): Empresa
    {
        $empresa->fill([
            'logo' => $settings['logo'] ?? null,
            'nome' => $settings['companyName'],
            'nome_comercial' => $settings['tradeName'] ?? null,
            'nif' => $settings['nif'] ?? null,
            'tipo_empresa' => $settings['companyType'] ?? null,
            'pais' => $settings['country'] ?? null,
            'provincia' => $settings['province'] ?? null,
            'municipio' => $settings['municipality'] ?? null,
            'endereco_completo' => $settings['fullAddress'] ?? null,
            'codigo_postal' => $settings['postalCode'] ?? null,
            'telefone' => $settings['phone'] ?? null,
            'email' => $settings['email'] ?? null,
            'website' => $settings['website'] ?? null,
            'regime_iva' => $settings['ivaRegime'] ?? 'geral',
            'taxa_iva_padrao' => $settings['defaultIvaRate'] ?? 14,
            'moeda' => $settings['currency'] ?? 'Kz',
            'serie_fatura' => $settings['invoiceSeries'] ?? 'FT',
            'numero_inicial_fatura' => $settings['startInvoiceNumber'] ?? 1,
            'taxa_retencao' => $settings['withholdingTaxPercentage'] ?? null,
            'banco' => $settings['bankName'] ?? null,
            'numero_conta' => $settings['accountNumber'] ?? null,
            'iban' => $settings['iban'] ?? null,
            'modelo_fatura' => $settings['invoiceModel'] ?? 'A4',
            'formato_numero_fatura' => $settings['invoiceNumberFormat'] ?? 'SERIE/NUMERO',
            'permitir_venda_credito' => $settings['allowCreditSales'] ?? false,
            'dias_vencimento_padrao' => $settings['defaultDueDays'] ?? 30,
            'permitir_desconto_global' => $settings['allowGlobalDiscount'] ?? true,
            'nome_impressora' => $settings['printerName'] ?? null,
            'tipo_conexao_impressora' => $settings['printerConnectionType'] ?? 'usb',
            'ip_impressora' => $settings['printerIpAddress'] ?? null,
            'impressao_automatica' => $settings['autoPrintReceipt'] ?? false,
            'download_pdf_automatico' => $settings['autoDownloadPDF'] ?? false,
        ]);

        $empresa->save();

        return $empresa;
    }

    protected function invalidateBootstrapCache(): void
    {
        Cache::forget(self::BOOTSTRAP_CACHE_KEY);
    }

    protected function formatCurrencyAO(float $value): string
    {
        return $this->formatNumberAO($value).' Kz';
    }

    protected function formatNumberAO(float $value): string
    {
        $normalized = number_format($value, 2, '.', '');
        [$integer, $decimal] = explode('.', $normalized);
        $integerGrouped = preg_replace('/\B(?=(\d{3})+(?!\d))/', '.', $integer);

        return $integerGrouped.','.$decimal;
    }
}
