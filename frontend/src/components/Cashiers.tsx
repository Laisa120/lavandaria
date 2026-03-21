import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2,
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { User } from '../types';

interface CashiersProps {
  cashiers: User[];
  onAddCashier: (cashier: User) => void;
  onUpdateCashier: (cashier: User) => void;
  onDeleteCashier: (cashierId: string) => void;
}

export const Cashiers: React.FC<CashiersProps> = ({ 
  cashiers, 
  onAddCashier, 
  onUpdateCashier,
  onDeleteCashier 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCashier, setEditingCashier] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    status: 'active' as User['status']
  });

  const filteredCashiers = cashiers.filter(c => 
    c.role === 'cashier' && (
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCashier) {
      onUpdateCashier({
        ...editingCashier,
        name: formData.name,
        email: formData.email,
        password: formData.password || editingCashier.password,
        status: formData.status
      });
    } else {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'cashier',
        status: formData.status,
        createdAt: new Date().toISOString()
      };
      onAddCashier(newUser);
    }
    closeModal();
  };

  const openModal = (cashier?: User) => {
    if (cashier) {
      setEditingCashier(cashier);
      setFormData({
        name: cashier.name,
        email: cashier.email,
        password: '',
        status: cashier.status
      });
    } else {
      setEditingCashier(null);
      setFormData({ name: '', email: '', password: '', status: 'active' });
    }
    setIsModalOpen(true);
    setShowPassword(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCashier(null);
    setFormData({ name: '', email: '', password: '', status: 'active' });
    setShowPassword(false);
  };

  const toggleStatus = (cashier: User) => {
    onUpdateCashier({
      ...cashier,
      status: cashier.status === 'active' ? 'inactive' : 'active'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gerenciar Caixas</h2>
          <p className="text-slate-500">Crie e gerencie as contas dos seus operadores de caixa.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-200"
        >
          <Plus className="w-5 h-5" />
          Novo Caixa
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou e-mail..." 
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Cashiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCashiers.map((cashier) => (
          <div key={cashier.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${cashier.status === 'active' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                <UserIcon className="w-6 h-6" />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => openModal(cashier)}
                  className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => onDeleteCashier(cashier.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-slate-800 mb-1">{cashier.name}</h3>
            <p className="text-sm text-slate-500 mb-4 flex items-center gap-2">
              <Mail className="w-3 h-3" />
              {cashier.email}
            </p>
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${cashier.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                  {cashier.status === 'active' ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <button 
                onClick={() => toggleStatus(cashier)}
                className={`flex items-center gap-1 text-xs font-semibold transition-colors ${cashier.status === 'active' ? 'text-emerald-600 hover:text-emerald-700' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {cashier.status === 'active' ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                {cashier.status === 'active' ? 'Desativar' : 'Ativar'}
              </button>
            </div>
          </div>
        ))}
        {filteredCashiers.length === 0 && (
          <div className="col-span-full bg-white py-20 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
            <UserIcon className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-medium">Nenhum caixa encontrado.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800">{editingCashier ? 'Editar Caixa' : 'Novo Caixa'}</h3>
              <button onClick={closeModal} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <Plus className="w-6 h-6 rotate-45 text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Nome Completo</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    required
                    minLength={3}
                    type="text" 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Ex: João Silva"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">E-mail de Acesso</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    required
                    type="email" 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="caixa@genomni.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Senha {editingCashier && '(deixe em branco para manter)'}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    required={!editingCashier}
                    minLength={6}
                    type={showPassword ? 'text' : 'password'} 
                    className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Status da Conta</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as User['status'] })}
                  >
                    <option value="active">Ativo (Pode acessar)</option>
                    <option value="inactive">Inativo (Acesso bloqueado)</option>
                  </select>
                </div>
              </div>
              
              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-100 mt-4"
              >
                {editingCashier ? 'Salvar Alterações' : 'Criar Conta de Caixa'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
