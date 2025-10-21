import React, { useState, useMemo } from 'react';
import { Order, Product, Customer, User, OrderStatus } from '../types';
import { Button } from './common/Button';
import { Input } from './common/Input';
import { Select } from './common/Select';
import { Modal } from './common/Modal';
import OrderForm from './OrderForm';
import { deleteDocument, updateDocument } from '../firebaseService';
import { exportToExcel } from '../services/exportService';
import { ORDER_STATUSES } from '../constants';

interface DashboardProps {
  orders: Order[];
  products: Product[];
  customers: Customer[];
  currentUser: User;
}

const Dashboard: React.FC<DashboardProps> = ({ orders, products, customers, currentUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<Order | null>(null);

  const handleOpenModal = (order?: Order) => {
    setOrderToEdit(order || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setOrderToEdit(null);
  };
  
  const handleSaveOrder = () => {
      // Data will be re-fetched by the useCollection hook, no need to do anything here
      console.log('Order saved');
  }

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
      try {
        await deleteDocument('orders', orderId);
        alert('تم حذف الفاتورة بنجاح.');
      } catch (error) {
        console.error("Error deleting order: ", error);
        alert('فشل في حذف الفاتورة.');
      }
    }
  };

  const handleChangeStatus = async (orderId: string, newStatus: OrderStatus) => {
      try {
          await updateDocument('orders', orderId, { status: newStatus });
          alert('تم تحديث حالة الفاتورة بنجاح.');
      } catch (error) {
          console.error("Error updating status: ", error);
          alert('فشل في تحديث الحالة.');
      }
  }
  
  const filteredOrders = useMemo(() => {
    return orders
      .filter(order => {
        // Role-based filtering
        if (currentUser.role === 'Representative') {
          return order.createdBy === currentUser.id;
        }
        return true;
      })
      .filter(order => {
        // Status filtering
        if (statusFilter === 'all') return true;
        return order.status === statusFilter;
      })
      .filter(order => {
        // Search term filtering
        const search = searchTerm.toLowerCase();
        return (
          order.invoiceNumber.toLowerCase().includes(search) ||
          order.customerName.toLowerCase().includes(search) ||
          order.customerPhone.toLowerCase().includes(search)
        );
      })
      .sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());
  }, [orders, currentUser, statusFilter, searchTerm]);

  const statusOptions = [{ value: 'all', label: 'الكل' }, ...ORDER_STATUSES.map(s => ({ value: s, label: s }))];

  const handleExport = () => {
      exportToExcel(filteredOrders, products);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">الفواتير</h2>
        <div className="flex space-x-4 space-x-reverse">
            <Button onClick={handleExport}>تصدير إلى Excel</Button>
            <Button onClick={() => handleOpenModal()}>إضافة فاتورة جديدة</Button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input 
                label="بحث (رقم فاتورة, اسم عميل, هاتف)"
                id="search"
                placeholder="ابحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select
                label="تصفية حسب الحالة"
                id="statusFilter"
                options={statusOptions}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
            />
        </div>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم الفاتورة</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العميل</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجمالي</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المندوب</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إجراءات</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map(order => (
                    <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.invoiceNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customerName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.invoiceDate).toLocaleDateString('ar-EG')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.totalAmount.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                           {currentUser.role === 'Admin' ? (
                                <Select
                                    label=""
                                    id={`status-${order.id}`}
                                    className="!mt-0"
                                    options={ORDER_STATUSES.map(s => ({ value: s, label: s }))}
                                    value={order.status}
                                    onChange={(e) => handleChangeStatus(order.id, e.target.value as OrderStatus)}
                                />
                           ) : (
                               <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'تم الاستلام' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                   {order.status}
                               </span>
                           )}
                        </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.createdByName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2 space-x-reverse">
                            <Button variant="secondary" onClick={() => setSelectedOrderForDetails(order)}>عرض</Button>
                            <Button variant="secondary" onClick={() => handleOpenModal(order)}>تعديل</Button>
                            {currentUser.role === 'Admin' && (
                                <Button variant="danger" onClick={() => handleDeleteOrder(order.id)}>حذف</Button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        {filteredOrders.length === 0 && <p className="text-center p-4">لا توجد فواتير.</p>}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={orderToEdit ? 'تعديل فاتورة' : 'فاتورة جديدة'}>
        <OrderForm 
            orderToEdit={orderToEdit}
            onClose={handleCloseModal}
            onSave={handleSaveOrder}
            products={products}
            customers={customers}
            currentUser={currentUser}
            orders={orders}
        />
      </Modal>

      <Modal isOpen={!!selectedOrderForDetails} onClose={() => setSelectedOrderForDetails(null)} title={`تفاصيل الفاتورة رقم ${selectedOrderForDetails?.invoiceNumber}`}>
        {selectedOrderForDetails && (
            <div className="space-y-4" dir="rtl">
                <p><strong>العميل:</strong> {selectedOrderForDetails.customerName}</p>
                <p><strong>الهاتف:</strong> {selectedOrderForDetails.customerPhone}</p>
                <p><strong>العنوان:</strong> {selectedOrderForDetails.customerAddress}</p>
                <p><strong>التاريخ:</strong> {new Date(selectedOrderForDetails.invoiceDate).toLocaleDateString('ar-EG')}</p>
                <p><strong>الحالة:</strong> {selectedOrderForDetails.status}</p>
                <p><strong>المندوب:</strong> {selectedOrderForDetails.createdByName}</p>
                <h4 className="font-bold mt-4">المنتجات:</h4>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-right">المنتج</th>
                            <th className="px-4 py-2 text-right">الكمية</th>
                            <th className="px-4 py-2 text-right">السعر</th>
                            <th className="px-4 py-2 text-right">الإجمالي</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedOrderForDetails.items.map((item, index) => (
                            <tr key={index}>
                                <td className="px-4 py-2">{item.productName}</td>
                                <td className="px-4 py-2">{item.quantity}</td>
                                <td className="px-4 py-2">{item.sellingPrice.toFixed(2)}</td>
                                <td className="px-4 py-2">{(item.quantity * item.sellingPrice).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <p className="text-left font-bold text-lg">الإجمالي الكلي: {selectedOrderForDetails.totalAmount.toFixed(2)}</p>
            </div>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;
