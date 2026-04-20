export type StockState = 'normal' | 'low';
export type StockMovementType = 'entry' | 'exit';

export interface StockItem {
  id: string;
  name: string;
  category: string;
  quantityCurrent: number;
  quantityMinimum: number;
  unit: string;
  linkedServiceId?: string | null;
  consumptionPerService?: number;
  createdAt: string;
  updatedAt: string;
}

export interface StockResolvedItem extends StockItem {
  quantityAvailable: number;
  automaticOutputQuantity: number;
  linkedServiceName?: string | null;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  quantity: number;
  note?: string;
  createdAt: string;
}

export interface StockFormValues {
  name: string;
  category: string;
  quantityCurrent: number;
  quantityMinimum: number;
  unit: string;
  linkedServiceId?: string | null;
  consumptionPerService?: number;
}

export interface StockMovementInput {
  productId: string;
  type: StockMovementType;
  quantity: number;
  note?: string;
}

export interface StockMetrics {
  totalProducts: number;
  lowStockProducts: number;
}

export interface StockAlertItem extends StockItem {
  shortageQuantity: number;
  quantityAvailable: number;
  automaticOutputQuantity: number;
  linkedServiceName?: string | null;
}

export function getStockState(item: Pick<StockItem, 'quantityCurrent' | 'quantityMinimum'> & { quantityAvailable?: number }): StockState {
  const quantity = typeof item.quantityAvailable === 'number' ? item.quantityAvailable : item.quantityCurrent;
  return quantity <= item.quantityMinimum ? 'low' : 'normal';
}

export function isStockCritical(item: Pick<StockItem, 'quantityCurrent'> & { quantityAvailable?: number }): boolean {
  const quantity = typeof item.quantityAvailable === 'number' ? item.quantityAvailable : item.quantityCurrent;
  return quantity < 0;
}
