export type UserRole = 'Admin' | 'Representative';

export type OrderStatus = 'قيد الاستلام' | 'تم الاستلام';

export interface User {
  id: string; // Document ID from Firestore
  name: string;
  password?: string;
  role: UserRole;
}

export interface Product {
  id: string;
  name: string;
  costPrice: number;
  sellingPrice: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
}

export interface Order {
  id: string; // The unique ID for the order
  invoiceNumber: string; 
  invoiceDate: string; // ISO string format
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdBy: string; // User ID
  createdByName: string;
}
