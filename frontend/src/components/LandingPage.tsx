import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Droplets, 
  CheckCircle2, 
  ArrowRight, 
  Store, 
  Zap, 
  Shield, 
  BarChart3,
  Plus,
  X,
  Building2,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Upload,
  Globe,
  Hash,
  Briefcase,
  CreditCard,
  Image as ImageIcon
} from 'lucide-react';
import { LaundrySettings } from '../types';

interface LandingPageProps {
  isRegistered: boolean;
  settings: LaundrySettings;
  onRegister: (settings: LaundrySettings) => void;
  onProceedToLogin: () => void;
  onOpenAbout: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  isRegistered,
  settings,
  onRegister,
  onProceedToLogin,
  onOpenAbout,
}) => {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<LaundrySettings>({
    companyName: '',
    landingBannerImage: '',
    tradeName: '',
    nif: '',
    companyType: 'Lda',
    country: 'Angola',
    province: '',
    municipality: '',
    fullAddress: '',
    postalCode: '',
    phone: '',
    email: '',
    website: '',
    ivaRegime: 'geral',
    defaultIvaRate: 14,
    currency: 'Kz',
    invoiceSeries: new Date().getFullYear().toString(),
    startInvoiceNumber: 1,
    withholdingTaxPercentage: 0,
    bankName: '',
    accountNumber: '',
    iban: '',
    invoiceModel: 'A4',
    invoiceNumberFormat: 'SERIE/NUMERO',
    allowCreditSales: false,
    defaultDueDays: 30,
    allowGlobalDiscount: true,
    printerName: '',
    printerConnectionType: 'usb',
    printerIpAddress: '',
    autoPrintReceipt: false,
    autoDownloadPDF: false
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      return;
    }
    onRegister(formData);
    setIsRegisterModalOpen(false);
  };

  const steps = [
    { title: 'Dados Básicos', icon: Building2 },
    { title: 'Endereço', icon: MapPin },
    { title: 'Fiscal', icon: Shield },
    { title: 'Bancário', icon: DollarSign }
  ];

  const features = [
    { icon: Zap, title: 'Gestão Rápida', desc: 'Operações diárias ágeis com uma interface clara e objetiva.' },
    { icon: Shield, title: 'Faturação Automática', desc: 'Emissão organizada com menos esforço operacional.' },
    { icon: Store, title: 'Controle de Clientes', desc: 'Histórico completo de clientes e pedidos num só local.' },
    { icon: BarChart3, title: 'Relatórios', desc: 'Visão prática de desempenho e resultados do negócio.' },
  ];

  const landingBannerImage =
    settings.landingBannerImage?.trim() ||
    'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?auto=format&fit=crop&w=1600&q=80';

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7fcff_0%,#ffffff_40%,#eff7ff_100%)] overflow-x-hidden">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0e2a47] to-[#4ea9d9] flex items-center justify-center text-white shadow-lg shadow-[#4ea9d933]">
            <Droplets className="w-6 h-6" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-[#0e2a47]">GenOmni</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-slate-600 hover:text-[#0e2a47] font-medium transition-colors">Funcionalidades</a>
          <button onClick={onOpenAbout} className="text-slate-600 hover:text-[#0e2a47] font-medium transition-colors">
            Sobre
          </button>
          <div className="flex items-center gap-4">
            {isRegistered && (
              <button 
                onClick={() => setIsRegisterModalOpen(true)}
                className="text-slate-600 font-bold hover:text-blue-600 transition-colors"
              >
                Registar Nova
              </button>
            )}
            <button 
              onClick={isRegistered ? onProceedToLogin : () => setIsRegisterModalOpen(true)}
              className="bg-[#0e2a47] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#12345a] transition-all shadow-lg shadow-[#0e2a4730] flex items-center gap-2"
            >
              {isRegistered ? 'Fazer Login' : 'Registar Lavandaria'}
              <ArrowRight className="w-4 h-4" />
            </button>
            {!isRegistered && (
              <button 
                onClick={onProceedToLogin}
                className="text-[#0e2a47] font-semibold hover:text-[#12345a] transition-colors"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section / Advertising Banner */}
      <section className="relative pt-12 pb-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#dff2ff] text-[#0e2a47] font-semibold text-sm mb-6">
              <Store className="w-4 h-4" />
              O Futuro da sua Lavandaria começa aqui
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-[#0e2a47] leading-tight mb-8">
              Lavandaria <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0e2a47] to-[#4ea9d9]">GenOmni</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-xl">
              Gestão inteligente para lavandarias modernas
            </p>
            
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {isRegistered ? (
                  <>
                    <button 
                      onClick={onProceedToLogin}
                      className="flex items-center justify-center gap-2 bg-[#0e2a47] text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-[#12345a] transition-all shadow-xl shadow-[#0e2a4730] group"
                    >
                      Entrar no sistema
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button 
                      onClick={() => setIsRegisterModalOpen(true)}
                      className="flex items-center justify-center gap-2 bg-white border-2 border-[#cde8fb] text-[#0e2a47] px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-[#eef8ff] transition-all"
                    >
                      Criar empresa
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => setIsRegisterModalOpen(true)}
                      className="flex items-center justify-center gap-2 bg-[#0e2a47] text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-[#12345a] transition-all shadow-xl shadow-[#0e2a4730] group"
                    >
                      Criar empresa
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button 
                      onClick={onProceedToLogin}
                      className="flex items-center justify-center gap-2 bg-white border-2 border-slate-100 text-slate-700 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-slate-50 transition-all"
                    >
                      Entrar no sistema
                    </button>
                  </>
                )}
              </div>
              
              {!isRegistered && (
                <p className="text-slate-500 text-sm font-medium">
                  Já registou a sua lavandaria?{' '}
                  <button 
                    onClick={onProceedToLogin}
                    className="text-[#0e2a47] hover:underline font-semibold"
                  >
                    Clique aqui para fazer login
                  </button>
                </p>
              )}
            </div>

            <div className="mt-12 flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <img 
                    key={i}
                    src={`https://picsum.photos/seed/user${i}/100/100`} 
                    className="w-10 h-10 rounded-full border-2 border-white"
                    alt="User"
                  />
                ))}
              </div>
              <p className="text-sm text-slate-500 font-medium">
                <span className="text-slate-900 font-bold">+500 lavandarias</span> já confiam no GenOmni
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 bg-gradient-to-br from-[#0e2a4715] to-[#4ea9d925] rounded-[2.5rem] p-4 backdrop-blur-sm border border-white/20">
              <img 
                src={landingBannerImage}
                className="rounded-[2rem] shadow-2xl"
                alt="Banner da página inicial"
              />
            </div>
            {/* Decorative Blobs */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#4ea9d92f] rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#0e2a4726] rounded-full blur-3xl animate-pulse" />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Benefícios para operações reais</h2>
            <p className="text-slate-600 text-lg">Uma experiência SaaS moderna, simples e pronta para escalar.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <div key={i} className="card-modern p-8 rounded-3xl group">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <f.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                <p className="text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="card-modern p-10 md:p-12 bg-gradient-to-r from-[#0e2a47] to-[#1f4c7d] text-white">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">Começar agora</h2>
            <p className="text-[#dcefff] mb-8 max-w-2xl">
              Leva a tua lavandaria para um novo nível com uma plataforma segura, rápida e profissional.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onProceedToLogin}
                className="px-7 py-3 rounded-xl bg-white text-[#0e2a47] font-semibold hover:bg-[#eaf5ff] transition-all"
              >
                Entrar no sistema
              </button>
              <button
                onClick={() => setIsRegisterModalOpen(true)}
                className="px-7 py-3 rounded-xl bg-[#4ea9d9] text-[#0e2a47] font-semibold hover:bg-[#7ec2e7] transition-all"
              >
                Criar empresa
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Modal */}
      {isRegisterModalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          onClick={() => setIsRegisterModalOpen(false)}
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">Registar Lavandaria</h3>
                  <p className="text-slate-500 text-sm">Passo {currentStep + 1} de 4: {steps[currentStep].title}</p>
                </div>
                <button 
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="p-3 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="flex gap-2">
                {steps.map((step, idx) => (
                  <div 
                    key={idx}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                      idx <= currentStep ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
              {currentStep === 0 && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-5"
                >
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Logotipo da Empresa</label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden group relative">
                        {formData.logo ? (
                          <>
                            <img src={formData.logo} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-white" />
                            </div>
                          </>
                        ) : (
                          <ImageIcon className="w-8 h-8 text-slate-300" />
                        )}
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700 mb-1">Carregar imagem</p>
                        <p className="text-xs text-slate-500">PNG, JPG ou SVG. Recomendado 200x200px.</p>
                        <button 
                          type="button"
                          onClick={() => document.getElementById('logo-upload')?.click()}
                          className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <Upload className="w-3 h-3" />
                          Selecionar ficheiro
                        </button>
                        <input 
                          id="logo-upload"
                          type="file" 
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Razão Social</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          required
                          type="text" 
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          placeholder="Nome Legal da Empresa"
                          value={formData.companyName}
                          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome Comercial</label>
                      <div className="relative">
                        <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          required
                          type="text" 
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          placeholder="Nome da Marca"
                          value={formData.tradeName}
                          onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">NIF</label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          required
                          type="text" 
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          placeholder="Número de Identificação Fiscal"
                          value={formData.nif}
                          onChange={(e) => setFormData({ ...formData, nif: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo de Empresa</label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select 
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none"
                          value={formData.companyType}
                          onChange={(e) => setFormData({ ...formData, companyType: e.target.value })}
                        >
                          <option value="Unipessoal">Unipessoal</option>
                          <option value="Lda">Lda</option>
                          <option value="SA">SA</option>
                          <option value="Outro">Outro</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 1 && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">País</label>
                      <input 
                        required
                        type="text" 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Província / Estado</label>
                      <input 
                        required
                        type="text" 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Ex: Luanda"
                        value={formData.province}
                        onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Município</label>
                      <input 
                        required
                        type="text" 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={formData.municipality}
                        onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Código Postal</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Telefone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          required
                          type="tel" 
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">E-mail</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          required
                          type="email" 
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Endereço Completo</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <textarea 
                        required
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[80px]"
                        value={formData.fullAddress}
                        onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Website (Opcional)</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="url" 
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="https://suaempresa.com"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Regime de IVA</label>
                      <select 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none"
                        value={formData.ivaRegime}
                        onChange={(e) => setFormData({ ...formData, ivaRegime: e.target.value as any })}
                      >
                        <option value="geral">Regime Geral</option>
                        <option value="nao_sujeicao">Regime de Não Sujeição</option>
                        <option value="isento">Isento</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Taxa de IVA Padrão (%)</label>
                      <input 
                        required
                        type="number" 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={formData.defaultIvaRate}
                        onChange={(e) => setFormData({ ...formData, defaultIvaRate: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Moeda</label>
                      <input 
                        required
                        type="text" 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Série da Fatura</label>
                      <input 
                        required
                        type="text" 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={formData.invoiceSeries}
                        onChange={(e) => setFormData({ ...formData, invoiceSeries: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nº Inicial da Fatura</label>
                      <input 
                        required
                        type="number" 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={formData.startInvoiceNumber}
                        onChange={(e) => setFormData({ ...formData, startInvoiceNumber: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Retenção na Fonte (%)</label>
                      <input 
                        type="number" 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={formData.withholdingTaxPercentage}
                        onChange={(e) => setFormData({ ...formData, withholdingTaxPercentage: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-5"
                >
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome do Banco</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={formData.bankName}
                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Número da Conta</label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={formData.accountNumber}
                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">IBAN</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={formData.iban}
                        onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div className="flex gap-4 pt-4">
                {currentStep > 0 && (
                  <button 
                    type="button"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-4 rounded-2xl font-bold text-lg transition-all"
                  >
                    Voltar
                  </button>
                )}
                <button 
                  type="submit"
                  className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-blue-100"
                >
                  {currentStep === 3 ? 'Concluir Registo' : 'Próximo Passo'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
