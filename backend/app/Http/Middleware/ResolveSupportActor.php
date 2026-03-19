<?php

namespace App\Http\Middleware;

use App\Services\SupportGenOmn\ActorResolver;
use App\Services\SupportGenOmn\AdminSessionService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResolveSupportActor
{
    public function __construct(
        private readonly ActorResolver $actorResolver,
        private readonly AdminSessionService $adminSessionService,
    ) {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $adminToken = $request->header('X-Admin-Token');
        if (is_string($adminToken) && $adminToken !== '') {
            $adminUser = $this->adminSessionService->resolve($adminToken);
            if ($adminUser) {
                $request->attributes->set('actorUser', $adminUser);
                $request->attributes->set('actorCompany', $this->actorResolver->resolveCompany($adminUser));
                return $next($request);
            }

            return response()->json(['message' => 'Sessão administrativa inválida.'], 401);
        }

        $actor = $this->actorResolver->fromRequest($request);
        if (! $actor) {
            return response()->json(['message' => 'Cabeçalho X-Actor-Id é obrigatório.'], 401);
        }

        $request->attributes->set('actorUser', $actor);
        $request->attributes->set('actorCompany', $this->actorResolver->resolveCompany($actor));

        return $next($request);
    }
}
