import { User, Product, Customer, Order, OrderStatus } from './types';

export const ROLES = {
  ADMIN: 'Admin',
  REPRESENTATIVE: 'Representative',
};

// NOTE: In a real application, passwords should be hashed.
export const INITIAL_USERS: User[] = [
  { id: 'user-1', name: 'المدير العام', role: ROLES.ADMIN as 'Admin', password: 'admin' },
  { id: 'user-2', name: 'أحمد', role: ROLES.REPRESENTATIVE as 'Representative', password: '123' },
  { id: 'user-3', name: 'فاطمة', role: ROLES.REPRESENTATIVE as 'Representative', password: '123' },
];

export const INITIAL_PRODUCTS: Product[] = [
  { sku: 'SKU-001', name: 'لابتوب ديل Vostro' },
  { sku: 'SKU-002', name: 'شاشة سامسونج 24 بوصة' },
  { sku: 'SKU-003', name: 'كيبورد ميكانيكي RGB' },
  { sku: 'SKU-004', name: 'ماوس لاسلكي لوجيتك' },
  { sku: 'SKU-005', name: 'سماعة رأس سوني' },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  { phone: '01001234567', name: 'عميل تجريبي 1', address: '123 شارع المثال، القاهرة' },
  { phone: '01227654321', name: 'عميل تجريبي 2', address: '456 ميدان الاختبار، الجيزة' },
];

export const ORDER_STATUSES: OrderStatus[] = ['قيد الاستلام', 'تم الاستلام'];

export const INITIAL_ORDERS: Order[] = [
  {
    invoiceNumber: 'INV-1672522500000',
    invoiceDate: '2023-01-01',
    customerPhone: '01001234567',
    customerName: 'عميل تجريبي 1',
    customerAddress: '123 شارع المثال، القاهرة',
    items: [
      { sku: 'SKU-001', quantity: 1, purchasePrice: 15000, sellingPrice: 16500 },
      { sku: 'SKU-003', quantity: 2, purchasePrice: 800, sellingPrice: 950 },
    ],
    status: 'تم الاستلام',
    createdBy: 'user-2',
  },
  {
    invoiceNumber: 'INV-1672608900000',
    invoiceDate: '2023-01-02',
    customerPhone: '01227654321',
    customerName: 'عميل تجريبي 2',
    customerAddress: '456 ميدان الاختبار، الجيزة',
    items: [{ sku: 'SKU-002', quantity: 1, purchasePrice: 4000, sellingPrice: 4500 }],
    status: 'قيد الاستلام',
    createdBy: 'user-3',
  },
];
