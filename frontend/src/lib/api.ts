import { Customer, LaundryItem, LaundrySettings, Order, OrderStatus, User, UserRole } from '../types';

type BootstrapPayload = {
  isRegistered: boolean;
  settings: LaundrySettings | null;
  customers: Customer[];
  services: LaundryItem[];
  orders: Order[];
  users: User[];
};

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '');

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.message ?? `Erro na requisição (${response.status})`;
    throw new Error(message);
  }

  return data as T;
}

export function getBootstrap() {
  return request<BootstrapPayload>('/bootstrap');
}

export function registerSettings(settings: LaundrySettings) {
  return request<LaundrySettings>('/settings/register', {
    method: 'POST',
    body: JSON.stringify(settings),
  });
}

export function updateSettings(settings: LaundrySettings) {
  return request<LaundrySettings>('/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
}

export function login(payload: { role: UserRole; email: string; password: string }) {
  return request<User>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function createCustomer(payload: Omit<Customer, 'id' | 'createdAt' | 'email'>) {
  return request<Customer>('/customers', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateCustomer(id: string, payload: Omit<Customer, 'id' | 'createdAt' | 'email'>) {
  return request<Customer>(`/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteCustomer(id: string) {
  return request<{ ok: boolean }>(`/customers/${id}`, { method: 'DELETE' });
}

export function createService(payload: Omit<LaundryItem, 'id'>) {
  return request<LaundryItem>('/services', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function deleteService(id: string) {
  return request<{ ok: boolean }>(`/services/${id}`, { method: 'DELETE' });
}

export function updateService(id: string, payload: Omit<LaundryItem, 'id'>) {
  return request<LaundryItem>(`/services/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function createUser(payload: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: User['status'];
}) {
  return request<User>('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateUser(
  id: string,
  payload: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    status: User['status'];
  },
) {
  return request<User>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteUser(id: string) {
  return request<{ ok: boolean }>(`/users/${id}`, { method: 'DELETE' });
}

export function createOrder(payload: {
  customerId: string;
  userId: string;
  items: Array<{ itemId: string; quantity: number }>;
  status?: OrderStatus;
  paymentStatus?: Order['paymentStatus'];
  expectedDelivery?: string;
}) {
  return request<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      customerId: Number(payload.customerId),
      userId: Number(payload.userId),
      items: payload.items.map((item) => ({
        itemId: Number(item.itemId),
        quantity: item.quantity,
      })),
    }),
  });
}

export function updateOrder(payload: Order) {
  return request<Order>(`/orders/${payload.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      customerId: Number(payload.customerId),
      items: payload.items.map((item) => ({
        itemId: Number(item.itemId),
        quantity: item.quantity,
      })),
      status: payload.status,
      paymentStatus: payload.paymentStatus,
      expectedDelivery: payload.expectedDelivery,
    }),
  });
}

export function updateOrderStatus(id: string, status: OrderStatus) {
  return request<Order>(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function deleteOrder(id: string) {
  return request<{ ok: boolean }>(`/orders/${id}`, { method: 'DELETE' });
}
