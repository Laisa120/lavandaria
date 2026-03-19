<?php

namespace App\Http\Controllers\Api;

use App\Models\Cliente;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomersController extends ApiController
{
    public function store(Request $request): JsonResponse
    {
        $empresa = $this->currentEmpresaOrCreate();

        $data = $request->validate([
            'name' => ['required', 'string', 'min:3'],
            'phone' => ['nullable', 'string'],
            'address' => ['nullable', 'string'],
        ]);

        $cliente = Cliente::query()->create([
            'empresa_id' => $empresa->id,
            'nome' => $data['name'],
            'email' => null,
            'telefone' => $data['phone'] ?? null,
            'endereco' => $data['address'] ?? null,
        ]);
        $this->invalidateBootstrapCache();

        return response()->json($this->mapCustomer($cliente), 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $empresa = $this->currentEmpresaOrCreate();

        $cliente = Cliente::query()
            ->where('empresa_id', $empresa->id)
            ->findOrFail((int) $id);

        $data = $request->validate([
            'name' => ['required', 'string', 'min:3'],
            'phone' => ['nullable', 'string'],
            'address' => ['nullable', 'string'],
        ]);

        $cliente->update([
            'nome' => $data['name'],
            'email' => null,
            'telefone' => $data['phone'] ?? null,
            'endereco' => $data['address'] ?? null,
        ]);
        $this->invalidateBootstrapCache();

        return response()->json($this->mapCustomer($cliente->fresh()));
    }

    public function destroy(string $id): JsonResponse
    {
        $empresa = $this->currentEmpresaOrCreate();

        $cliente = Cliente::query()
            ->where('empresa_id', $empresa->id)
            ->findOrFail((int) $id);

        $cliente->delete();
        $this->invalidateBootstrapCache();

        return response()->json(['ok' => true]);
    }
}
