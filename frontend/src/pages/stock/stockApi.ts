import type { StockFormValues, StockItem, StockMovement, StockMovementInput } from '../../types/stock';

function resolveApiBase(): string {
  const configured = (import.meta.env.VITE_API_BASE_URL ?? '').trim();
  if (configured) return configured.replace(/\/$/, '');

  if (typeof window === 'undefined') return '/api';

  const host = window.location.hostname.toLowerCase();
  if (host === 'localhost' || host === '127.0.0.1') return '/api';
  if (host.endsWith('vercel.app') || host.endsWith('genomni.com')) return 'https://api.genomni.com/api';

  return '/api';
}

const API_BASE = resolveApiBase();

class ErroApiEstoque extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ErroApiEstoque';
  }
}

async function requisicao<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const contentType = response.headers.get('content-type') ?? '';
  const text = await response.text();
  let data: unknown = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    const message =
      typeof data === 'object' && data !== null && 'message' in data && typeof (data as { message?: unknown }).message === 'string'
        ? (data as { message: string }).message
        : `Erro na requisição (${response.status})`;
    throw new ErroApiEstoque(message, response.status);
  }

  if (contentType.includes('text/html')) {
    throw new ErroApiEstoque('Resposta inválida da API.', 502);
  }

  return data as T;
}

function normalizeStockItem(raw: any): StockItem {
  return {
    id: String(raw.id),
    name: raw.name,
    category: raw.category,
    quantityCurrent: Number(raw.quantityCurrent ?? raw.quantidadeAtual ?? raw.quantity_current ?? 0),
    quantityMinimum: Number(raw.quantityMinimum ?? raw.quantidadeMinima ?? raw.quantity_minimum ?? 0),
    unit: raw.unit ?? raw.unidade ?? 'un',
    linkedServiceId: raw.linkedServiceId ?? raw.linked_service_id ?? raw.serviceId ?? null,
    consumptionPerService: Number(raw.consumptionPerService ?? raw.consumoPorVenda ?? raw.consumption_per_service ?? 1),
    createdAt: raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? raw.updated_at ?? new Date().toISOString(),
  };
}

function normalizeMovement(raw: any): StockMovement {
  return {
    id: String(raw.id),
    productId: String(raw.productId ?? raw.product_id),
    productName: raw.productName ?? raw.product_name ?? raw.name ?? 'Produto',
    type: raw.type === 'entrada' ? 'entry' : raw.type === 'saida' ? 'exit' : raw.type,
    quantity: Number(raw.quantity ?? raw.quantidade ?? 0),
    note: raw.note ?? raw.observacao ?? '',
    createdAt: raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
  };
}

export async function listStock(): Promise<StockItem[]> {
  const response = await requisicao<any[]>('/stock');
  return response.map(normalizeStockItem);
}

export async function createStockItem(payload: StockFormValues): Promise<StockItem> {
  return normalizeStockItem(
    await requisicao('/stock', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  );
}

export async function updateStockItem(id: string, payload: StockFormValues): Promise<StockItem> {
  return normalizeStockItem(
    await requisicao(`/stock/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  );
}

export async function deleteStockItem(id: string): Promise<void> {
  await requisicao(`/stock/${id}`, { method: 'DELETE' });
}

export async function listStockMovements(): Promise<StockMovement[]> {
  const response = await requisicao<any[]>('/stock/movements');
  return response.map(normalizeMovement);
}

export async function createStockMovement(payload: StockMovementInput): Promise<StockMovement> {
  return normalizeMovement(
    await requisicao('/stock/movements', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  );
}
