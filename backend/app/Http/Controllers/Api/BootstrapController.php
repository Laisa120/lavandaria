<?php

namespace App\Http\Controllers\Api;

use App\Models\Cliente;
use App\Models\Pedido;
use App\Models\Servico;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class BootstrapController extends ApiController
{
    public function index(): JsonResponse
    {
        $payload = Cache::remember(
            self::BOOTSTRAP_CACHE_KEY,
            now()->addMinutes(5),
            function () {
                $empresa = $this->currentEmpresa();

                $customers = collect();
                $services = collect();
                $orders = collect();

                if ($empresa) {
                    $customers = Cliente::query()
                        ->where('empresa_id', $empresa->id)
                        ->latest()
                        ->get()
                        ->map(fn (Cliente $cliente) => $this->mapCustomer($cliente));

                    $services = Servico::query()
                        ->where('empresa_id', $empresa->id)
                        ->latest()
                        ->get()
                        ->map(fn (Servico $servico) => $this->mapService($servico));

                    $orders = Pedido::query()
                        ->where('empresa_id', $empresa->id)
                        ->with(['itens', 'criadoPor'])
                        ->latest()
                        ->get()
                        ->map(fn (Pedido $pedido) => $this->mapOrder($pedido));
                }

                $users = User::query()
                    ->latest()
                    ->get()
                    ->map(fn (User $user) => $this->mapUser($user));

                return [
                    'isRegistered' => (bool) $empresa,
                    'settings' => $empresa ? $this->mapSettings($empresa) : null,
                    'customers' => $customers,
                    'services' => $services,
                    'orders' => $orders,
                    'users' => $users,
                ];
            }
        );

        return response()->json($payload);
    }
}
