<?php

namespace App\Http\Controllers\Api;

use App\Models\MovimentacaoEstoque;
use App\Models\ProdutoEstoque;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MovimentacaoEstoqueController extends ApiController
{
    public function index(): JsonResponse
    {
        $empresa = $this->currentEmpresaOrCreate();

        $movimentacoes = MovimentacaoEstoque::query()
            ->whereHas('produto', fn ($query) => $query->where('empresa_id', $empresa->id))
            ->with('produto')
            ->latest()
            ->get()
            ->map(fn (MovimentacaoEstoque $movimentacao) => $this->mapMovimentacaoEstoque($movimentacao));

        return response()->json($movimentacoes);
    }

    public function store(Request $request): JsonResponse
    {
        $empresa = $this->currentEmpresaOrCreate();

        $data = $request->validate([
            'productId' => ['required', 'integer'],
            'type' => ['required', 'in:entry,exit'],
            'quantity' => ['required', 'numeric', 'gt:0'],
            'note' => ['nullable', 'string'],
        ]);

        $produto = ProdutoEstoque::query()
            ->where('empresa_id', $empresa->id)
            ->findOrFail((int) $data['productId']);

        $movimentacao = DB::transaction(function () use ($produto, $data) {
            $quantidade = (float) $data['quantity'];
            $tipo = $data['type'] === 'entry' ? 'entrada' : 'saida';
            $proximoSaldo = $tipo === 'entrada'
                ? $produto->quantidade_atual + $quantidade
                : $produto->quantidade_atual - $quantidade;

            abort_if($proximoSaldo < 0, 422, 'A saída não pode deixar o estoque negativo.');

            $produto->update(['quantidade_atual' => $proximoSaldo]);

            return $produto->movimentacoes()->create([
                'tipo' => $tipo,
                'quantidade' => $quantidade,
                'observacao' => $data['note'] ?? null,
            ]);
        });

        $this->invalidateBootstrapCache();

        return response()->json($this->mapMovimentacaoEstoque($movimentacao->fresh('produto')), 201);
    }
}
