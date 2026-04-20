import { AlertTriangle, Boxes } from 'lucide-react';
import type { StockMetrics } from '../../../types/stock';

interface StockOverviewWidgetProps {
  metrics: StockMetrics;
}

export function StockOverviewWidget({ metrics }: StockOverviewWidgetProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="card-modern p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Total de produtos</p>
            <p className="mt-1 text-3xl font-bold text-slate-800">{metrics.totalProducts}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef8ff] text-[#0e2a47]">
            <Boxes className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="card-modern p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Stock baixo</p>
            <p className="mt-1 text-3xl font-bold text-slate-800">{metrics.lowStockProducts}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
