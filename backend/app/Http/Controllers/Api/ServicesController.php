<?php

namespace App\Http\Controllers\Api;

use App\Models\Servico;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServicesController extends ApiController
{
    public function store(Request $request): JsonResponse
    {
        $empresa = $this->currentEmpresaOrCreate();

        $data = $request->validate([
            'name' => ['required', 'string', 'min:3'],
            'price' => ['required', 'numeric', 'min:0.01'],
            'category' => ['required', 'in:clothing,bedding,curtains,other'],
        ]);

        $servico = Servico::query()->create([
            'empresa_id' => $empresa->id,
            'nome' => $data['name'],
            'preco' => $data['price'],
            'categoria' => $data['category'],
        ]);
        $this->invalidateBootstrapCache();

        return response()->json($this->mapService($servico), 201);
    }

    public function destroy(string $id): JsonResponse
    {
        $empresa = $this->currentEmpresaOrCreate();

        $servico = Servico::query()
            ->where('empresa_id', $empresa->id)
            ->findOrFail((int) $id);

        $servico->delete();
        $this->invalidateBootstrapCache();

        return response()->json(['ok' => true]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $empresa = $this->currentEmpresaOrCreate();

        $servico = Servico::query()
            ->where('empresa_id', $empresa->id)
            ->findOrFail((int) $id);

        $data = $request->validate([
            'name' => ['required', 'string', 'min:3'],
            'price' => ['required', 'numeric', 'min:0.01'],
            'category' => ['required', 'in:clothing,bedding,curtains,other'],
        ]);

        $servico->update([
            'nome' => $data['name'],
            'preco' => $data['price'],
            'categoria' => $data['category'],
        ]);
        $this->invalidateBootstrapCache();

        return response()->json($this->mapService($servico->fresh()));
    }
}
