import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  adminBlockUser,
  adminImpersonate,
  adminListAuditLogs,
  adminListCompanies,
  adminListUsers,
  adminLogin,
  adminResetPassword,
  adminSuspendCompany,
  AdminCompany,
  AdminUser,
  AuditLogDto,
} from '../lib/supportGenomnApi';

type Tab = 'dashboard' | 'companies' | 'users' | 'logs' | 'licenses';

export function AdminApp() {
  const [token, setToken] = useState<string | null>(sessionStorage.getItem('support_genomn_admin_token'));
  const [email, setEmail] = useState('superadmin@genomn.local');
  const [password, setPassword] = useState('superadmin123');
  const [tab, setTab] = useState<Tab>('dashboard');
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [logs, setLogs] = useState<AuditLogDto[]>([]);

  const loadAll = async (adminToken: string) => {
    const [c, u, l] = await Promise.all([
      adminListCompanies(adminToken),
      adminListUsers(adminToken),
      adminListAuditLogs(adminToken),
    ]);
    setCompanies(c);
    setUsers(u);
    setLogs(l);
  };

  useEffect(() => {
    if (!token) return;
    loadAll(token).catch((error) => {
      alert(error instanceof Error ? error.message : 'Falha ao carregar painel admin.');
      setToken(null);
      sessionStorage.removeItem('support_genomn_admin_token');
    });
  }, [token]);

  const totals = useMemo(() => {
    const activeCompanies = companies.filter((c) => c.status === 'active').length;
    const blockedUsers = users.filter((u) => u.isBlocked).length;
    return { activeCompanies, blockedUsers };
  }, [companies, users]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminLogin({ email, password });
      setToken(res.token);
      sessionStorage.setItem('support_genomn_admin_token', res.token);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Login admin falhou.');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 w-full max-w-md space-y-3">
          <h1 className="text-2xl font-bold text-slate-800">Support_GenOmn Admin</h1>
          <p className="text-sm text-slate-500">Acesso exclusivo para equipa técnica.</p>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-lg" type="email" required />
          <input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded-lg" type="password" required />
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold" type="submit">Entrar</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Support_GenOmn - Painel Técnico</h1>
        <button
          onClick={() => {
            sessionStorage.removeItem('support_genomn_admin_token');
            setToken(null);
          }}
          className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600"
        >
          Sair
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(['dashboard', 'companies', 'users', 'logs', 'licenses'] as Tab[]).map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`px-4 py-2 rounded-lg ${tab === item ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4"><p className="text-slate-500">Empresas ativas</p><p className="text-2xl font-bold">{totals.activeCompanies}</p></div>
          <div className="bg-white border border-slate-200 rounded-xl p-4"><p className="text-slate-500">Usuários bloqueados</p><p className="text-2xl font-bold">{totals.blockedUsers}</p></div>
          <div className="bg-white border border-slate-200 rounded-xl p-4"><p className="text-slate-500">Eventos de auditoria</p><p className="text-2xl font-bold">{logs.length}</p></div>
        </div>
      )}

      {tab === 'companies' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-auto">
          <table className="w-full text-left">
            <thead><tr className="border-b"><th className="p-3">Empresa</th><th className="p-3">Status</th><th className="p-3">Licença</th><th className="p-3">Ações</th></tr></thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="p-3">{c.name}</td>
                  <td className="p-3">{c.status}</td>
                  <td className="p-3">{c.licenseType} / {c.licenseExpiryDate ?? 'N/A'}</td>
                  <td className="p-3">
                    <button
                      className="px-3 py-1 rounded bg-slate-800 text-white"
                      onClick={async () => {
                        const nextStatus = c.status === 'active' ? 'suspended' : 'active';
                        await adminSuspendCompany(token, c.id, { status: nextStatus });
                        await loadAll(token);
                      }}
                    >
                      {c.status === 'active' ? 'Suspender' : 'Ativar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'users' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-auto">
          <table className="w-full text-left">
            <thead><tr className="border-b"><th className="p-3">Nome</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Ações</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b">
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.platformRole ?? '-'}</td>
                  <td className="p-3 flex gap-2">
                    <button className="px-3 py-1 rounded border" onClick={async () => { await adminBlockUser(token, u.id); await loadAll(token); }}>Bloquear</button>
                    <button className="px-3 py-1 rounded border" onClick={async () => {
                      const res = await adminResetPassword(token, u.id);
                      alert(`Token de reset: ${res.resetToken}`);
                    }}>Reset senha</button>
                    <button className="px-3 py-1 rounded border" onClick={async () => {
                      const res = await adminImpersonate(token, u.id);
                      alert(`Impersonation token: ${res.token}`);
                    }}>Impersonar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'logs' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-auto">
          <table className="w-full text-left">
            <thead><tr className="border-b"><th className="p-3">Ação</th><th className="p-3">Admin</th><th className="p-3">Target</th><th className="p-3">Data</th></tr></thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b">
                  <td className="p-3">{l.action}</td>
                  <td className="p-3">{l.adminId ?? '-'}</td>
                  <td className="p-3">{l.targetId ?? '-'}</td>
                  <td className="p-3">{new Date(l.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'licenses' && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-slate-600">
          Gerencie licenças na aba <strong>companies</strong> (ativar/suspender e data de expiração).
        </div>
      )}
    </div>
  );
}
