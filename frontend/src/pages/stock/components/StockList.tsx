import { AlertTriangle, Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import type { StockResolvedItem } from '../../../types/stock';
import { getStockState, isStockCritical } from '../../../types/stock';

interface StockListProps {
  items: StockResolvedItem[];
  loading?: boolean;
  onAdd: () => void;
  onEdit: (item: StockResolvedItem) => void;
  onDelete: (item: StockResolvedItem) => void;
}

export function StockList({ items, loading, onAdd, onEdit, onDelete }: StockListProps) {
  const [filter, setFilter] = useState<'all' | 'critical' | 'low'>('all');

  const filteredItems = useMemo(() => {
    if (filter === 'critical') {
      return items.filter((item) => isStockCritical(item));
    }

    if (filter === 'low') {
      return items.filter((item) => !isStockCritical(item) && getStockState(item) === 'low');
    }

    return items;
  }, [filter, items]);

  if (loading) {
    return (
      <div className="card-modern p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 rounded bg-slate-100" />
          <div className="h-12 rounded-xl bg-slate-100" />
          <div className="h-12 rounded-xl bg-slate-100" />
          <div className="h-12 rounded-xl bg-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Produtos em estoque</h2>
          <p className="text-sm text-slate-500">Cadastro simples, controlo manual e atualização automática pelas vendas.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                filter === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setFilter('critical')}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                filter === 'critical' ? 'bg-red-100 text-red-700 shadow-sm' : 'text-slate-500'
              }`}
            >
              Críticos
            </button>
            <button
              type="button"
              onClick={() => setFilter('low')}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                filter === 'low' ? 'bg-amber-100 text-amber-700 shadow-sm' : 'text-slate-500'
              }`}
            >
              Baixos
            </button>
          </div>
          <Button icon={<Plus className="h-4 w-4" />} onClick={onAdd}>
            Cadastrar produto
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef8ff] text-[#0e2a47]">
            <Plus className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-800">Ainda não existem produtos em estoque</h3>
          <p className="mt-2 text-sm text-slate-500">
            Crie o primeiro item para começar a controlar entradas, saídas e alertas.
          </p>
          <div className="mt-6">
            <Button icon={<Plus className="h-4 w-4" />} onClick={onAdd}>
              Criar primeiro produto
            </Button>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-10 text-center text-slate-500">
          Nenhum produto encontrado para o filtro selecionado.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/60">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Nome</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Ligação</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Disponível</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Mínimo</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Estado</th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => {
                const state = getStockState(item);
                const low = state === 'low';
                const critical = isStockCritical(item);

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors hover:bg-slate-50/40 ${
                      critical ? 'bg-red-50/60' : low ? 'bg-amber-50/40' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className={`font-semibold ${critical ? 'text-red-800' : 'text-slate-800'}`}>{item.name}</p>
                        <p className="text-xs text-slate-500">{item.category} • Base: {item.quantityCurrent} {item.unit}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600">
                        <p className="font-medium text-slate-700">{item.linkedServiceName || 'Manual'}</p>
                        <p className="text-xs text-slate-500">
                          {item.linkedServiceName ? `Consome ${item.consumptionPerService ?? 1} por venda` : 'Sem automação'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className={`font-bold ${critical ? 'text-red-700' : low ? 'text-amber-700' : 'text-slate-800'}`}>
                          {item.quantityAvailable} {item.unit}
                        </p>
                        {item.automaticOutputQuantity > 0 ? (
                          <p className={`text-xs ${critical ? 'text-red-600' : 'text-amber-600'}`}>Auto: -{item.automaticOutputQuantity}</p>
                        ) : (
                          <p className="text-xs text-slate-400">Sem saída automática</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {item.quantityMinimum} {item.unit}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
                          critical
                            ? 'border-red-300 bg-red-100 text-red-800'
                            : low
                            ? 'border-amber-200 bg-amber-50 text-amber-700'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {(low || critical) ? <AlertTriangle className="h-3.5 w-3.5" /> : null}
                        {critical ? 'Crítico' : low ? 'Estoque baixo' : 'Normal'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" icon={<Pencil className="h-4 w-4" />} onClick={() => onEdit(item)}>
                          Editar
                        </Button>
                        <Button variant="ghost" size="sm" icon={<Trash2 className="h-4 w-4" />} onClick={() => onDelete(item)}>
                          Remover
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
