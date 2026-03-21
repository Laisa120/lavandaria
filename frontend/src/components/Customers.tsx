import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Phone, 
  MapPin, 
  Trash2, 
  Edit2,
  UserPlus,
  User as UserIcon,
  Users,
  History,
  Receipt,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Customer, Order, LaundryItem } from '../types';
import { STATUS_COLORS, STATUS_LABELS } from '../constants';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrencyAO } from '../lib/format';
import { loadPdfWithAutoTable } from '../lib/pdf';

interface CustomersProps {
  customers: Customer[];
  orders: Order[];
  laundryItems: LaundryItem[];
  onAddCustomer: (customer: Customer) => Promise<Customer>;
  onUpdateCustomer: (customer: Customer) => Promise<Customer>;
  onDeleteCustomer: (customerId: string) => Promise<void>;
}

export const Customers: React.FC<CustomersProps> = ({ 
  customers, 
  orders,
  laundryItems,
  onAddCustomer, 
  onUpdateCustomer,
  onDeleteCustomer 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [historyCustomer, setHistoryCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  const handleEditClick = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      address: customer.address
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
    setFormData({ name: '', phone: '', address: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCustomer) {
        const updatedCustomer: Customer = {
          ...editingCustomer,
          ...formData
        };
        await onUpdateCustomer(updatedCustomer);
      } else {
        const customer: Customer = {
          id: '',
          ...formData,
          email: '',
          createdAt: new Date().toISOString()
        };
        await onAddCustomer(customer);
      }

      handleCloseModal();
    } catch {
      // Error message is handled at App level.
    }
  };

  const handleDelete = async (customerId: string) => {
    try {
      await onDeleteCustomer(customerId);
    } catch {
      // Error message is handled at App level.
    }
  };

  const handleExportPDF = async () => {
    try {
      const { jsPDF, autoTable } = await loadPdfWithAutoTable();
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text('Base de Clientes - Lavandaria', 14, 22);
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 30);

      const tableData = filteredCustomers.map(c => [
        c.name,
        c.phone,
        c.address,
        format(new Date(c.createdAt), 'dd/MM/yyyy')
      ]);

      autoTable(doc, {
        startY: 40,
        head: [['Nome', 'Telefone', 'Endereço', 'Desde']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] },
      });

      doc.save(`clientes-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Falha ao exportar PDF.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Base de Clientes</h2>
          <p className="text-slate-500">Gerencie as informações de contato dos seus clientes.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-200"
        >
          <UserPlus className="w-5 h-5" />
          Novo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou telefone..." 
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={handleExportPDF}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all font-medium"
        >
          Exportar PDF
        </button>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center text-blue-600 font-bold text-xl">
                {customer.name.charAt(0)}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleEditClick(customer)}
                  className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(customer.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-slate-800 mb-4">{customer.name}</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{customer.phone}</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                <span className="line-clamp-2">{customer.address}</span>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Desde {format(new Date(customer.createdAt), 'MMM yyyy', { locale: ptBR })}
              </span>
              <button 
                onClick={() => setHistoryCustomer(customer)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <History className="w-3 h-3" />
                Ver Histórico
              </button>
            </div>
          </div>
        ))}
        {filteredCustomers.length === 0 && (
          <div className="col-span-full bg-white py-20 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
            <Users className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-medium">Nenhum cliente encontrado.</p>
          </div>
        )}
      </div>

      {/* History Modal */}
      {historyCustomer && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={() => setHistoryCustomer(null)}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  {historyCustomer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Histórico de Pedidos</h3>
                  <p className="text-xs text-slate-500">{historyCustomer.name}</p>
                </div>
              </div>
              <button onClick={() => setHistoryCustomer(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <Plus className="w-6 h-6 rotate-45 text-slate-500" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {orders.filter(o => o.customerId === historyCustomer.id).length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                  <Receipt className="w-12 h-12 mb-4 opacity-20" />
                  <p className="font-medium">Este cliente ainda não possui pedidos.</p>
                </div>
              ) : (
                orders
                  .filter(o => o.customerId === historyCustomer.id)
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map(order => (
                    <div key={order.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">#{order.id.slice(0, 8)}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${STATUS_COLORS[order.status]}`}>
                            {STATUS_LABELS[order.status]}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 font-medium">
                          {format(new Date(order.createdAt), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        {order.items.map((item, idx) => {
                          const laundryItem = laundryItems.find(li => li.id === item.itemId);
                          return (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-slate-600">{item.quantity}x {laundryItem?.name || 'Item desconhecido'}</span>
                              <span className="font-medium text-slate-800">{formatCurrencyAO(item.quantity * item.priceAtTime)}</span>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                            <Clock className="w-3 h-3" />
                            Entrega: {format(new Date(order.expectedDelivery), 'dd/MM/yy')}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase">
                            <UserIcon className="w-3 h-3" />
                            {order.createdByUserRole === 'cashier' ? 'Caixa' : 'Operador'}: {order.createdByUserName || 'Sistema'}
                          </div>
                          <div className={`flex items-center gap-1 text-[10px] font-bold uppercase ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                            {order.paymentStatus === 'paid' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            {order.paymentStatus === 'paid' ? 'Pago' : 'Pendente'}
                          </div>
                        </div>
                        <span className="text-lg font-bold text-blue-600">{formatCurrencyAO(order.total)}</span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* New/Edit Customer Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800">
                {editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
              </h3>
              <button onClick={handleCloseModal} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <Plus className="w-6 h-6 rotate-45 text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Nome Completo</label>
                <input 
                  required
                  minLength={3}
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Ex: João Silva"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Telefone</label>
                <input 
                  required
                  type="tel" 
                  pattern="^\+?[0-9\s\-]{9,15}$"
                  title="Insira um número de telefone válido (9 a 15 dígitos)"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="+351 910 000 000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Endereço</label>
                <textarea 
                  required
                  minLength={5}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[100px]"
                  placeholder="Rua, Número, Cidade..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              
              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-100 mt-4"
              >
                {editingCustomer ? 'Salvar Alterações' : 'Cadastrar Cliente'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
