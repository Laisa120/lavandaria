import React, { useState } from 'react';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  Globe,
  Save,
  Palette,
  ShieldCheck,
  Hash,
  Briefcase,
  FileText,
  Upload,
  Settings as SettingsIcon,
  Image as ImageIcon,
  Printer
} from 'lucide-react';
import { LaundrySettings } from '../types';
import { fileToOptimizedDataUrl } from '../lib/imageUpload';
import { applyThemeMode, readThemeMode, saveThemeMode, type ThemeMode } from '../lib/theme';

interface SettingsProps {
  settings: LaundrySettings;
  onUpdateSettings: (settings: LaundrySettings) => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, onUpdateSettings }) => {
  const [formData, setFormData] = useState<LaundrySettings>(settings);
  const [activeSection, setActiveSection] = useState<'basic' | 'address' | 'fiscal' | 'banking' | 'system'>('basic');
  const [themeMode, setThemeMode] = useState<ThemeMode>(readThemeMode());

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const image = await fileToOptimizedDataUrl(file, { maxWidth: 512, maxHeight: 512, quality: 0.82 });
        setFormData({ ...formData, logo: image });
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Falha ao processar imagem.');
      }
    }
  };

  const handleLandingBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const image = await fileToOptimizedDataUrl(file, { maxWidth: 1920, maxHeight: 1080, quality: 0.8 });
        setFormData({ ...formData, landingBannerImage: image });
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Falha ao processar imagem.');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    alert('Configurações salvas com sucesso!');
  };

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    applyThemeMode(mode);
    saveThemeMode(mode);
  };

  const navItems = [
    { id: 'basic', label: 'Dados da Empresa', icon: Building2 },
    { id: 'address', label: 'Endereço e Contactos', icon: MapPin },
    { id: 'fiscal', label: 'Dados Fiscais', icon: FileText },
    { id: 'banking', label: 'Dados Bancários', icon: CreditCard },
    { id: 'system', label: 'Configurações do Sistema', icon: SettingsIcon },
  ];

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Configurações do Sistema</h2>
        <p className="text-slate-500">Personalize o Sistema de Lavandaria GenOmni para as necessidades da sua lavandaria.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                activeSection === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
          <div className="pt-4 space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-medium transition-all">
              <Palette className="w-5 h-5" />
              Aparência
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-medium transition-all">
              <ShieldCheck className="w-5 h-5" />
              Segurança
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="lg:col-span-3 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
            {activeSection === 'basic' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Dados Básicos da Empresa</h3>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Logotipo da Empresa</label>
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden group relative">
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
                        <p className="text-sm font-bold text-slate-800 mb-1">Alterar logotipo</p>
                        <p className="text-xs text-slate-500 mb-3">Carregue uma imagem quadrada para melhores resultados.</p>
                        <button 
                          type="button"
                          onClick={() => document.getElementById('settings-logo-upload')?.click()}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          Selecionar Ficheiro
                        </button>
                        <input 
                          id="settings-logo-upload"
                          type="file" 
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Banner da Página Inicial</label>
                    <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                      <div className="h-40 w-full relative group">
                        {formData.landingBannerImage ? (
                          <>
                            <img src={formData.landingBannerImage} alt="Preview Banner" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ImageIcon className="w-7 h-7 text-white" />
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            Sem imagem de banner configurada
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex items-center justify-between gap-3">
                        <p className="text-xs text-slate-500">A imagem será exibida no banner da página inicial.</p>
                        <button
                          type="button"
                          onClick={() => document.getElementById('settings-landing-banner-upload')?.click()}
                          className="px-4 py-2 bg-[#dff2ff] hover:bg-[#cce9fb] text-[#0e2a47] rounded-lg text-xs font-semibold transition-all flex items-center gap-2"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          Trocar Banner
                        </button>
                        <input
                          id="settings-landing-banner-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleLandingBannerChange}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Razão Social</label>
                      <input 
                        required
                        minLength={3}
                        type="text" 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Nome Comercial</label>
                      <input 
                        required
                        minLength={3}
                        type="text" 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={formData.tradeName}
                        onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">NIF</label>
                      <input 
                        required
                        minLength={9}
                        type="text" 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={formData.nif}
                        onChange={(e) => setFormData({ ...formData, nif: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Tipo de Empresa</label>
                      <select 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none"
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
              </div>
            )}

            {activeSection === 'address' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Endereço e Contactos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">País</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Província / Estado</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Município</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={formData.municipality}
                      onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Código Postal</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Telefone</label>
                    <input 
                      required
                      type="tel" 
                      pattern="^\+?[0-9\s\-]{9,15}$"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Email</label>
                    <input 
                      required
                      type="email" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Endereço Completo</label>
                    <textarea 
                      required
                      minLength={10}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[80px]"
                      value={formData.fullAddress}
                      onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Website</label>
                    <input 
                      type="url" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={formData.website || ''}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'fiscal' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Dados Fiscais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Regime de IVA</label>
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
                    <label className="text-sm font-semibold text-slate-700">Taxa de IVA Padrão (%)</label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={formData.defaultIvaRate}
                      onChange={(e) => setFormData({ ...formData, defaultIvaRate: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Moeda</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Série da Fatura</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={formData.invoiceSeries}
                      onChange={(e) => setFormData({ ...formData, invoiceSeries: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Nº Inicial da Fatura</label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={formData.startInvoiceNumber}
                      onChange={(e) => setFormData({ ...formData, startInvoiceNumber: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Retenção na Fonte (%)</label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={formData.withholdingTaxPercentage || 0}
                      onChange={(e) => setFormData({ ...formData, withholdingTaxPercentage: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'banking' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Dados Bancários</h3>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Nome do Banco</label>
                    <input 
                      minLength={3}
                      type="text" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={formData.bankName || ''}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Número da Conta</label>
                    <input 
                      minLength={5}
                      type="text" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={formData.accountNumber || ''}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">IBAN</label>
                    <input 
                      minLength={15}
                      type="text" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={formData.iban || ''}
                      onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'system' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Configurações do Sistema</h3>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Tema do Sistema</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleThemeChange('light')}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border ${
                        themeMode === 'light'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Light Mode
                    </button>
                    <button
                      type="button"
                      onClick={() => handleThemeChange('dark')}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border ${
                        themeMode === 'dark'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Dark Mode
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Modelo de Fatura</label>
                    <select 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none"
                      value={formData.invoiceModel}
                      onChange={(e) => setFormData({ ...formData, invoiceModel: e.target.value as any })}
                    >
                      <option value="A4">Modelo A4 (Padrão)</option>
                      <option value="thermal">Modelo Térmico (80mm)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Formato do Número da Fatura</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Ex: SERIE/NUMERO"
                      value={formData.invoiceNumberFormat}
                      onChange={(e) => setFormData({ ...formData, invoiceNumberFormat: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Permitir Vendas a Crédito</label>
                    <div className="flex items-center gap-4 py-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          checked={formData.allowCreditSales === true}
                          onChange={() => setFormData({ ...formData, allowCreditSales: true })}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-slate-700">Sim</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          checked={formData.allowCreditSales === false}
                          onChange={() => setFormData({ ...formData, allowCreditSales: false })}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-slate-700">Não</span>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Dias Padrão de Vencimento</label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={formData.defaultDueDays}
                      onChange={(e) => setFormData({ ...formData, defaultDueDays: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Permitir Desconto Global</label>
                    <div className="flex items-center gap-4 py-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          checked={formData.allowGlobalDiscount === true}
                          onChange={() => setFormData({ ...formData, allowGlobalDiscount: true })}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-slate-700">Sim</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          checked={formData.allowGlobalDiscount === false}
                          onChange={() => setFormData({ ...formData, allowGlobalDiscount: false })}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-slate-700">Não</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <h4 className="text-md font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Printer className="w-5 h-5 text-blue-600" />
                    Configuração da Impressora
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Nome da Impressora</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Ex: Impressora Térmica Cozinha"
                        value={formData.printerName || ''}
                        onChange={(e) => setFormData({ ...formData, printerName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Tipo de Conexão</label>
                      <select 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none"
                        value={formData.printerConnectionType}
                        onChange={(e) => setFormData({ ...formData, printerConnectionType: e.target.value as any })}
                      >
                        <option value="usb">USB</option>
                        <option value="network">Rede (IP)</option>
                        <option value="bluetooth">Bluetooth</option>
                      </select>
                    </div>
                    {formData.printerConnectionType === 'network' && (
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Endereço IP da Impressora</label>
                        <input 
                          required
                          pattern="^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$"
                          title="Insira um endereço IP válido (ex: 192.168.1.100)"
                          type="text" 
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          placeholder="Ex: 192.168.1.100"
                          value={formData.printerIpAddress || ''}
                          onChange={(e) => setFormData({ ...formData, printerIpAddress: e.target.value })}
                        />
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Impressão Automática</label>
                      <div className="flex items-center gap-4 py-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            checked={formData.autoPrintReceipt === true}
                            onChange={() => setFormData({ ...formData, autoPrintReceipt: true })}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-sm text-slate-700">Ativar</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            checked={formData.autoPrintReceipt === false}
                            onChange={() => setFormData({ ...formData, autoPrintReceipt: false })}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-sm text-slate-700">Desativar</span>
                        </label>
                      </div>
                      <p className="text-xs text-slate-500">Imprimir recibo automaticamente ao finalizar pedido.</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Descarga Automática de PDF</label>
                      <div className="flex items-center gap-4 py-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            checked={formData.autoDownloadPDF === true}
                            onChange={() => setFormData({ ...formData, autoDownloadPDF: true })}
                            className="w-4 h-4 text-emerald-600"
                          />
                          <span className="text-sm text-slate-700">Ativar</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            checked={formData.autoDownloadPDF === false}
                            onChange={() => setFormData({ ...formData, autoDownloadPDF: false })}
                            className="w-4 h-4 text-emerald-600"
                          />
                          <span className="text-sm text-slate-700">Desativar</span>
                        </label>
                      </div>
                      <p className="text-xs text-slate-500">Descarregar fatura em PDF automaticamente ao finalizar pedido.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button 
                type="submit"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-100"
              >
                <Save className="w-5 h-5" />
                Salvar Alterações
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};
