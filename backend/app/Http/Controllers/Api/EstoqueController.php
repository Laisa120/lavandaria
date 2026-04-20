<?php

namespace App\Http\Controllers\Api;

use App\Models\ProdutoEstoque;
use App\Models\Servico;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EstoqueController extends ApiController
{
    public function index(): JsonResponse
    {
        $empresa = $this->currentEmpresaOrCreate();

        $itens = ProdutoEstoque::query()
            ->where('empresa_id', $empresa->id)
            ->with('servico')
            ->latest()
            ->get()
            ->map(fn (ProdutoEstoque $produto) => $this->mapProdutoEstoque($produto));

        return response()->json($itens);
    }

    public function store(Request $request): JsonResponse
    {
        $empresa = $this->currentEmpresaOrCreate();
        $data = $this->validatePayload($request, $empresa->id);

        $produto = ProdutoEstoque::query()->create([
            'empresa_id' => $empresa->id,
            'nome' => $data['name'],
            'categoria' => $data['category'],
            'quantidade_atual' => $data['quantityCurrent'],
            'quantidade_minima' => $data['quantityMinimum'],
            'unidade' => $data['unit'],
            'servico_id' => $data['linkedServiceId'] ?? null,
            'consumo_por_venda' => $data['consumptionPerService'] ?? 1,
        ]);

        if ((float) $data['quantityCurrent'] > 0) {
            $produto->movimentacoes()->create([
                'tipo' => 'entrada',
                'quantidade' => (float) $data['quantityCurrent'],
                'observacao' => 'Saldo inicial',
            ]);
        }

        $this->invalidateBootstrapCache();

        return response()->json($this->mapProdutoEstoque($produto->fresh('servico')), 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $empresa = $this->currentEmpresaOrCreate();

        $produto = ProdutoEstoque::query()
            ->where('empresa_id', $empresa->id)
            ->with('servico')
            ->findOrFail((int) $id);

        $data = $this->validatePayload($request, $empresa->id);

        $produto->update([
            'nome' => $data['name'],
            'categoria' => $data['category'],
            'quantidade_atual' => $data['quantityCurrent'],
            'quantidade_minima' => $data['quantityMinimum'],
            'unidade' => $data['unit'],
            'servico_id' => $data['linkedServiceId'] ?? null,
            'consumo_por_venda' => $data['consumptionPerService'] ?? 1,
        ]);

        $this->invalidateBootstrapCache();

        return response()->json($this->mapProdutoEstoque($produto->fresh('servico')));
    }

    public function destroy(string $id): JsonResponse
    {
        $empresa = $this->currentEmpresaOrCreate();

        $produto = ProdutoEstoque::query()
            ->where('empresa_id', $empresa->id)
            ->findOrFail((int) $id);

        $produto->delete();
        $this->invalidateBootstrapCache();

        return response()->json(['ok' => true]);
    }

    private function validatePayload(Request $request, int $empresaId): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'min:2'],
            'category' => ['required', 'string', 'min:2'],
            'quantityCurrent' => ['required', 'numeric', 'min:0'],
            'quantityMinimum' => ['required', 'numeric', 'min:0'],
            'unit' => ['required', 'string', 'min:1'],
            'linkedServiceId' => ['nullable', 'integer'],
            'consumptionPerService' => ['nullable', 'numeric', 'gt:0'],
        ]);

        if (! empty($data['linkedServiceId'])) {
            Servico::query()
                ->where('empresa_id', $empresaId)
                ->findOrFail((int) $data['linkedServiceId']);
        }

        return $data;
    }
}
