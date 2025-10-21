import React, { useState, useCallback } from 'react';
import { User, Product, Customer, UserRole } from '../types';
import { Button } from './common/Button';
import { Modal } from './common/Modal';
import { Input } from './common/Input';
import { Select } from './common/Select';
import { ROLES } from '../constants';

// --- Form Components for CRUD ---

const UserForm: React.FC<{ user: Partial<User> | null; onSave: (user: User) => void; onCancel: () => void }> = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    id: user?.id || `user-${Date.now()}`,
    name: user?.name || '',
    role: user?.role || 'Representative',
    password: user?.password || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.password) {
      alert("الاسم وكلمة المرور مطلوبان.");
      return;
    }
    onSave(formData as User);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
      <Input label="اسم المستخدم" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
      <Input label="كلمة المرور" type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required />
      <Select 
        label="الدور"
        options={Object.values(ROLES).map(r => ({ value: r, label: r }))}
        value={formData.role}
        onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
      />
      <div className="flex justify-end space-x-2 space-x-reverse pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>إلغاء</Button>
        <Button type="submit">حفظ</Button>
      </div>
    </form>
  );
};

const ProductForm: React.FC<{ product: Product | null; onSave: (product: Product) => void; onCancel: () => void; isEditing: boolean }> = ({ product, onSave, onCancel, isEditing }) => {
    const [formData, setFormData] = useState({
        sku: product?.sku || '',
        name: product?.name || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!formData.sku || !formData.name) {
            alert("كود المنتج والاسم مطلوبان.");
            return;
        }
        onSave(formData);
    }

    return (
         <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
            <Input label="كود المنتج (SKU)" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} required disabled={isEditing} />
            <Input label="اسم المنتج" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            <div className="flex justify-end space-x-2 space-x-reverse pt-4">
                <Button type="button" variant="secondary" onClick={onCancel}>إلغاء</Button>
                <Button type="submit">حفظ</Button>
            </div>
        </form>
    );
}

const CustomerForm: React.FC<{ customer: Customer | null; onSave: (customer: Customer) => void; onCancel: () => void; isEditing: boolean }> = ({ customer, onSave, onCancel, isEditing }) => {
    const [formData, setFormData] = useState({
        phone: customer?.phone || '',
        name: customer?.name || '',
        address: customer?.address || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!formData.phone || !formData.name || !formData.address) {
            alert("جميع الحقول مطلوبة.");
            return;
        }
        onSave(formData);
    }
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
            <Input label="هاتف العميل" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required disabled={isEditing} />
            <Input label="اسم العميل" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            <Input label="عنوان العميل" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required />
             <div className="flex justify-end space-x-2 space-x-reverse pt-4">
                <Button type="button" variant="secondary" onClick={onCancel}>إلغاء</Button>
                <Button type="submit">حفظ</Button>
            </div>
        </form>
    )
}


// --- Main Admin Panel Component ---

interface AdminPanelProps {
  users: User[];
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;

  products: Product[];
  onAddProduct: (product: Product) => boolean;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (sku: string) => void;

  customers: Customer[];
  onAddCustomer: (customer: Customer) => boolean;
  onUpdateCustomer: (customer: Customer) => void;
  onDeleteCustomer: (phone: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
    users, onAddUser, onUpdateUser, onDeleteUser,
    products, onAddProduct, onUpdateProduct, onDeleteProduct,
    customers, onAddCustomer, onUpdateCustomer, onDeleteCustomer
 }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'products' | 'customers'>('users');
  
  // Modal States
  const [userModal, setUserModal] = useState<{ isOpen: boolean; user: User | null }>({ isOpen: false, user: null });
  const [productModal, setProductModal] = useState<{ isOpen: boolean; product: Product | null }>({ isOpen: false, product: null });
  const [customerModal, setCustomerModal] = useState<{ isOpen: boolean; customer: Customer | null }>({ isOpen: false, customer: null });

  const handleSaveUser = useCallback((user: User) => {
    if (userModal.user) {
        onUpdateUser(user);
    } else {
        onAddUser(user);
    }
    setUserModal({ isOpen: false, user: null });
  }, [userModal.user, onAddUser, onUpdateUser]);

  const handleSaveProduct = useCallback((product: Product) => {
    if (productModal.product) {
        onUpdateProduct(product);
    } else {
        if (!onAddProduct(product)) {
            alert("منتج بنفس الكود موجود بالفعل.");
            return;
        }
    }
    setProductModal({ isOpen: false, product: null });
  }, [productModal.product, onAddProduct, onUpdateProduct]);

