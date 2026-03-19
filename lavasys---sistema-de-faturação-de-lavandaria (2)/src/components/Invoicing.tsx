import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Printer, 
  Save, 
  X, 
  Receipt, 
  User, 
  Phone, 
  MapPin, 
  CreditCard, 
  Calculator,
  FileText,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  UserPlus,
  Pencil,
  ShoppingBag
} from 'lucide-react';
import { 
  Order, 
  Customer, 
  LaundryItem, 
  LaundrySettings, 
  DocumentType, 
  PaymentMethod,
  User as UserType
} from '../types';
import { format } from 'date-fns';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { Invoice } from './Invoice';
import { formatCurrencyAO } from '../lib/format';

interface InvoicingProps {
  orders: Order[];
  customers: Customer[];
  laundryItems: LaundryItem[];
  settings: LaundrySettings;
  currentUser: UserType;
  onAddCustomer: (customer: Customer) => Promise<Customer>;
  onUpdateCustomer: (customer: Customer) => Promise<Customer>;
  onEmitInvoice: (invoice: any) => void; // In a real app, this would save to DB
}

interface InvoiceLine {
  id: string;
  itemId: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  discount: number;
  iva: number;
  subtotal: number;
}

export const Invoicing: React.FC<InvoicingProps> = ({ 
  orders,
  customers, 
  laundryItems, 
  settings, 
  currentUser,
  onAddCustomer,
  onUpdateCustomer,
  onEmitInvoice
}) => {
  // --- State ---
  const [docType, setDocType] = useState<DocumentType>('fatura_recibo');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerResults, setShowCustomerResults] = useState(false);
  
  const [items, setItems] = useState<InvoiceLine[]>([]);
  const [itemSearch, setItemSearch] = useState('');
  const [showItemResults, setShowItemResults] = useState(false);
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('dinheiro');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [observations, setObservations] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  
  const [showPreview, setShowPreview] = useState(false);
  const [emittedInvoice, setEmittedInvoice] = useState<any>(null);
  const [showPendingOrders, setShowPendingOrders] = useState(false);

  // --- Derived State ---
  const pendingOrders = useMemo(() => {
    return orders.filter(o => o.paymentStatus === 'unpaid' && o.status !== 'cancelled');
  }, [orders]);
  const invoiceNumber = useMemo(() => {
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${settings.invoiceSeries}/${year}-${random}`;
  }, [settings.invoiceSeries]);

  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return [];
    return customers.filter(c => 
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
      c.phone.includes(customerSearch)
    );
  }, [customers, customerSearch]);

  const filteredItems = useMemo(() => {
    if (!itemSearch) return [];
    return laundryItems.filter(i => 
      i.name.toLowerCase().includes(itemSearch.toLowerCase())
    );
  }, [laundryItems, itemSearch]);

  const totals = useMemo(() => {
    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const totalDiscount = items.reduce((acc, item) => acc + (item.price * item.quantity * (item.discount / 100)), 0);
    const totalIva = items.reduce((acc, item) => acc + ((item.price * item.quantity - (item.price * item.quantity * (item.discount / 100))) * (item.iva / 100)), 0);
    const total = subtotal - totalDiscount + totalIva;
    const change = amountPaid > total ? amountPaid - total : 0;

    return { subtotal, totalDiscount, totalIva, total, change };
  }, [items, amountPaid]);

  // --- Handlers ---
  const handleAddLine = (item: LaundryItem) => {
    const newLine: InvoiceLine = {
      id: Math.random().toString(36).substr(2, 9),
      itemId: item.id,
      name: item.name,
      description: 'Serviço de Lavandaria',
      quantity: 1,
      price: item.price,
      discount: 0,
      iva: settings.defaultIvaRate,
      subtotal: item.price
    };
    setItems([...items, newLine]);
    setItemSearch('');
    setShowItemResults(false);
  };

  const handleLoadOrder = (order: Order) => {
    const customer = customers.find(c => c.id === order.customerId);
    if (customer) setSelectedCustomer(customer);

    const orderLines: InvoiceLine[] = order.items.map(item => {
      const laundryItem = laundryItems.find(li => li.id === item.itemId);
      return {
        id: Math.random().toString(36).substr(2, 9),
        itemId: item.itemId,
        name: laundryItem?.name || 'Serviço',
        description: 'Importado do Pedido #' + order.id.slice(0, 8),
        quantity: item.quantity,
        price: item.priceAtTime,
        discount: 0,
        iva: settings.defaultIvaRate,
        subtotal: item.quantity * item.priceAtTime
      };
    });

    setItems(orderLines);
    setAmountPaid(order.total);
    setShowPendingOrders(false);
  };

  const handleUpdateLine = (id: string, updates: Partial<InvoiceLine>) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, ...updates };
        updated.subtotal = (updated.price * updated.quantity) * (1 - updated.discount / 100) * (1 + updated.iva / 100);
        return updated;
      }
      return item;
    }));
  };

  const handleRemoveLine = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleClear = () => {
    if (window.confirm('Tem certeza que deseja limpar todo o formulário?')) {
      setSelectedCustomer(null);
      setCustomerSearch('');
      setItems([]);
      setAmountPaid(0);
      setObservations('');
      setInternalNotes('');
      setPaymentMethod('dinheiro');
    }
  };

  const handleEmit = () => {
    if (!selectedCustomer) {
      alert('Por favor, selecione um cliente.');
      return;
    }
    if (items.length === 0) {
      alert('Adicione pelo menos um item à fatura.');
      return;
    }

    const invoiceData = {
      id: invoiceNumber,
      type: docType,
      customer: selectedCustomer,
      items: items,
      totals: totals,
      paymentMethod,
      amountPaid,
      observations,
      operator: currentUser.name,
      createdAt: new Date().toISOString()
    };

    // In a real app, we would save this to the database
    setEmittedInvoice(invoiceData);
    setShowPreview(true);
    
    // Feedback visual
    console.log('Fatura emitida:', invoiceData);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const customerData: Customer = {
      id: editingCustomer?.id || '',
      name: formData.get('name') as string,
      email: '',
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      createdAt: editingCustomer?.createdAt || new Date().toISOString(),
    };

    try {
      if (editingCustomer) {
        const saved = await onUpdateCustomer(customerData);
        if (selectedCustomer?.id === customerData.id) setSelectedCustomer(saved);
      } else {
        const saved = await onAddCustomer(customerData);
        setSelectedCustomer(saved);
      }

      setIsCustomerModalOpen(false);
      setEditingCustomer(null);
    } catch {
      // Error message is handled at App level.
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* --- Header Section --- */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col lg:flex-row justify-between gap-8">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-100">
            <Receipt className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Facturação</h2>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                Série: {settings.invoiceSeries}
              </span>
            </div>
            <p className="text-slate-500 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-400" />
              Documento nº: <span className="font-black text-slate-700">{invoiceNumber}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Button 
            variant="outline" 
            icon={<ShoppingBag className="w-4 h-4" />}
            onClick={() => setShowPendingOrders(true)}
            className="relative"
          >
            Pedidos Pendentes
            {pendingOrders.length > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-bounce">
                {pendingOrders.length}
              </span>
            )}
          </Button>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 flex-1 max-w-3xl">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Data</p>
              <p className="font-bold text-slate-700">{format(new Date(), 'dd/MM/yyyy')}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hora</p>
              <p className="font-bold text-slate-700">{format(new Date(), 'HH:mm')}</p>
            </div>
            <div className="col-span-1">
              <Select 
                label="Tipo de Documento"
                value={docType}
                onChange={(e) => setDocType(e.target.value as DocumentType)}
                options={[
                  { value: 'fatura', label: 'Fatura' },
                  { value: 'fatura_recibo', label: 'Fatura-Recibo' },
                  { value: 'proforma', label: 'Proforma' },
                  { value: 'nota_credito', label: 'Nota de Crédito' },
                  { value: 'nota_debito', label: 'Nota de Débito' },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          {/* --- Customer Selection --- */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" />
                Selecção de Cliente
              </h3>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  icon={<UserPlus className="w-4 h-4" />}
                  onClick={() => {
                    setEditingCustomer(null);
                    setIsCustomerModalOpen(true);
                  }}
                >
                  Novo
                </Button>
                {selectedCustomer && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    icon={<Pencil className="w-4 h-4" />}
                    onClick={() => {
                      setEditingCustomer(selectedCustomer);
                      setIsCustomerModalOpen(true);
                    }}
                  >
                    Editar
                  </Button>
                )}
              </div>
            </div>

            <div className="relative">
              <Input 
                placeholder="Pesquisar por nome ou telefone..."
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setShowCustomerResults(true);
                }}
                onFocus={() => setShowCustomerResults(true)}
                icon={<Search className="w-5 h-5" />}
              />
              
              {showCustomerResults && filteredCustomers.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {filteredCustomers.map(c => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedCustomer(c);
                        setShowCustomerResults(false);
                        setCustomerSearch('');
                      }}
                      className="w-full text-left px-6 py-4 hover:bg-blue-50 transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <p className="font-bold text-slate-800 group-hover:text-blue-700">{c.name}</p>
                        <p className="text-xs text-slate-500">{c.phone}</p>
                      </div>
                      <Plus className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedCustomer ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-blue-50/50 rounded-2xl border border-blue-100 animate-in zoom-in-95 duration-300">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-500 shadow-sm">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome do Cliente</p>
                      <p className="font-bold text-slate-800">{selectedCustomer.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-500 shadow-sm">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Telefone</p>
                      <p className="font-bold text-slate-800">{selectedCustomer.phone}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-500 shadow-sm">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Endereço</p>
                      <p className="font-bold text-slate-800 truncate">{selectedCustomer.address}</p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedCustomer(null)}
                  className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="py-10 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-400">
                <User className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-medium">Nenhum cliente selecionado</p>
              </div>
            )}
          </div>

          {/* --- Items Table --- */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-500" />
                Produtos ou Serviços
              </h3>
              <div className="relative w-full max-w-xs">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input 
                      placeholder="Pesquisar serviço..."
                      value={itemSearch}
                      onChange={(e) => {
                        setItemSearch(e.target.value);
                        setShowItemResults(true);
                      }}
                      onFocus={() => setShowItemResults(true)}
                      icon={<Search className="w-4 h-4" />}
                      className="py-2"
                    />
                    {showItemResults && filteredItems.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        {filteredItems.map(i => (
                          <button
                            key={i.id}
                            onClick={() => handleAddLine(i)}
                            className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center justify-between group"
                          >
                            <div>
                              <p className="font-bold text-slate-800 group-hover:text-blue-700">{i.name}</p>
                              <p className="text-xs text-slate-500">{formatCurrencyAO(i.price)}</p>
                            </div>
                            <Plus className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => setShowItemResults(!showItemResults)}
                  >
                    Adicionar
                  </Button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto -mx-6 sm:mx-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-100">
                    <th className="text-left py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Produto / Serviço</th>
                    <th className="text-center py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantidade</th>
                    <th className="text-right py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Preço Unitário</th>
                    <th className="text-center py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Desconto %</th>
                    <th className="text-center py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">IVA %</th>
                    <th className="text-right py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtotal</th>
                    <th className="py-4 px-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {items.map((item) => {
                    const lineSubtotal = (item.price * item.quantity) * (1 - item.discount / 100);
                    return (
                      <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-4">
                          <p className="font-bold text-slate-800">{item.name}</p>
                          <input 
                            type="text"
                            value={item.description}
                            onChange={(e) => handleUpdateLine(item.id, { description: e.target.value })}
                            className="text-[10px] text-slate-400 bg-transparent border-none focus:ring-0 p-0 w-full"
                          />
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => handleUpdateLine(item.id, { quantity: Math.max(1, item.quantity - 1) })}
                              className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200"
                            >-</button>
                            <span className="font-bold text-slate-700 w-6 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => handleUpdateLine(item.id, { quantity: item.quantity + 1 })}
                              className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200"
                            >+</button>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <input 
                            type="number"
                            value={item.price}
                            onChange={(e) => handleUpdateLine(item.id, { price: parseFloat(e.target.value) || 0 })}
                            className="w-24 text-right font-bold text-slate-700 bg-transparent border-none focus:ring-0 p-0"
                          />
                        </td>
                        <td className="py-4 px-4 text-center">
                          <input 
                            type="number"
                            value={item.discount}
                            onChange={(e) => handleUpdateLine(item.id, { discount: parseFloat(e.target.value) || 0 })}
                            className="w-12 text-center text-slate-500 bg-transparent border-none focus:ring-0 p-0"
                          />
                        </td>
                        <td className="py-4 px-4 text-center">
                          <input 
                            type="number"
                            value={item.iva}
                            onChange={(e) => handleUpdateLine(item.id, { iva: parseFloat(e.target.value) || 0 })}
                            className="w-12 text-center text-slate-500 bg-transparent border-none focus:ring-0 p-0"
                          />
                        </td>
                        <td className="py-4 px-4 text-right font-black text-slate-800 whitespace-nowrap">
                          {formatCurrencyAO(lineSubtotal)}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button 
                            onClick={() => handleRemoveLine(item.id)}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                            title="Remover item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-20 text-center text-slate-400">
                        <Calculator className="w-12 h-12 mx-auto mb-3 opacity-10" />
                        <p className="font-medium">Nenhum item adicionado à fatura</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* --- Totals Card --- */}
          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl shadow-blue-900/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full -ml-16 -mb-16 blur-3xl" />
            
            <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-8 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Resumo de Valores
            </h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">Subtotal da Fatura</span>
                <span className="font-black">{formatCurrencyAO(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">Descontos</span>
                <span className="font-black text-red-400">-{formatCurrencyAO(totals.totalDiscount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">Total IVA</span>
                <span className="font-black text-blue-400">+{formatCurrencyAO(totals.totalIva)}</span>
              </div>
              <div className="pt-6 border-t border-white/10">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-black text-blue-400 uppercase tracking-widest">Total a Pagar</span>
                  <span className="text-4xl font-black tracking-tighter text-white">{formatCurrencyAO(totals.total)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Forma de Pagamento</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'dinheiro', label: 'Dinheiro', icon: Receipt },
                    { id: 'multicaixa', label: 'Multicaixa', icon: CreditCard },
                    { id: 'transferencia', label: 'Transferência', icon: RefreshCw },
                    { id: 'cartao', label: 'Cartão', icon: CreditCard },
                  ].map(method => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                      className={`flex items-center gap-2 p-3 rounded-xl text-xs font-bold transition-all border ${
                        paymentMethod === method.id 
                          ? 'bg-blue-600 border-blue-500 text-white' 
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <method.icon className="w-4 h-4" />
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Valor Pago</label>
                  <input 
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-black text-white outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Troco</label>
                  <div className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5 text-sm font-black text-emerald-400">
                    {formatCurrencyAO(totals.change)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- Observations --- */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Observações e Notas
            </h3>
            <textarea 
              placeholder="Observações da fatura (visível ao cliente)..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 min-h-[80px] resize-none"
            />
            <textarea 
              placeholder="Notas internas (não visível)..."
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 min-h-[80px] resize-none"
            />
          </div>

          {/* --- Action Buttons --- */}
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="primary" 
              size="lg" 
              className="col-span-2 py-5"
              icon={<CheckCircle2 className="w-6 h-6" />}
              onClick={handleEmit}
            >
              Emitir {docType.replace('_', ' ')}
            </Button>
            <Button 
              variant="outline" 
              icon={<Save className="w-5 h-5" />}
              onClick={() => {
                setDocType('proforma');
                handleEmit();
              }}
            >
              Proforma
            </Button>
            <Button 
              variant="outline" 
              icon={<Printer className="w-5 h-5" />}
              onClick={handleEmit}
            >
              Imprimir
            </Button>
            <Button 
              variant="ghost" 
              className="col-span-2 text-slate-400"
              onClick={handleClear}
            >
              Limpar Formulário
            </Button>
          </div>
        </div>
      </div>

      {/* --- Modals --- */}
      <Modal 
        isOpen={showPendingOrders} 
        onClose={() => setShowPendingOrders(false)}
        title="Pedidos Pendentes de Facturação"
        size="lg"
      >
        <div className="space-y-4">
          {pendingOrders.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-10" />
              <p className="font-medium">Não existem pedidos pendentes para facturar.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {pendingOrders.map(order => {
                const customer = customers.find(c => c.id === order.customerId);
                return (
                  <div 
                    key={order.id} 
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-blue-200 hover:bg-blue-50 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-black text-blue-600 uppercase tracking-widest">#{order.id.slice(0, 8)}</span>
                        <span className="px-2 py-0.5 bg-white text-slate-500 rounded text-[10px] font-black uppercase tracking-widest border border-slate-100">
                          {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}
                        </span>
                      </div>
                      <p className="font-bold text-slate-800">{customer?.name || 'Cliente Desconhecido'}</p>
                      <p className="text-xs text-slate-500">{order.items.length} itens • Total: <span className="font-bold text-slate-700">{formatCurrencyAO(order.total)}</span></p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleLoadOrder(order)}
                      icon={<Receipt className="w-4 h-4" />}
                    >
                      Facturar
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>

      <Modal 
        isOpen={isCustomerModalOpen} 
        onClose={() => setIsCustomerModalOpen(false)}
        title={editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
      >
        <form onSubmit={handleSaveCustomer} className="space-y-6">
          <Input name="name" label="Nome Completo" defaultValue={editingCustomer?.name} required />
          <Input name="phone" label="Telefone" defaultValue={editingCustomer?.phone} required />
          <Input name="address" label="Endereço" defaultValue={editingCustomer?.address} />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" type="button" onClick={() => setIsCustomerModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Salvar Cliente</Button>
          </div>
        </form>
      </Modal>

      {showPreview && emittedInvoice && (
        <Invoice 
          order={{
            id: emittedInvoice.id,
            customerId: emittedInvoice.customer.id,
            items: emittedInvoice.items.map((i: any) => ({
              itemId: i.itemId,
              quantity: i.quantity,
              priceAtTime: i.price
            })),
            status: 'delivered',
            total: emittedInvoice.totals.total,
            createdAt: emittedInvoice.createdAt,
            updatedAt: emittedInvoice.createdAt,
            expectedDelivery: emittedInvoice.createdAt,
            paymentStatus: emittedInvoice.type === 'proforma' ? 'unpaid' : 'paid'
          }}
          customer={emittedInvoice.customer}
          laundryItems={laundryItems}
          settings={settings}
          onClose={() => setShowPreview(false)}
          type={emittedInvoice.type}
          operator={emittedInvoice.operator}
          paymentMethod={emittedInvoice.paymentMethod}
          observations={emittedInvoice.observations}
          totals={emittedInvoice.totals}
        />
      )}
    </div>
  );
};
