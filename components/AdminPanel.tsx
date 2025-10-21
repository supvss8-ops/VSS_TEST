import React, { useState } from 'react';
import { User, Product, Customer, Order, UserRole } from '../types';
import { Button } from './common/Button';
import { Input } from './common/Input';
import { Modal } from './common/Modal';
import { Select } from './common/Select';
import { addDocument, updateDocument, deleteDocument } from '../firebaseService';

interface AdminPanelProps {
  users: User[];
  products: Product[];
  customers: Customer[];
  orders: Order[];
}

type AdminTab = 'users' | 'products' | 'customers';

const AdminPanel: React.FC<AdminPanelProps> = ({ users, products, customers }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const handleOpenModal = (item?: any) => {
    setEditingItem(item || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UsersTab users={users} onEdit={handleOpenModal} />;
      case 'products':
        return <ProductsTab products={products} onEdit={handleOpenModal} />;
      case 'customers':
        return <CustomersTab customers={customers} onEdit={handleOpenModal} />;
      default:
        return null;
    }
  };
  
  const getModalTitle = () => {
      switch (activeTab) {
          case 'users':
              return editingItem ? 'تعديل مستخدم' : 'إضافة مستخدم';
          case 'products':
              return editingItem ? 'تعديل منتج' : 'إضافة منتج';
          case 'customers':
              return editingItem ? 'تعديل عميل' : 'إضافة عميل';
      }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">لوحة تحكم الأدمن</h2>
        <Button onClick={() => handleOpenModal()}>إضافة {activeTab === 'users' ? 'مستخدم' : activeTab === 'products' ? 'منتج' : 'عميل'}</Button>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 space-x-reverse" aria-label="Tabs">
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

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={getModalTitle()}>
        {activeTab === 'users' && <UserForm userToEdit={editingItem} onClose={handleCloseModal} />}
        {activeTab === 'products' && <ProductForm productToEdit={editingItem} onClose={handleCloseModal} />}
        {activeTab === 'customers' && <CustomerForm customerToEdit={editingItem} onClose={handleCloseModal} />}
      </Modal>
    </div>
  );
};

// --- User Management ---
const UsersTab: React.FC<{ users: User[], onEdit: (user: User) => void }> = ({ users, onEdit }) => {
    const handleDelete = async (id: string) => {
        if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
            await deleteDocument('users', id);
        }
    }
    return (
      <div className="bg-white shadow-sm rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الدور</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إجراءات</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                    <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role === 'Admin' ? 'مدير' : 'مندوب'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2 space-x-reverse">
                            <Button variant="secondary" onClick={() => onEdit(user)}>تعديل</Button>
                            <Button variant="danger" onClick={() => handleDelete(user.id)}>حذف</Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    )
}

const UserForm: React.FC<{ userToEdit?: User | null, onClose: () => void }> = ({ userToEdit, onClose }) => {
    const [name, setName] = useState(userToEdit?.name || '');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>(userToEdit?.role || 'Representative');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const userData: Partial<User> = { name, role };
        if (password) {
            userData.password = password;
        }
        if (userToEdit) {
            await updateDocument('users', userToEdit.id, userData);
        } else {
            if (!password) {
                alert('كلمة المرور مطلوبة للمستخدم الجديد.');
                return;
            }
            await addDocument('users', userData);
        }
        onClose();
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
            <Input label="الاسم" value={name} onChange={e => setName(e.target.value)} required />
            <Input label={`كلمة المرور ${userToEdit ? '(اتركها فارغة لعدم التغيير)' : ''}`} type="password" value={password} onChange={e => setPassword(e.target.value)} required={!userToEdit}/>
            <Select label="الدور" value={role} onChange={e => setRole(e.target.value as UserRole)} options={[{value: 'Admin', label: 'مدير'}, {value: 'Representative', label: 'مندوب'}]} />
            <div className="flex justify-end space-x-2 space-x-reverse">
                <Button type="button" variant="secondary" onClick={onClose}>إلغاء</Button>
                <Button type="submit">حفظ</Button>
            </div>
        </form>
    )
}

