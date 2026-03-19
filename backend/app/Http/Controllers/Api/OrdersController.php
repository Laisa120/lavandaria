<?php

namespace App\Http\Controllers\Api;

use App\Models\Cliente;
use App\Models\ItemPedido;
use App\Models\Pedido;
use App\Models\Servico;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrdersController extends ApiController
{
    public function store(Request $request): JsonResponse
    {
        $empresa = $this->currentEmpresaOrCreate();

        $data = $request->validate([
            'customerId' => ['required', 'integer'],
            'userId' => ['required', 'integer', 'exists:users,id'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.itemId' => ['required', 'integer'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'status' => ['nullable', 'in:pending,processing,ready,delivered,cancelled'],
            'paymentStatus' => ['nullable', 'in:paid,unpaid'],
            'expectedDelivery' => ['nullable', 'date'],
        ]);

        $cliente = Cliente::query()
            ->where('empresa_id', $empresa->id)
            ->findOrFail($data['customerId']);

        $order = DB::transaction(function () use ($data, $empresa, $cliente) {
            $pedido = Pedido::query()->create([
                'empresa_id' => $empresa->id,
                'cliente_id' => $cliente->id,
                'created_by_user_id' => $data['userId'],
                'data_pedido' => now()->toDateString(),
                'entrega_prevista' => $data['expectedDelivery'] ?? now()->addDays(2),
                'status' => $data['status'] ?? 'pending',
                'status_pagamento' => $data['paymentStatus'] ?? 'unpaid',
                'total' => 0,
            ]);

            $total = $this->syncItems($pedido, $data['items'], $empresa->id);
            $pedido->update(['total' => $total]);

            return $pedido;
        });
        $this->invalidateBootstrapCache();

        return response()->json(
            $this->mapOrder($order->fresh(['itens', 'criadoPor'])),
            201
        );
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $empresa = $this->currentEmpresaOrCreate();

        $pedido = Pedido::query()
            ->where('empresa_id', $empresa->id)
            ->with(['itens', 'criadoPor'])
            ->findOrFail((int) $id);

        $data = $request->validate([
            'customerId' => ['required', 'integer'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.itemId' => ['required', 'integer'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'status' => ['required', 'in:pending,processing,ready,delivered,cancelled'],
            'paymentStatus' => ['required', 'in:paid,unpaid'],
            'expectedDelivery' => ['nullable', 'date'],
        ]);

        Cliente::query()
            ->where('empresa_id', $empresa->id)
            ->findOrFail($data['customerId']);

        DB::transaction(function () use ($pedido, $data, $empresa) {
            $pedido->update([
                'cliente_id' => $data['customerId'],
                'status' => $data['status'],
                'status_pagamento' => $data['paymentStatus'],
                'entrega_prevista' => $data['expectedDelivery'] ?? $pedido->entrega_prevista,
            ]);

            ItemPedido::query()->where('pedido_id', $pedido->id)->delete();
            $total = $this->syncItems($pedido, $data['items'], $empresa->id);
            $pedido->update(['total' => $total]);
        });
        $this->invalidateBootstrapCache();

        return response()->json($this->mapOrder($pedido->fresh(['itens', 'criadoPor'])));
    }

    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $empresa = $this->currentEmpresaOrCreate();

        $data = $request->validate([
            'status' => ['required', 'in:pending,processing,ready,delivered,cancelled'],
        ]);

        $pedido = Pedido::query()
            ->where('empresa_id', $empresa->id)
            ->with(['itens', 'criadoPor'])
            ->findOrFail((int) $id);

        $pedido->update(['status' => $data['status']]);
        $this->invalidateBootstrapCache();

        return response()->json($this->mapOrder($pedido->fresh(['itens', 'criadoPor'])));
    }

    public function destroy(string $id): JsonResponse
    {
        $empresa = $this->currentEmpresaOrCreate();

        $pedido = Pedido::query()
            ->where('empresa_id', $empresa->id)
            ->findOrFail((int) $id);

        $pedido->delete();
        $this->invalidateBootstrapCache();

        return response()->json(['ok' => true]);
    }

    private function syncItems(Pedido $pedido, array $items, int $empresaId): float
    {
        $services = Servico::query()
            ->where('empresa_id', $empresaId)
            ->whereIn('id', collect($items)->pluck('itemId')->all())
            ->get()
            ->keyBy('id');

        $total = 0;

        foreach ($items as $item) {
            $servico = $services->get((int) $item['itemId']);
            abort_if(! $servico, 422, 'Serviço inválido no pedido.');

            $qty = (int) $item['quantity'];
            $price = (float) $servico->preco;
            $subtotal = $qty * $price;
            $total += $subtotal;

            ItemPedido::query()->create([
                'pedido_id' => $pedido->id,
                'servico_id' => $servico->id,
                'quantidade' => $qty,
                'preco_unitario' => $price,
                'subtotal' => $subtotal,
            ]);
        }

        return $total;
    }
}
