import { AlertTriangle, ShieldCheck } from 'lucide-react';
import type { StockAlertItem } from '../../../types/stock';

interface StockAlertsProps {
  alerts: StockAlertItem[];
}

export function StockAlerts({ alerts }: StockAlertsProps) {
  return (
    <section className="card-modern overflow-hidden">
      <div className="border-b border-slate-100 p-6">
        <h2 className="text-lg font-bold text-slate-800">Alertas de stock</h2>
        <p className="text-sm text-slate-500">Identifique rapidamente os produtos que precisam de reposição.</p>
      </div>

      {alerts.length === 0 ? (
        <div className="p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <p className="mt-4 text-sm font-medium text-slate-700">Tudo sob controlo.</p>
          <p className="mt-1 text-sm text-slate-500">Nenhum produto está abaixo da quantidade mínima.</p>
        </div>
      ) : (
        <div className="space-y-3 p-6">
          {alerts.map((item) => (
            <div key={item.id} className="rounded-2xl border border-red-200 bg-red-50/80 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-semibold text-red-900">{item.name}</p>
                    <span className="text-xs font-bold uppercase tracking-wide text-red-700">{item.category}</span>
                  </div>
                  <p className="mt-1 text-sm text-red-800">
                    Atual: {item.quantityCurrent} {item.unit} | Mínimo: {item.quantityMinimum} {item.unit}
                  </p>
                  <p className="mt-1 text-sm text-red-700">
                    Faltam {item.shortageQuantity} {item.unit} para atingir o nível mínimo.
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
