import React, { useState, useEffect } from 'react';
import { Order, OrderItem, Product, Customer } from '../types';
import { Input } from './common/Input';
import { Select } from './common/Select';
import { Button } from './common/Button';

interface OrderFormProps {
  onSave: (order: Order) => void;
  onClose: () => void;
  products: Product[];
  customers: Customer[];
  currentUser: { id: string };
  orderToEdit?: Order | null;
}

const OrderForm: React.FC<OrderFormProps> = ({ onSave, onClose, products, customers, currentUser, orderToEdit }) => {
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [items, setItems] = useState<OrderItem[]>([{ sku: products[0]?.sku || '', quantity: 1, purchasePrice: 0, sellingPrice: 0 }]);

  useEffect(() => {
    if (orderToEdit) {
      setCustomerPhone(orderToEdit.customerPhone);
      setCustomerName(orderToEdit.customerName);
      setCustomerAddress(orderToEdit.customerAddress);
      setItems(orderToEdit.items.length > 0 ? orderToEdit.items : [{ sku: products[0]?.sku || '', quantity: 1, purchasePrice: 0, sellingPrice: 0 }]);
    }
  }, [orderToEdit, products]);

  const handleCustomerChange = (phone: string) => {
    const customer = customers.find(c => c.phone === phone);
    setCustomerPhone(phone);
    if (customer) {
      setCustomerName(customer.name);
      setCustomerAddress(customer.address);
    } else {
      setCustomerName('');
      setCustomerAddress('');
    }
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: string | number) => {
    const newItems = [...items];
    const item = { ...newItems[index] };
    // FIX: The original code had a type error because TypeScript cannot safely assign a value
    // to an indexed property with a union type. We fix this by checking the property key (`field`)
    // to narrow the type before assignment. This also corrects an invalid assignment syntax.
    if (field === 'sku') {
      item[field] = String(value);
    } else {
      item[field] = Number(value) || 0;
    }
    newItems[index] = item;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { sku: products[0]?.sku || '', quantity: 1, purchasePrice: 0, sellingPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.some(item => !item.sku || item.quantity <= 0)) {
        alert("يرجى التأكد من اختيار منتج وكمية صحيحة لكل العناصر.");
        return;
    }
    const newOrder: Order = {
      invoiceNumber: orderToEdit?.invoiceNumber || `INV-${Date.now()}`,
      invoiceDate: orderToEdit?.invoiceDate || new Date().toISOString().split('T')[0],
      customerPhone,
      customerName,
      customerAddress,
      items,
      status: orderToEdit?.status || 'قيد الاستلام',
      createdBy: currentUser.id,
    };
    onSave(newOrder);
  };
  
  const productOptions = products.map(p => ({ value: p.sku, label: `${p.name} (${p.sku})` }));
  const customerOptions = customers.map(c => ({ value: c.phone, label: `${c.name} (${c.phone})` }));
  customerOptions.unshift({ value: "new", label: "عميل جديد..." });

  return (
    <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
      <h3 className="text-xl font-semibold">بيانات العميل</h3>
      <Select 
        label="اختر عميل حالي أو أدخل بيانات عميل جديد"
        options={customerOptions}
        onChange={(e) => handleCustomerChange(e.target.value)}
        value={customers.find(c => c.phone === customerPhone) ? customerPhone : "new"}
      />
      <Input label="هاتف العميل" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} required />
      <Input label="اسم العميل" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
      <Input label="عنوان العميل" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} required />

      <h3 className="text-xl font-semibold mt-6 border-t pt-4">المنتجات</h3>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-3 border rounded-md items-end">
            <div className="md:col-span-2">
              <Select
                label="المنتج"
                options={productOptions}
                value={item.sku}
                onChange={(e) => handleItemChange(index, 'sku', e.target.value)}
              />
            </div>
            <Input label="الكمية" type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} min="1" />
            <Input label="سعر الشراء" type="number" value={item.purchasePrice} onChange={(e) => handleItemChange(index, 'purchasePrice', e.target.value)} min="0" step="0.01"/>
            <Input label="سعر البيع" type="number" value={item.sellingPrice} onChange={(e) => handleItemChange(index, 'sellingPrice', e.target.value)} min="0" step="0.01"/>
            <Button type="button" variant="danger" onClick={() => removeItem(index)} disabled={items.length <= 1}>حذف</Button>
          </div>
        ))}
      </div>

      <Button type="button" variant="secondary" onClick={addItem}>إضافة منتج آخر</Button>

      <div className="flex justify-end space-x-2 space-x-reverse pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onClose}>إلغاء</Button>
        <Button type="submit">حفظ الطلب</Button>
      </div>
    </form>
  );
};

export default OrderForm;