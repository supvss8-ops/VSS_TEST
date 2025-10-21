import { OrderStatus, User } from './types';

export const ORDER_STATUSES: OrderStatus[] = ['قيد الاستلام', 'تم الاستلام'];

export const INITIAL_USERS: Omit<User, 'id'>[] = [
  {
    name: 'المدير العام',
    password: 'admin',
    role: 'Admin',
  },
  {
    name: 'مندوب 1',
    password: 'user1',
    role: 'Representative',
  },
];
