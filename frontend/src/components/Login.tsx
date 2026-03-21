import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Droplets, ShieldCheck, Wallet, ArrowRight, Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { UserRole } from '../types';

interface LoginProps {
  onLogin: (payload: { role: UserRole; email: string; password: string }) => Promise<void>;
  onBack: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onBack }) => {
  const [step, setStep] = useState<'role' | 'credentials'>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep('credentials');
    setEmail(role === 'admin' ? 'admin@genomni.com' : 'caixa@genomni.com');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    try {
      setIsLoading(true);
      await onLogin({ role: selectedRole, email, password });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(160deg,#f3faff_0%,#ffffff_55%,#eaf5ff_100%)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0e2a47] to-[#4ea9d9] flex items-center justify-center text-white shadow-xl shadow-[#0e2a4730] mx-auto mb-4">
            <Droplets className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-[#0e2a47]">Sistema de Lavandaria GenOmni</h1>
          <p className="text-slate-500">
            {step === 'role' ? 'Selecione seu perfil de acesso' : `Acesso como ${selectedRole === 'admin' ? 'Administrador' : 'Gerente de Caixa'}`}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'role' ? (
            <motion.div
              key="role-selection"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <button
                onClick={() => handleRoleSelect('admin')}
                className="w-full group relative bg-white p-6 rounded-3xl border border-slate-200 hover:border-[#4ea9d9] hover:shadow-xl hover:shadow-[#4ea9d944] transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-[#dff2ff] text-[#0e2a47] group-hover:bg-[#0e2a47] group-hover:text-white transition-colors">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-800">Administrador</h3>
                    <p className="text-sm text-slate-500">Acesso total ao sistema e configurações</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-[#0e2a47] transition-colors" />
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect('cashier')}
                className="w-full group relative bg-white p-6 rounded-3xl border border-slate-200 hover:border-[#4ea9d9] hover:shadow-xl hover:shadow-[#4ea9d944] transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-[#dff2ff] text-[#0e2a47] group-hover:bg-[#4ea9d9] group-hover:text-[#0e2a47] transition-colors">
                    <Wallet className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-800">Gerente de Caixa</h3>
                    <p className="text-sm text-slate-500">Gestão de pedidos e clientes</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-[#0e2a47] transition-colors" />
                </div>
              </button>

              <button
                type="button"
                onClick={onBack}
                className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-slate-800 py-4 text-sm font-medium transition-colors border border-dashed border-slate-200 rounded-3xl hover:bg-slate-50"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para página inicial
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="credentials-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-[#0e2a4714] space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">E-mail</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4ea9d944]"
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Senha</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        required
                        minLength={6}
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4ea9d944]"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#0e2a47] hover:bg-[#12345a] disabled:bg-slate-300 text-white py-4 rounded-xl font-semibold transition-all shadow-lg shadow-[#0e2a4730] flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Entrar no Sistema'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('role')}
                    className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-slate-800 py-2 text-sm font-medium transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar para seleção de perfil
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-8 text-center text-xs text-slate-400">
          GenOmni v1.0.0 &copy; 2026 - Sistema de Gestão de Lavandaria
        </p>
      </motion.div>
    </div>
  );
};
