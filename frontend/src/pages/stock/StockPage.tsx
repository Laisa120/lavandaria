import { useMemo, useState } from 'react';
import { Boxes, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useStock } from '../../hooks/useStock';
import { useStockMovements } from '../../hooks/useStockMovements';
import type { LaundryItem, Order } from '../../types';
import type { StockFormValues, StockResolvedItem } from '../../types/stock';
import { getStockState, isStockCritical } from '../../types/stock';
import { StockForm } from './components/StockForm';
import { StockList } from './components/StockList';
import { StockMovements } from './components/StockMovements';

interface StockPageProps {
  orders: Order[];
  services: LaundryItem[];
}

export default function StockPage({ orders, services }: StockPageProps) {
  const stock = useStock({ orders, services });
  const movements = useStockMovements({ orders, items: stock.items });
  const [editingItem, setEditingItem] = useState<StockResolvedItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const feedback = stock.error || movements.error || stock.notice || movements.notice;
  const hasError = Boolean(stock.error || movements.error);

  const sortedItems = useMemo(
    () =>
      [...stock.items].sort((a, b) => {
        const aCritical = isStockCritical(a) ? 1 : 0;
        const bCritical = isStockCritical(b) ? 1 : 0;
        if (aCritical !== bCritical) return bCritical - aCritical;

        const aLow = getStockState(a) === 'low' ? 1 : 0;
        const bLow = getStockState(b) === 'low' ? 1 : 0;
        if (aLow !== bLow) return bLow - aLow;

        return a.name.localeCompare(b.name, 'pt-BR');
      }),
    [stock.items],
  );

  const openCreateModal = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const openEditModal = (item: StockResolvedItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setEditingItem(null);
    setIsFormOpen(false);
  };

  const handleSubmit = async (values: StockFormValues) => {
    if (editingItem) {
      await stock.updateProduct(editingItem.id, values);
    } else {
      await stock.createProduct(values);
    }
    closeForm();
  };

  const handleDelete = async (item: StockResolvedItem) => {
    const confirmed = window.confirm(`Deseja remover "${item.name}" do controlo de stock?`);
    if (!confirmed) return;
    await stock.removeProduct(item.id);
  };

  const handleRefresh = async () => {
    await Promise.all([stock.reload(), movements.reload()]);
  };

  const handleMovementRefresh = async () => {
    await Promise.all([stock.reload(), movements.reload()]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Controle de estoque</h2>
          
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" icon={<RefreshCw className="h-4 w-4" />} onClick={handleRefresh}>
            Atualizar
          </Button>
          <Button icon={<Boxes className="h-4 w-4" />} onClick={openCreateModal}>
            Cadastrar produto
          </Button>
        </div>
      </div>

      {feedback ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
            hasError ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          {feedback}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        <span className="font-semibold text-slate-800">{stock.metrics.totalProducts}</span> produtos cadastrados,
        <span className="font-semibold text-slate-800"> {stock.metrics.lowStockProducts}</span> com estoque baixo.
        As saídas automáticas são calculadas com base nos pedidos em processamento, prontos ou entregues.
      </div>

      <StockList
        items={sortedItems}
        loading={stock.loading}
        onAdd={openCreateModal}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      <StockMovements
        items={sortedItems}
        movements={movements.movements}
        loading={movements.loading}
        saving={movements.saving}
        onRegisterEntry={async (payload) => {
          await movements.registerEntry(payload);
          await handleMovementRefresh();
        }}
        onRegisterExit={async (payload) => {
          await movements.registerExit(payload);
          await handleMovementRefresh();
        }}
      />

      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={editingItem ? 'Editar produto' : 'Adicionar produto'}
        size="lg"
      >
        <StockForm
          item={editingItem}
          services={services}
          isLoading={stock.saving}
          onCancel={closeForm}
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
}
