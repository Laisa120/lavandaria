<?php

namespace App\Http\Controllers\Api\Support;

use App\Http\Controllers\Api\ApiController;
use App\Models\SupportMessage;
use App\Models\SupportTicket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TicketController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $actor = $request->attributes->get('actorUser');
        $company = $request->attributes->get('actorCompany');

        $query = SupportTicket::query()
            ->with(['messages', 'user'])
            ->latest();

        if (! in_array($actor->platform_role, ['super_admin', 'support'], true)) {
            $query->where('company_id', $company->id);
        }

        $tickets = $query->get()->map(fn (SupportTicket $ticket) => $this->mapTicket($ticket));

        return response()->json($tickets);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $actor = $request->attributes->get('actorUser');
        $company = $request->attributes->get('actorCompany');

        $ticket = SupportTicket::query()
            ->with(['messages', 'user'])
            ->findOrFail($id);

        if (! in_array($actor->platform_role, ['super_admin', 'support'], true) && $ticket->company_id !== $company->id) {
            return response()->json(['message' => 'Ticket não pertence à empresa do usuário.'], 403);
        }

        return response()->json($this->mapTicket($ticket));
    }

    public function store(Request $request): JsonResponse
    {
        $actor = $request->attributes->get('actorUser');
        $company = $request->attributes->get('actorCompany');

        $data = $request->validate([
            'subject' => ['required', 'string', 'min:4', 'max:180'],
            'message' => ['required', 'string', 'min:6', 'max:4000'],
        ]);

        $ticket = SupportTicket::query()->create([
            'company_id' => $company->id,
            'user_id' => $actor->id,
            'subject' => trim($data['subject']),
            'message' => trim($data['message']),
            'status' => 'open',
        ]);

        SupportMessage::query()->create([
            'ticket_id' => $ticket->id,
            'sender_type' => 'user',
            'message' => trim($data['message']),
        ]);

        return response()->json(
            $this->mapTicket($ticket->fresh(['messages', 'user'])),
            201
        );
    }

    private function mapTicket(SupportTicket $ticket): array
    {
        return [
            'id' => $ticket->id,
            'companyId' => $ticket->company_id,
            'userId' => $ticket->user_id,
            'subject' => $ticket->subject,
            'message' => $ticket->message,
            'status' => $ticket->status,
            'createdAt' => $ticket->created_at?->toJSON(),
            'user' => [
                'id' => (string) $ticket->user?->id,
                'name' => $ticket->user?->name,
                'email' => $ticket->user?->email,
            ],
            'messages' => $ticket->messages->map(fn (SupportMessage $message) => [
                'id' => $message->id,
                'ticketId' => $message->ticket_id,
                'senderType' => $message->sender_type,
                'message' => $message->message,
                'createdAt' => $message->created_at?->toJSON(),
            ])->values(),
        ];
    }
}
