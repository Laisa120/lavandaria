import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { MessageSquare, Send, LifeBuoy, PlusCircle, X } from 'lucide-react';
import { User } from '../../types';
import {
  checkLicense,
  createSupportTicket,
  getSupportTicket,
  listSupportTickets,
  sendSupportMessage,
  SupportTicketDto,
} from '../../lib/supportGenomnApi';
import { toUserErrorMessage } from '../../lib/userErrors';

interface SupportTechnicalProps {
  user: User;
  onLicenseStatus: (payload: { blocked: boolean; message: string }) => void;
}

export function SupportTechnical({ user, onLicenseStatus }: SupportTechnicalProps) {
  const [tickets, setTickets] = useState<SupportTicketDto[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedTicketId) ?? null,
    [tickets, selectedTicketId],
  );

  const loadTickets = async () => {
    const data = await listSupportTickets(user.id);
    setTickets(data);
    if (data.length > 0 && !selectedTicketId) {
      setSelectedTicketId(data[0].id);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const license = await checkLicense(user.id);
        onLicenseStatus({ blocked: !license.valid, message: license.message });
      } catch {
        onLicenseStatus({ blocked: false, message: '' });
      }

      try {
        await loadTickets();
      } catch (error) {
        setFeedback({ type: 'error', message: toUserErrorMessage(error, 'Não foi possível carregar os tickets.') });
      }
    };

    load();
  }, [user.id]);

  const handleCreateTicket = async (e: FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    try {
      setLoading(true);
      const ticket = await createSupportTicket(user.id, {
        subject: subject.trim(),
        message: message.trim(),
      });
      setTickets((prev) => [ticket, ...prev]);
      setSelectedTicketId(ticket.id);
      setSubject('');
      setMessage('');
    } catch (error) {
      setFeedback({ type: 'error', message: toUserErrorMessage(error, 'Não foi possível abrir o ticket.') });
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !reply.trim()) return;

    try {
      setLoading(true);
      await sendSupportMessage(user.id, {
        ticket_id: selectedTicket.id,
        message: reply.trim(),
      });
      const refreshed = await getSupportTicket(user.id, selectedTicket.id);
      setTickets((prev) => prev.map((t) => (t.id === refreshed.id ? refreshed : t)));
      setReply('');
      setFeedback({ type: 'success', message: 'Mensagem enviada ao suporte.' });
    } catch (error) {
      setFeedback({ type: 'error', message: toUserErrorMessage(error, 'Não foi possível enviar a mensagem.') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <LifeBuoy className="w-6 h-6 text-blue-600" />
          Equipa Técnica
        </h2>
        <p className="text-slate-500">Crie tickets, acompanhe e converse com o suporte.</p>
      </div>

      {feedback && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm flex items-start justify-between gap-3 ${
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-1 hover:bg-white/60"
            onClick={() => setFeedback(null)}
            aria-label="Fechar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <form onSubmit={handleCreateTicket} className="card-modern p-4 space-y-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-blue-600" />
              Novo Ticket
            </h3>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Assunto"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50"
              required
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Descreva o problema"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 min-h-28"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0e2a47] hover:bg-[#12345a] text-white rounded-lg py-2 font-semibold disabled:opacity-60"
            >
              Abrir Ticket
            </button>
          </form>

          <div className="card-modern overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 font-semibold text-slate-700">Meus Tickets</div>
            <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-100">
              {tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={`w-full text-left px-4 py-3 transition-colors ${selectedTicketId === ticket.id ? 'bg-[#dff2ff]' : 'hover:bg-slate-50'}`}
                >
                  <p className="font-semibold text-slate-800">#{ticket.id} {ticket.subject}</p>
                  <p className="text-xs text-slate-500 uppercase">{ticket.status}</p>
                </button>
              ))}
              {tickets.length === 0 && <p className="px-4 py-6 text-sm text-slate-400">Sem tickets ainda.</p>}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 card-modern p-4 flex flex-col min-h-[560px]">
          {selectedTicket ? (
            <>
              <div className="border-b border-slate-100 pb-3 mb-3">
                <h3 className="font-bold text-slate-800">#{selectedTicket.id} - {selectedTicket.subject}</h3>
                <p className="text-sm text-slate-500">Status: {selectedTicket.status}</p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {selectedTicket.messages.map((m) => (
                  <div key={m.id} className={`max-w-[80%] px-3 py-2 rounded-xl ${m.senderType === 'support' ? 'bg-emerald-50 ml-auto' : 'bg-slate-100'}`}>
                    <p className="text-xs font-bold uppercase text-slate-500 mb-1">{m.senderType === 'support' ? 'Suporte' : 'Você'}</p>
                    <p className="text-sm text-slate-800 whitespace-pre-wrap">{m.message}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendReply} className="border-t border-slate-100 pt-3 mt-3 flex gap-2">
                <input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Escreva sua mensagem"
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold disabled:opacity-60 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Enviar
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40" />
                Selecione um ticket para conversar com o suporte.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
