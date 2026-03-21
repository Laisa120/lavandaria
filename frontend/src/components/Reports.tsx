import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Package
} from 'lucide-react';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Order, Customer, LaundryItem, UserRole } from '../types';
import { formatCurrencyAO } from '../lib/format';
import { loadPdfWithAutoTable } from '../lib/pdf';

interface ReportsProps {
  orders: Order[];
  customers: Customer[];
  laundryItems: LaundryItem[];
  userRole: UserRole;
  currentUserId: string;
}

type ReportType = 'daily' | 'weekly' | 'monthly' | 'yearly';
type OperatorOption = { id: string; name: string; role: UserRole | null };

export const Reports: React.FC<ReportsProps> = ({ orders, customers, laundryItems, userRole, currentUserId }) => {
  const [reportType, setReportType] = useState<ReportType>('daily');
  const [operatorFilter, setOperatorFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const isCashier = userRole === 'cashier';
  const hasCustomRange = !!startDate && !!endDate;
  const isDateRangeInvalid = hasCustomRange && new Date(startDate).getTime() > new Date(endDate).getTime();
  const getSellerRoleLabel = (role?: UserRole | null) => {
    if (role === 'admin') return 'ADMIN';
    if (role === 'cashier') return 'CAIXA';
    return 'SISTEMA';
  };

  const operatorOptions: OperatorOption[] = Array.from(
    new Map(
      orders
        .filter((order) => order.createdByUserId && order.createdByUserName)
        .map((order) => [
          order.createdByUserId as string,
          {
            id: order.createdByUserId as string,
            name: order.createdByUserName as string,
            role: order.createdByUserRole ?? null,
          },
        ]),
    ).values() as Iterable<OperatorOption>,
  ).sort((a, b) => a.name.localeCompare(b.name));

  const getFilteredOrders = (type: ReportType) => {
    if (isDateRangeInvalid) return [];

    const now = new Date();
    const start = hasCustomRange
      ? startOfDay(new Date(`${startDate}T00:00:00`))
      : type === 'daily'
        ? startOfDay(now)
        : type === 'weekly'
          ? startOfWeek(now, { weekStartsOn: 1 })
          : type === 'monthly'
            ? startOfMonth(now)
            : startOfYear(now);
    const end = hasCustomRange
      ? endOfDay(new Date(`${endDate}T23:59:59`))
      : type === 'daily'
        ? endOfDay(now)
        : type === 'weekly'
          ? endOfWeek(now, { weekStartsOn: 1 })
          : type === 'monthly'
            ? endOfMonth(now)
            : endOfYear(now);

    return orders.filter(order => {
      const orderDate = parseISO(order.createdAt);
      const inPeriod = isWithinInterval(orderDate, { start, end });

      if (!inPeriod) return false;
      if (!isCashier) {
        if (operatorFilter === 'all') return true;
        return order.createdByUserId === operatorFilter;
      }

      return order.createdByUserId === currentUserId && order.createdByUserRole === 'cashier';
    });
  };

  const generatePDF = async (type: ReportType) => {
    setIsGenerating(true);
    try {
      const { jsPDF, autoTable } = await loadPdfWithAutoTable();
      const filteredOrders = getFilteredOrders(type);
      const totalRevenue = filteredOrders.reduce((acc, order) => acc + order.total, 0);
      const totalOrders = filteredOrders.length;
      const paidOrders = filteredOrders.filter(o => o.paymentStatus === 'paid').length;

      const doc = new jsPDF();
      const title = hasCustomRange
        ? `Relatório de ${format(new Date(`${startDate}T00:00:00`), 'dd/MM/yyyy')} até ${format(new Date(`${endDate}T00:00:00`), 'dd/MM/yyyy')}`
        : `Relatório ${type === 'daily' ? 'Diário' : type === 'weekly' ? 'Semanal' : type === 'monthly' ? 'Mensal' : 'Anual'}`;
      const dateStr = format(new Date(), "dd/MM/yyyy HH:mm");

      doc.setFontSize(20);
      doc.setTextColor(30, 41, 59);
      doc.text('Sistema de Lavandaria GenOmni', 14, 22);
      doc.setFontSize(14);
      doc.setTextColor(71, 85, 105);
      doc.text(title, 14, 32);
      doc.setFontSize(10);
      doc.text(`Gerado em: ${dateStr}`, 14, 40);

      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 48, 182, 30, 3, 3, 'FD');
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text(`Total de Pedidos: ${totalOrders}`, 20, 58);
      doc.text(`Pedidos Pagos: ${paidOrders}`, 20, 66);
      doc.text(`Receita Total: ${formatCurrencyAO(totalRevenue)}`, 120, 58);

      const tableData = filteredOrders.map(order => {
        const customer = customers.find(c => c.id === order.customerId);
        const baseRow = [
          order.id,
          customer?.name || 'N/A',
          format(parseISO(order.createdAt), 'dd/MM/yyyy HH:mm'),
          order.status.toUpperCase(),
          order.paymentStatus === 'paid' ? 'PAGO' : 'PENDENTE',
        ];

        if (!isCashier) {
          baseRow.push(order.createdByUserName || 'Sistema');
          baseRow.push(getSellerRoleLabel(order.createdByUserRole));
        }

        baseRow.push(formatCurrencyAO(order.total));
        return baseRow;
      });

      autoTable(doc, {
        startY: 85,
        head: [isCashier
          ? ['ID', 'Cliente', 'Data', 'Status', 'Pagamento', 'Total']
          : ['ID', 'Cliente', 'Data', 'Status', 'Pagamento', 'Vendedor', 'Perfil', 'Total']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] },
        styles: { fontSize: 9 },
      });

      doc.save(`relatorio_${type}_${format(new Date(), 'yyyyMMdd')}.pdf`);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Falha ao gerar relatório PDF.');
    } finally {
      setIsGenerating(false);
    }
  };

  const currentType = isCashier ? 'daily' : reportType;
  const filteredCurrentOrders = getFilteredOrders(currentType);
  const currentRevenue = filteredCurrentOrders.reduce((acc, order) => acc + order.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{isCashier ? 'Relatório Diário de Caixa' : 'Relatórios Financeiros'}</h2>
          <p className="text-slate-500">
            {isCashier
              ? 'Gere e exporte o relatório diário para envio ao administrador.'
              : 'Acompanhe o desempenho da sua lavandaria em diferentes períodos.'}
          </p>
        </div>
      </div>

      {/* Report Type Selector */}
      {!isCashier && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: 'daily', label: 'Diário', icon: Calendar },
              { id: 'weekly', label: 'Semanal', icon: TrendingUp },
              { id: 'monthly', label: 'Mensal', icon: FileText },
              { id: 'yearly', label: 'Anual', icon: Package },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setReportType(type.id as ReportType)}
                className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-3 ${
                  reportType === type.id
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'bg-white border-slate-100 text-slate-600 hover:border-blue-200 hover:bg-blue-50/30'
                }`}
              >
                <type.icon className={`w-6 h-6 ${reportType === type.id ? 'text-white' : 'text-blue-500'}`} />
                <span className="font-bold text-sm">{type.label}</span>
              </button>
            ))}
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Filtrar por Caixa/Operador
                </label>
                <select
                  value={operatorFilter}
                  onChange={(e) => setOperatorFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="all">Todos</option>
                  {operatorOptions.map((operator) => (
                    <option key={operator.id} value={operator.id}>
                      {operator.name} ({getSellerRoleLabel(operator.role)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Data início
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Data fim
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                    }}
                    className="px-3 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-100"
                  >
                    Limpar
                  </button>
                </div>
              </div>
            </div>
            {isDateRangeInvalid && (
              <p className="mt-3 text-xs font-semibold text-red-600">
                Intervalo inválido: a data início deve ser menor ou igual à data fim.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Receita no Período</p>
              <p className="text-2xl font-bold text-slate-800">{formatCurrencyAO(currentRevenue)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total de Pedidos</p>
              <p className="text-2xl font-bold text-slate-800">{filteredCurrentOrders.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center">
          <button 
            onClick={() => generatePDF(currentType)}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-900 text-white py-4 rounded-xl font-bold transition-all shadow-lg disabled:opacity-50"
          >
            {isGenerating ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Download className="w-5 h-5" />
                {isCashier ? 'Exportar Relatório Diário' : 'Baixar Relatório PDF'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Recent Activity in Period */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Detalhamento do Período</h3>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {filteredCurrentOrders.length} registros encontrados
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente</th>
                {!isCashier && <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Caixa/Operador</th>}
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
            {filteredCurrentOrders.map((order) => {
                const customer = customers.find(c => c.id === order.customerId);
                return (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">#{order.id}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-800">{customer?.name || 'N/A'}</p>
                    </td>
                    {!isCashier && (
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">
                        <div className="flex items-center gap-2">
                          <span>{order.createdByUserName || 'Sistema'}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                            {getSellerRoleLabel(order.createdByUserRole)}
                          </span>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {format(parseISO(order.createdAt), 'dd MMM, HH:mm', { locale: ptBR })}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">{formatCurrencyAO(order.total)}</td>
                  </tr>
                );
              })}
              {filteredCurrentOrders.length === 0 && (
                <tr>
                  <td colSpan={isCashier ? 4 : 5} className="px-6 py-12 text-center text-slate-400">
                    Nenhum pedido encontrado neste período.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
