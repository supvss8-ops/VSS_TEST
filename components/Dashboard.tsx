import React, { useState, useMemo } from 'react';
import { Order, User, Product, Customer, OrderStatus } from '../types';
import { exportToExcel } from '../services/exportService';
import { Modal } from './common/Modal';
import OrderForm from './OrderForm';
import { Button } from './common/Button';
import { Input } from './common/Input';
import { Select } from './common/Select';
import { ORDER_STATUSES } from '../constants';

interface DashboardProps {
  currentUser: User;
  orders: Order[];
  onSaveOrder: (order: Order) => void;
  onDeleteOrder: (invoiceNumber: string) => void;
  products: Product[];
  customers: Customer[];
  users: User[];
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser, orders, onSaveOrder, onDeleteOrder, products, customers, users }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'الكل'>('الكل');

  const userMap = useMemo(() => new Map(users.map(u => [u.id, u.name])), [users]);

  const filteredOrders = useMemo(() => {
    let filtered = currentUser.role === 'Admin' 
      ? orders 
      : orders.filter(o => o.createdBy === currentUser.id);

    if (statusFilter !== 'الكل') {
        filtered = filtered.filter(o => o.status === statusFilter);
    }
    
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.invoiceNumber.toLowerCase().includes(lowercasedTerm) ||
        order.customerName.toLowerCase().includes(lowercasedTerm) ||
        order.customerPhone.includes(lowercasedTerm)
      );
    }

    return filtered.sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());
  }, [orders, currentUser, searchTerm, statusFilter]);

  const handleSaveAndClose = (order: Order) => {
    onSaveOrder(order);
    setIsModalOpen(false);
    setOrderToEdit(null);
  };

  const openNewOrderModal = () => {
    setOrderToEdit(null);
    setIsModalOpen(true);
  };

  const openEditOrderModal = (order: Order) => {
    setOrderToEdit(order);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (invoiceNumber: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الفاتورة؟ لا يمكن التراجع عن هذا الإجراء.')) {
        onDeleteOrder(invoiceNumber);
    }
  }
  
  const handleStatusChange = (invoiceNumber: string, newStatus: OrderStatus) => {
    const order = orders.find(o => o.invoiceNumber === invoiceNumber);
    if(order) {
        onSaveOrder({ ...order, status: newStatus });
    }
  };

  const calculateTotal = (order: Order) => {
    return order.items.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
  }

  const statusOptions = [{ value: 'الكل', label: 'الكل' }, ...ORDER_STATUSES.map(s => ({ value: s, label: s }))];

  return (
    <div className="p-4 sm:p-6 lg:p-8" dir="rtl">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">لوحة التحكم - الفواتير</h2>
          <p className="mt-1 text-sm text-gray-500">
            {currentUser.role === 'Admin' ? 'عرض وإدارة جميع الفواتير.' : 'عرض وإدارة فواتيرك.'}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-4 flex space-x-2 space-x-reverse">
           <Button onClick={() => exportToExcel(filteredOrders, products, users)}>تصدير إلى Excel</Button>
           <Button onClick={openNewOrderModal}>إضافة فاتورة جديدة</Button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <Input 
             label="بحث (رقم فاتورة, اسم عميل, هاتف)"
             id="search"
             placeholder="ابحث..."
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
           />
           <Select 
             label="فلترة حسب الحالة"
             id="status-filter"
             options={statusOptions}
             value={statusFilter}
             onChange={e => setStatusFilter(e.target.value as OrderStatus | 'الكل')}
           />
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200 text-right">
              <thead className="bg-gray-50">
                  <tr>
                      <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">رقم الفاتورة</th>
                      <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                      <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">العميل</th>
                      <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">الإجمالي</th>
                      <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                      {currentUser.role === 'Admin' && <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">المندوب</th>}
                      <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">إجراءات</th>
                  </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map(order => (
                      <tr key={order.invoiceNumber}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.invoiceNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.invoiceDate}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div>{order.customerName}</div>
                              <div className="text-xs text-gray-400">{order.customerPhone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{calculateTotal(order).toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                             <Select 
                                label=""
                                id={`status-${order.invoiceNumber}`}
                                options={ORDER_STATUSES.map(s => ({value: s, label: s}))}
                                value={order.status}
                                onChange={(e) => handleStatusChange(order.invoiceNumber, e.target.value as OrderStatus)}
                                className="!mt-0 !w-auto"
                              />
                          </td>
                          {currentUser.role === 'Admin' && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{userMap.get(order.createdBy) || order.createdBy}</td>}
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2 space-x-reverse">
                              <Button variant="secondary" onClick={() => openEditOrderModal(order)}>
                                  تعديل
                              </Button>
                               <Button variant="danger" onClick={() => handleDeleteClick(order.invoiceNumber)}>
                                  حذف
                              </Button>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={orderToEdit ? 'تعديل الفاتورة' : 'فاتورة جديدة'}>
        <OrderForm 
          onSave={handleSaveAndClose} 
          onClose={() => setIsModalOpen(false)} 
          products={products}
          customers={customers}
          currentUser={currentUser}
          orderToEdit={orderToEdit}
        />
      </Modal>
    </div>
  );
};

export default Dashboard;