  const handleSaveCustomer = useCallback((customer: Customer) => {
    if (customerModal.customer) {
        onUpdateCustomer(customer);
    } else {
        if (!onAddCustomer(customer)) {
            alert("عميل بنفس رقم الهاتف موجود بالفعل.");
            return;
        }
    }
    setCustomerModal({ isOpen: false, customer: null });
  }, [customerModal.customer, onAddCustomer, onUpdateCustomer]);

  const handleDelete = (type: 'user' | 'product' | 'customer', id: string) => {
      if(window.confirm(`هل أنت متأكد من حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.`)) {
          switch(type) {
              case 'user': onDeleteUser(id); break;
              case 'product': onDeleteProduct(id); break;
              case 'customer': onDeleteCustomer(id); break;
          }
      }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return (
          <div>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">المستخدمون</h3>
              <Button onClick={() => setUserModal({ isOpen: true, user: null })}>إضافة مستخدم جديد</Button>
            </div>
            <div className="overflow-x-auto mt-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الدور</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">إجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2 space-x-reverse">
                      <Button variant="secondary" onClick={() => setUserModal({ isOpen: true, user })}>تعديل</Button>
                      <Button variant="danger" onClick={() => handleDelete('user', user.id)}>حذف</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        );
      case 'products':
        return (
          <div>
             <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">المنتجات</h3>
                <Button onClick={() => setProductModal({ isOpen: true, product: null })}>إضافة منتج جديد</Button>
            </div>
            <div className="overflow-x-auto mt-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">اسم المنتج</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">إجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map(product => (
                  <tr key={product.sku}>
                    <td className="px-6 py-4 whitespace-nowrap">{product.sku}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                     <td className="px-6 py-4 whitespace-nowrap space-x-2 space-x-reverse">
                      <Button variant="secondary" onClick={() => setProductModal({ isOpen: true, product })}>تعديل</Button>
                      <Button variant="danger" onClick={() => handleDelete('product', product.sku)}>حذف</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        );
      case 'customers':
         return (
          <div>
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">العملاء</h3>
                <Button onClick={() => setCustomerModal({ isOpen: true, customer: null })}>إضافة عميل جديد</Button>
            </div>
            <div className="overflow-x-auto mt-4">
             <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الهاتف</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">العنوان</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">إجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map(customer => (
                  <tr key={customer.phone}>
                    <td className="px-6 py-4 whitespace-nowrap">{customer.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{customer.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{customer.address}</td>
                     <td className="px-6 py-4 whitespace-nowrap space-x-2 space-x-reverse">
                      <Button variant="secondary" onClick={() => setCustomerModal({ isOpen: true, customer })}>تعديل</Button>
                      <Button variant="danger" onClick={() => handleDelete('customer', customer.phone)}>حذف</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8" dir="rtl">
        <div className="sm:flex sm:items-center sm:justify-between mb-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">لوحة الإدارة</h2>
                <p className="mt-1 text-sm text-gray-500">إدارة بيانات النظام الأساسية.</p>
            </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-4 space-x-reverse" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`${activeTab === 'users' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        المستخدمون
                    </button>
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`${activeTab === 'products' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        المنتجات
                    </button>
                    <button
                        onClick={() => setActiveTab('customers')}
                        className={`${activeTab === 'customers' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        العملاء
                    </button>
                </nav>
            </div>
            <div className="mt-6">
              {renderContent()}
            </div>
        </div>

        {/* --- Modals for CRUD --- */}
        <Modal isOpen={userModal.isOpen} onClose={() => setUserModal({ isOpen: false, user: null })} title={userModal.user ? "تعديل مستخدم" : "إضافة مستخدم جديد"}>
            <UserForm user={userModal.user} onSave={handleSaveUser} onCancel={() => setUserModal({ isOpen: false, user: null })} />
        </Modal>

        <Modal isOpen={productModal.isOpen} onClose={() => setProductModal({ isOpen: false, product: null })} title={productModal.product ? "تعديل منتج" : "إضافة منتج جديد"}>
            <ProductForm product={productModal.product} onSave={handleSaveProduct} onCancel={() => setProductModal({ isOpen: false, product: null })} isEditing={!!productModal.product} />
        </Modal>

        <Modal isOpen={customerModal.isOpen} onClose={() => setCustomerModal({ isOpen: false, customer: null })} title={customerModal.customer ? "تعديل عميل" : "إضافة عميل جديد"}>
            <CustomerForm customer={customerModal.customer} onSave={handleSaveCustomer} onCancel={() => setCustomerModal({ isOpen: false, customer: null })} isEditing={!!customerModal.customer} />
        </Modal>
    </div>
  );
};

export default AdminPanel;
