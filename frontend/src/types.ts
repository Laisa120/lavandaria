export type UserRole = 'admin' | 'cashier';

export interface User {
  id: string;
  companyId?: string | null;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  platformRole?: 'super_admin' | 'support' | 'client_admin' | 'user' | null;
  status: 'active' | 'inactive';
  isBlocked?: boolean;
  createdAt: string;
}

export type OrderStatus = 'pending' | 'processing' | 'ready' | 'delivered' | 'cancelled';
export type DocumentType = 'fatura' | 'fatura_recibo' | 'proforma' | 'nota_credito' | 'nota_debito';
export type PaymentMethod = 'dinheiro' | 'transferencia' | 'multicaixa' | 'cartao';

export interface LaundryItem {
  id: string;
  name: string;
  price: number;
  category: 'clothing' | 'bedding' | 'curtains' | 'other';
}

export interface OrderItem {
  itemId: string;
  quantity: number;
  priceAtTime: number;
}

export interface Order {
  id: string;
  customerId: string;
  createdByUserId?: string | null;
  createdByUserName?: string;
  createdByUserRole?: UserRole | null;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  createdAt: string;
  updatedAt: string;
  expectedDelivery: string;
  paymentStatus: 'paid' | 'unpaid';
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
}

export interface LaundrySettings {
  // Basic Data
  logo?: string;
  companyName: string;
  tradeName: string;
  nif: string;
  companyType: string;

  // Address and Contacts
  country: string;
  province: string;
  municipality: string;
  fullAddress: string;
  postalCode: string;
  phone: string;
  email: string;
  website?: string;

  // Fiscal Data
  ivaRegime: 'geral' | 'nao_sujeicao' | 'isento';
  defaultIvaRate: number;
  currency: string;
  invoiceSeries: string;
  startInvoiceNumber: number;
  withholdingTaxPercentage?: number;

  // Banking Data
  bankName?: string;
  accountNumber?: string;
  iban?: string;

  // System Config
  invoiceModel: 'A4' | 'thermal';
  invoiceNumberFormat: string;
  allowCreditSales: boolean;
  defaultDueDays: number;
  allowGlobalDiscount: boolean;

  // Printer Config
  printerName?: string;
  printerConnectionType: 'usb' | 'network' | 'bluetooth';
  printerIpAddress?: string;
  autoPrintReceipt: boolean;
  autoDownloadPDF: boolean;
}
