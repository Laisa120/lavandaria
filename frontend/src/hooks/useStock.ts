import { useEffect, useMemo, useState } from 'react';
import { createStockItem, deleteStockItem, listStock, updateStockItem } from '../pages/stock/stockApi';
import type { LaundryItem, Order } from '../types';
import type { StockAlertItem, StockFormValues, StockItem, StockMetrics, StockResolvedItem } from '../types/stock';
import { getStockState } from '../types/stock';

interface UseStockOptions {
  orders: Order[];
  services: LaundryItem[];
}

function shouldApplyAutomaticOutput(order: Order) {
  return order.status === 'processing' || order.status === 'ready' || order.status === 'delivered';
}

export function useStock({ orders, services }: UseStockOptions) {
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadStock = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await listStock();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar o stock.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStock();
  }, []);

  const createProduct = async (payload: StockFormValues) => {
    setSaving(true);
    setError('');

    try {
      const created = await createStockItem(payload);
      setItems((prev) => [created, ...prev]);
      setNotice('Produto adicionado com sucesso.');
      return created;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível criar o produto.';
      setError(message);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const updateProduct = async (id: string, payload: StockFormValues) => {
    setSaving(true);
    setError('');

    try {
      const updated = await updateStockItem(id, payload);
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      setNotice('Produto atualizado com sucesso.');
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível atualizar o produto.';
      setError(message);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const removeProduct = async (id: string) => {
    setSaving(true);
    setError('');

    try {
      await deleteStockItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      setNotice('Produto removido com sucesso.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível remover o produto.';
      setError(message);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const resolvedItems: StockResolvedItem[] = useMemo(
    () => ({
      items: items.map((item) => {
        const automaticOutputQuantity = item.linkedServiceId
          ? orders
              .filter(shouldApplyAutomaticOutput)
              .flatMap((order) => order.items)
              .filter((orderItem) => orderItem.itemId === item.linkedServiceId)
              .reduce((total, orderItem) => total + orderItem.quantity * (item.consumptionPerService ?? 1), 0)
          : 0;

        const linkedService = services.find((service) => service.id === item.linkedServiceId);
        return {
          ...item,
          automaticOutputQuantity,
          quantityAvailable: item.quantityCurrent - automaticOutputQuantity,
          linkedServiceName: linkedService?.name ?? null,
        };
      }),
    }).items,
    [items, orders, services],
  );

  const metrics: StockMetrics = useMemo(
    () => ({
      totalProducts: resolvedItems.length,
      lowStockProducts: resolvedItems.filter((item) => getStockState(item) === 'low').length,
    }),
    [resolvedItems],
  );

  const alerts: StockAlertItem[] = useMemo(
    () =>
      resolvedItems
        .filter((item) => getStockState(item) === 'low')
        .map((item) => ({
          ...item,
          shortageQuantity: Math.max(item.quantityMinimum - item.quantityAvailable, 0),
        })),
    [resolvedItems],
  );

  return {
    items: resolvedItems,
    alerts,
    metrics,
    loading,
    saving,
    error,
    notice,
    clearNotice: () => setNotice(''),
    reload: loadStock,
    createProduct,
    updateProduct,
    removeProduct,
  };
}