// --- Product Management ---
const ProductsTab: React.FC<{ products: Product[], onEdit: (p: Product) => void }> = ({ products, onEdit }) => {
     const handleDelete = async (id: string) => {
        if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
            await deleteDocument('products', id);
        }
    }
    return (
      <div className="bg-white shadow-sm rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">كود المنتج</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">اسم المنتج</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">سعر التكلفة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">سعر البيع</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إجراءات</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {products.map(product => (
                    <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.costPrice.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.sellingPrice.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2 space-x-reverse">
                            <Button variant="secondary" onClick={() => onEdit(product)}>تعديل</Button>
                            <Button variant="danger" onClick={() => handleDelete(product.id)}>حذف</Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    )
}

const ProductForm: React.FC<{ productToEdit?: Product | null, onClose: () => void }> = ({ productToEdit, onClose }) => {
    const [name, setName] = useState(productToEdit?.name || '');
    const [costPrice, setCostPrice] = useState(productToEdit?.costPrice || 0);
    const [sellingPrice, setSellingPrice] = useState(productToEdit?.sellingPrice || 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const productData = { name, costPrice: Number(costPrice), sellingPrice: Number(sellingPrice) };
        if (productToEdit) {
            await updateDocument('products', productToEdit.id, productData);
        } else {
            await addDocument('products', productData);
        }
        onClose();
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
            <Input label="اسم المنتج" value={name} onChange={e => setName(e.target.value)} required />
            <Input label="سعر التكلفة" type="number" step="0.01" value={costPrice} onChange={e => setCostPrice(Number(e.target.value))} required />
            <Input label="سعر البيع" type="number" step="0.01" value={sellingPrice} onChange={e => setSellingPrice(Number(e.target.value))} required />
            <div className="flex justify-end space-x-2 space-x-reverse">
                <Button type="button" variant="secondary" onClick={onClose}>إلغاء</Button>
                <Button type="submit">حفظ</Button>
            </div>
        </form>
    )
}

// --- Customer Management ---
const CustomersTab: React.FC<{ customers: Customer[], onEdit: (c: Customer) => void }> = ({ customers, onEdit }) => {
    const handleDelete = async (id: string) => {
        if (window.confirm('هل أنت متأكد من حذف هذا العميل؟')) {
            await deleteDocument('customers', id);
        }
    }
    return (
      <div className="bg-white shadow-sm rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">اسم العميل</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الهاتف</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العنوان</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إجراءات</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {customers.map(customer => (
                    <tr key={customer.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">{customer.address}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2 space-x-reverse">
                            <Button variant="secondary" onClick={() => onEdit(customer)}>تعديل</Button>
                            <Button variant="danger" onClick={() => handleDelete(customer.id)}>حذف</Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    )
}

const CustomerForm: React.FC<{ customerToEdit?: Customer | null, onClose: () => void }> = ({ customerToEdit, onClose }) => {
    const [name, setName] = useState(customerToEdit?.name || '');
    const [phone, setPhone] = useState(customerToEdit?.phone || '');
    const [address, setAddress] = useState(customerToEdit?.address || '');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const customerData = { name, phone, address };
        if (customerToEdit) {
            await updateDocument('customers', customerToEdit.id, customerData);
        } else {
            await addDocument('customers', customerData);
        }
        onClose();
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
            <Input label="اسم العميل" value={name} onChange={e => setName(e.target.value)} required />
            <Input label="الهاتف" value={phone} onChange={e => setPhone(e.target.value)} required />
            <Input label="العنوان" value={address} onChange={e => setAddress(e.target.value)} required />
            <div className="flex justify-end space-x-2 space-x-reverse">
                <Button type="button" variant="secondary" onClick={onClose}>إلغاء</Button>
                <Button type="submit">حفظ</Button>
            </div>
        </form>
    )
}


export default AdminPanel;
