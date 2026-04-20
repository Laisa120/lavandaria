import { useEffect, useState } from 'react';
import { createStockMovement, listStockMovements } from '../pages/stock/stockApi';
import type { Order } from '../types';
import type { StockMovement, StockMovementInput, StockResolvedItem } from '../types/stock';

interface UseStockMovementsOptions {
  orders: Order[];
  items: StockResolvedItem[];
}

function shouldApplyAutomaticOutput(order: Order) {
  return order.status === 'processing' || order.status === 'ready' || order.status === 'delivered';
}

export function useStockMovements({ orders, items }: UseStockMovementsOptions) {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadMovements = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await listStockMovements();
      setMovements(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar as movimentações.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMovements();
  }, []);

  const registerMovement = async (payload: StockMovementInput) => {
    setSaving(true);
    setError('');

    try {
      if (payload.type === 'exit') {
        const currentItem = items.find((item) => item.id === payload.productId);
        if (currentItem && payload.quantity > currentItem.quantityAvailable) {
          throw new Error('A saída não pode deixar o stock abaixo do saldo disponível.');
        }
      }

      const created = await createStockMovement(payload);
      setMovements((prev) => [created, ...prev]);
      setNotice(payload.type === 'entry' ? 'Entrada registada com sucesso.' : 'Saída registada com sucesso.');
      return created;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível registar a movimentação.';
      setError(message);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const automaticMovements: StockMovement[] = orders
    .filter(shouldApplyAutomaticOutput)
    .flatMap((order) =>
      order.items.flatMap((orderItem) => {
        const stockItem = items.find((item) => item.linkedServiceId === orderItem.itemId);
        if (!stockItem) return [];

        return [
          {
            id: `auto_${order.id}_${stockItem.id}_${orderItem.itemId}`,
            productId: stockItem.id,
            productName: stockItem.name,
            type: 'exit' as const,
            quantity: orderItem.quantity * (stockItem.consumptionPerService ?? 1),
            note: `Saída automática do pedido #${order.id.slice(0, 8)}`,
            createdAt: order.updatedAt ?? order.createdAt,
          },
        ];
      }),
    );

  const combinedMovements = [...automaticMovements, ...movements].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return {
    movements: combinedMovements,
    loading,
    saving,
    error,
    notice,
    clearNotice: () => setNotice(''),
    reload: loadMovements,
    registerEntry: (payload: Omit<StockMovementInput, 'type'>) => registerMovement({ ...payload, type: 'entry' }),
    registerExit: (payload: Omit<StockMovementInput, 'type'>) => registerMovement({ ...payload, type: 'exit' }),
  };
}
