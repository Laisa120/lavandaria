import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Order, Customer } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrencyAO } from '../lib/format';

interface DashboardProps {
  orders: Order[];
  customers: Customer[];
}

const loadDashboardCharts = () => import('./DashboardCharts');
const DashboardCharts = lazy(() => loadDashboardCharts().then((m) => ({ default: m.DashboardCharts })));

export const Dashboard: React.FC<DashboardProps> = ({ orders, customers }) => {
  const chartsRef = useRef<HTMLDivElement | null>(null);
  const [shouldRenderCharts, setShouldRenderCharts] = useState(false);

  useEffect(() => {
    if (!chartsRef.current || shouldRenderCharts) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        setShouldRenderCharts(true);
        observer.disconnect();
      },
      { root: null, rootMargin: '160px 0px', threshold: 0.1 },
    );

    observer.observe(chartsRef.current);
    return () => observer.disconnect();
  }, [shouldRenderCharts]);

  useEffect(() => {
    if (shouldRenderCharts) return;

    let timeoutId: number | null = null;
    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback, opts?: IdleRequestOptions) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    if (typeof idleWindow.requestIdleCallback === 'function') {
      const idleId = idleWindow.requestIdleCallback(() => {
        void loadDashboardCharts();
      }, { timeout: 1800 });

      return () => {
        if (typeof idleWindow.cancelIdleCallback === 'function') {
          idleWindow.cancelIdleCallback(idleId);
        }
      };
    }

    timeoutId = window.setTimeout(() => {
      void loadDashboardCharts();
    }, 1200);

    return () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [shouldRenderCharts]);

  const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;

  const stats = [
    { 
      label: 'Receita Total', 
      value: formatCurrencyAO(totalRevenue), 
      icon: TrendingUp, 
      color: 'bg-emerald-50 text-emerald-600',
      trend: '+12.5%',
      trendUp: true
    },
    { 
      label: 'Total de Pedidos', 
      value: orders.length.toString(), 
      icon: ShoppingBag, 
      color: 'bg-blue-50 text-blue-600',
      trend: '+5.2%',
      trendUp: true
    },
    { 
      label: 'Clientes Ativos', 
      value: customers.length.toString(), 
      icon: Users, 
      color: 'bg-purple-50 text-purple-600',
      trend: '+2.1%',
      trendUp: true
    },
    { 
      label: 'Pedidos Pendentes', 
      value: pendingOrders.toString(), 
      icon: Clock, 
      color: 'bg-orange-50 text-orange-600',
      trend: '-1.4%',
      trendUp: false
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="card-modern p-6">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${stat.trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trend}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div ref={chartsRef}>
        {shouldRenderCharts ? (
          <Suspense
            fallback={
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card-modern p-6 h-96 animate-pulse bg-slate-50" />
                <div className="card-modern p-6 h-96 animate-pulse bg-slate-50" />
              </div>
            }
          >
            <DashboardCharts />
          </Suspense>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card-modern p-6 h-96 animate-pulse bg-slate-50" />
            <div className="card-modern p-6 h-96 animate-pulse bg-slate-50" />
          </div>
        )}
      </div>

      {/* Recent Orders Table */}
      <div className="card-modern overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Pedidos Recentes</h3>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700">Ver todos</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.slice(0, 5).map((order) => {
                const customer = customers.find(c => c.id === order.customerId);
                return (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm text-slate-600">#{order.id.slice(0, 8)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                          {customer?.name.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-700">{customer?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {format(new Date(order.createdAt), 'dd MMM, yyyy', { locale: ptBR })}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{formatCurrencyAO(order.total)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        order.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                        order.status === 'processing' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        order.status === 'ready' ? 'bg-green-50 text-green-700 border-green-100' :
                        'bg-slate-50 text-slate-700 border-slate-100'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                    Nenhum pedido encontrado.
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
