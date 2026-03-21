import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Trash2, 
  Eye,
  CheckCircle2,
  AlertCircle,
  Receipt,
  ShoppingBag,
  Printer,
  Pencil,
  FileDown,
  User as UserIcon
} from 'lucide-react';
import { Order, Customer, LaundryItem, OrderItem, LaundrySettings } from '../types';
import { STATUS_COLORS, STATUS_LABELS } from '../constants';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Invoice } from './Invoice';
import { formatCurrencyAO } from '../lib/format';
import { loadPdfWithAutoTable } from '../lib/pdf';

interface OrdersProps {
  orders: Order[];
  customers: Customer[];
  laundryItems: LaundryItem[];
  settings: LaundrySettings;
  userRole: 'admin' | 'cashier';
  onAddOrder: (order: Order) => void;
  onUpdateOrder: (order: Order) => void;
  onUpdateStatus: (orderId: string, status: Order['status']) => void;
  onDeleteOrder: (orderId: string) => void;
}

export const Orders: React.FC<OrdersProps> = ({ 
  orders, 
  customers, 
  laundryItems,
  settings,
  userRole,
  onAddOrder, 
  onUpdateOrder,
  onUpdateStatus,
  onDeleteOrder
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [shouldAutoDownload, setShouldAutoDownload] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>('all');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedItems, setSelectedItems] = useState<{ itemId: string, quantity: number }[]>([]);

  const filteredOrders = orders.filter(order => {
    const customer = customers.find(c => c.id === order.customerId);
    const matchesSearch = customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddItem = (itemId: string) => {
    const existing = selectedItems.find(i => i.itemId === itemId);
    if (existing) {
      setSelectedItems(selectedItems.map(i => 
        i.itemId === itemId ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setSelectedItems([...selectedItems, { itemId, quantity: 1 }]);
    }
  };

  const calculateTotal = () => {
    return selectedItems.reduce((acc, si) => {
      const item = laundryItems.find(i => i.id === si.itemId);
      return acc + (item?.price || 0) * si.quantity;
    }, 0);
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setSelectedCustomer(order.customerId);
    setSelectedItems(order.items.map(i => ({ itemId: i.itemId, quantity: i.quantity })));
    setIsModalOpen(true);
  };

  const handlePrintOrder = (order: Order) => {
    setCompletedOrder(order);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || selectedItems.length === 0) return;

    if (editingOrder) {
      const updatedOrder: Order = {
        ...editingOrder,
        customerId: selectedCustomer,
        items: selectedItems.map(si => ({
          itemId: si.itemId,
          quantity: si.quantity,
          priceAtTime: laundryItems.find(i => i.id === si.itemId)?.price || 0
        })),
        total: calculateTotal(),
        updatedAt: new Date().toISOString(),
      };
      onUpdateOrder(updatedOrder);
    } else {
      const newOrder: Order = {
        id: Math.random().toString(36).substr(2, 9),
        customerId: selectedCustomer,
        items: selectedItems.map(si => ({
          itemId: si.itemId,
          quantity: si.quantity,
          priceAtTime: laundryItems.find(i => i.id === si.itemId)?.price || 0
        })),
        status: 'pending',
        total: calculateTotal(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expectedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        paymentStatus: 'unpaid'
      };
      onAddOrder(newOrder);
    }

    setIsModalOpen(false);
    setEditingOrder(null);
    setSelectedCustomer('');
    setSelectedItems([]);
  };

  const handleExportPDF = async () => {
    try {
      const { jsPDF, autoTable } = await loadPdfWithAutoTable();
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text('Relatório de Pedidos - Lavandaria', 14, 22);
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 30);

      const tableData = filteredOrders.map(order => {
        const customer = customers.find(c => c.id === order.customerId);
        return [
          order.id.slice(0, 8).toUpperCase(),
          customer?.name || 'N/A',
          format(new Date(order.createdAt), 'dd/MM/yyyy'),
          STATUS_LABELS[order.status],
          formatCurrencyAO(order.total)
        ];
      });

      autoTable(doc, {
        startY: 40,
        head: [['ID', 'Cliente', 'Data', 'Status', 'Total']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] },
      });

      doc.save(`relatorio-pedidos-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Falha ao exportar PDF.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestão de Pedidos</h2>
          <p className="text-slate-500">Acompanhe e gerencie todos os serviços da lavandaria.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-200"
        >
          <Plus className="w-5 h-5" />
          Novo Pedido
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por cliente ou ID..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">Todos os Status</option>
            {Object.entries(STATUS_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all font-medium"
          >
            <FileDown className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredOrders.map((order) => {
          const customer = customers.find(c => c.id === order.customerId);
          return (
            <div key={order.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                    <Receipt className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider">#{order.id.slice(0, 8)}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${STATUS_COLORS[order.status]}`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-lg">{customer?.name}</h4>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Entrega prevista: {format(new Date(order.expectedDelivery), 'dd/MM/yyyy')}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <UserIcon className="w-3 h-3" />
                      {order.createdByUserRole === 'cashier' ? 'Caixa' : 'Operador'}: {order.createdByUserName || 'Sistema'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-8">
                  <div className="text-center lg:text-right">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Itens</p>
                    <p className="font-bold text-slate-700">{order.items.reduce((acc, i) => acc + i.quantity, 0)} peças</p>
                  </div>
                  <div className="text-center lg:text-right">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total</p>
                    <p className="font-bold text-blue-600 text-xl">{formatCurrencyAO(order.total)}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-auto lg:ml-0">
                    <select 
                      value={order.status}
                      onChange={(e) => onUpdateStatus(order.id, e.target.value as Order['status'])}
                      className="text-sm border border-slate-200 bg-white rounded-lg px-3 py-2 text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50 disabled:cursor-not-allowed"
                    >
                      {Object.entries(STATUS_LABELS).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                    
                    <button 
                      onClick={() => handlePrintOrder(order)}
                      className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                      title="Imprimir Fatura"
                    >
                      <Printer className="w-5 h-5" />
                    </button>

                    <button 
                      onClick={() => {
                        setCompletedOrder(order);
                        setShouldAutoDownload(true);
                      }}
                      className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                      title="Descarregar PDF"
                    >
                      <FileDown className="w-5 h-5" />
                    </button>
                    
                    {userRole === 'admin' && (
                      <>
                        <button 
                          onClick={() => handleEditOrder(order)}
                          className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => onDeleteOrder(order.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Excluir"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filteredOrders.length === 0 && (
          <div className="bg-white py-20 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
            <Receipt className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-medium">Nenhum pedido encontrado.</p>
          </div>
        )}
      </div>

      {/* Invoice View */}
      {completedOrder && (
        <Invoice 
          order={completedOrder}
          customer={customers.find(c => c.id === completedOrder.customerId)!}
          laundryItems={laundryItems}
          settings={settings}
          onClose={() => {
            setCompletedOrder(null);
            setShouldAutoDownload(false);
          }}
          autoDownload={shouldAutoDownload || settings.autoDownloadPDF}
        />
      )}

      {/* New Order Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-0 sm:p-4 overflow-y-auto"
          onClick={() => {
            setIsModalOpen(false);
            setEditingOrder(null);
            setSelectedCustomer('');
            setSelectedItems([]);
          }}
        >
          <div
            className="bg-white w-full max-w-lg sm:rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col min-h-screen sm:min-h-0 my-0 sm:my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0 z-10">
              <h3 className="text-lg sm:text-xl font-bold text-slate-800">
                {editingOrder ? 'Editar Pedido' : 'Novo Pedido de Lavandaria'}
              </h3>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingOrder(null);
                  setSelectedCustomer('');
                  setSelectedItems([]);
                }} 
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <Plus className="w-6 h-6 rotate-45 text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Selecionar Cliente</label>
                  <select 
                    required
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm sm:text-base"
                  >
                    <option value="">Escolha um cliente...</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                    ))}
                  </select>
                </div>

                {editingOrder && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Status do Pedido</label>
                    <select 
                      value={editingOrder.status}
                      onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value as Order['status'] })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm sm:text-base"
                    >
                      {Object.entries(STATUS_LABELS).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-4">
                  <label className="text-sm font-semibold text-slate-700">Tabela de Preços</label>
                  <div className="grid grid-cols-1 gap-2 max-h-48 sm:max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {laundryItems.map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleAddItem(item.id)}
                        className="flex items-center justify-between p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl transition-all group"
                      >
                        <div className="text-left">
                          <p className="text-sm font-bold text-slate-700 group-hover:text-blue-700">{item.name}</p>
                          <p className="text-xs text-slate-500">{formatCurrencyAO(item.price)}</p>
                        </div>
                        <Plus className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-semibold text-slate-700">Itens Selecionados</label>
                  <div className="bg-slate-50 rounded-2xl p-4 min-h-[12rem] sm:min-h-[15rem] flex flex-col">
                    {selectedItems.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center py-8">
                        <ShoppingBag className="w-8 h-8 mb-2 opacity-20" />
                        <p className="text-xs">Nenhum item adicionado</p>
                      </div>
                    ) : (
                      <div className="space-y-2 flex-1 overflow-y-auto max-h-48 sm:max-h-60">
                        {selectedItems.map(si => {
                          const item = laundryItems.find(i => i.id === si.itemId);
                          return (
                            <div key={si.itemId} className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-100">
                              <div className="text-xs pr-2">
                                <p className="font-bold text-slate-700 truncate max-w-[120px] sm:max-w-none">{item?.name}</p>
                                <p className="text-slate-500">{si.quantity}x {formatCurrencyAO(item?.price || 0)}</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button 
                                  type="button"
                                  onClick={() => {
                                    if (si.quantity > 1) {
                                      setSelectedItems(selectedItems.map(i => i.itemId === si.itemId ? { ...i, quantity: i.quantity - 1 } : i));
                                    } else {
                                      setSelectedItems(selectedItems.filter(i => i.itemId !== si.itemId));
                                    }
                                  }}
                                  className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200"
                                >-</button>
                                <span className="text-xs font-bold w-4 text-center">{si.quantity}</span>
                                <button 
                                  type="button"
                                  onClick={() => handleAddItem(si.itemId)}
                                  className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200"
                                >+</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <div className="mt-4 pt-4 border-t border-slate-200 sticky bottom-0 bg-slate-50">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-bold text-slate-600">Total</span>
                        <span className="text-xl font-bold text-blue-600">{formatCurrencyAO(calculateTotal())}</span>
                      </div>
                      <button 
                        type="submit"
                        disabled={!selectedCustomer || selectedItems.length === 0}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-100 text-sm sm:text-base"
                      >
                        {editingOrder ? 'Salvar Alterações' : 'Finalizar Pedido'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
