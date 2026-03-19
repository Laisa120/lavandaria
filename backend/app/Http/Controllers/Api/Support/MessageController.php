<?php

namespace App\Http\Controllers\Api\Support;

use App\Http\Controllers\Api\ApiController;
use App\Models\SupportMessage;
use App\Models\SupportTicket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends ApiController
{
    public function store(Request $request): JsonResponse
    {
        $actor = $request->attributes->get('actorUser');
        $company = $request->attributes->get('actorCompany');

        $data = $request->validate([
            'ticket_id' => ['required', 'integer', 'exists:support_tickets,id'],
            'message' => ['required', 'string', 'min:2', 'max:4000'],
        ]);

        $ticket = SupportTicket::query()->findOrFail((int) $data['ticket_id']);
        $isSupport = in_array($actor->platform_role, ['super_admin', 'support'], true);

        if (! $isSupport && $ticket->company_id !== $company->id) {
            return response()->json(['message' => 'Ticket não pertence à empresa do usuário.'], 403);
        }

        $message = SupportMessage::query()->create([
            'ticket_id' => $ticket->id,
            'sender_type' => $isSupport ? 'support' : 'user',
            'message' => trim($data['message']),
        ]);

        if ($ticket->status !== 'closed') {
            $ticket->update(['status' => $isSupport ? 'in_progress' : 'open']);
        }

        return response()->json([
            'id' => $message->id,
            'ticketId' => $message->ticket_id,
            'senderType' => $message->sender_type,
            'message' => $message->message,
            'createdAt' => $message->created_at?->toJSON(),
        ], 201);
    }
}
