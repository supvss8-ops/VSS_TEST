export type UserRole = 'Admin' | 'Representative';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  password?: string; // Optional for initial setup, but required for login logic
}

export interface Product {
  sku: string;
  name: string;
}

export interface Customer {
  phone: string;
  name: string;
  address: string;
}

export interface OrderItem {
  sku: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
}

export type OrderStatus = 'قيد الاستلام' | 'تم الاستلام';

export interface Order {
  invoiceNumber: string;
  invoiceDate: string; // YYYY-MM-DD format for easier sorting/filtering
  customerPhone: string;
  customerName: string;
  customerAddress: string;
  items: OrderItem[];
  status: OrderStatus;
  createdBy: string; // userId of the representative
}
