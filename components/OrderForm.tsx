import React, { useState, useEffect } from 'react';
import { Order, Product, Customer, OrderItem, OrderStatus, User } from '../types';
import { Input } from './common/Input';
import { Button } from './common/Button';
import { Select } from './common/Select';
import { TextArea } from './common/TextArea';
import { addDocument, updateDocument } from '../firebaseService';

interface OrderFormProps {
  orderToEdit?: Order | null;
  onClose: () => void;
  onSave: () => void;
  products: Product[];
  customers: Customer[];
  currentUser: User;
  orders: Order[];
}

const OrderForm: React.FC<OrderFormProps> = ({ orderToEdit, onClose, onSave, products, customers, currentUser, orders }) => {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  const [items, setItems] = useState<OrderItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [status, setStatus] = useState<OrderStatus>('قيد الاستلام');

  const [isNewCustomer, setIsNewCustomer] = useState(false);

  useEffect(() => {
    if (orderToEdit) {
      setInvoiceNumber(orderToEdit.invoiceNumber);
      setInvoiceDate(new Date(orderToEdit.invoiceDate).toISOString().split('T')[0]);
      setSelectedCustomerId(orderToEdit.customerId);
      setCustomerName(orderToEdit.customerName);
      setCustomerPhone(orderToEdit.customerPhone);
      setCustomerAddress(orderToEdit.customerAddress);
      setItems(orderToEdit.items);
      setTotalAmount(orderToEdit.totalAmount);
      setStatus(orderToEdit.status);
    } else {
        // Generate a new invoice number
        const lastOrder = orders.sort((a, b) => parseInt(b.invoiceNumber) - parseInt(a.invoiceNumber))[0];
        const newInvoiceNumber = lastOrder ? (parseInt(lastOrder.invoiceNumber) + 1).toString() : '1001';
        setInvoiceNumber(newInvoiceNumber);
    }
  }, [orderToEdit, orders]);
  
  useEffect(() => {
      const total = items.reduce((sum, item) => sum + item.quantity * item.sellingPrice, 0);
      setTotalAmount(total);
  }, [items]);

  useEffect(() => {
    if (!isNewCustomer && selectedCustomerId) {
      const customer = customers.find(c => c.id === selectedCustomerId);
      if (customer) {
        setCustomerName(customer.name);
        setCustomerPhone(customer.phone);
        setCustomerAddress(customer.address);
      }
    } else if (isNewCustomer) {
        setCustomerName('');
        setCustomerPhone('');
        setCustomerAddress('');
    }
  }, [selectedCustomerId, customers, isNewCustomer]);


  const handleAddItem = () => {
    const firstProduct = products[0];
    if (!firstProduct) {
        alert("لا توجد منتجات متاحة لإضافتها.");
        return;
    };
    setItems([...items, { 
        productId: firstProduct.id, 
        productName: firstProduct.name,
        quantity: 1, 
        costPrice: firstProduct.costPrice, 
        sellingPrice: firstProduct.sellingPrice 
    }]);
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...items];
    const item = {...newItems[index]};

    if (field === 'productId') {
        const product = products.find(p => p.id === value);
        if (product) {
            item.productId = product.id;
            item.productName = product.name;
            item.costPrice = product.costPrice;
            item.sellingPrice = product.sellingPrice;
        }
    } else if (field === 'quantity') {
        item.quantity = Number(value) < 1 ? 1 : Number(value);
    }

    newItems[index] = item;
    setItems(newItems);
  };
  
  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let customerIdToSave = selectedCustomerId;
    let customerNameToSave = customerName;
    let customerPhoneToSave = customerPhone;
    let customerAddressToSave = customerAddress;

    if (isNewCustomer) {
        if (!customerName || !customerPhone || !customerAddress) {
            alert('يرجى ملء جميع بيانات العميل الجديد.');
            return;
        }
        const newCustomer: Omit<Customer, 'id'> = { name: customerName, phone: customerPhone, address: customerAddress };
        customerIdToSave = await addDocument('customers', newCustomer);
        customerNameToSave = newCustomer.name;
        customerPhoneToSave = newCustomer.phone;
        customerAddressToSave = newCustomer.address;
    } else if (!selectedCustomerId) {
        alert('يرجى اختيار عميل.');
        return;
    }


    if (items.length === 0) {
        alert('يجب إضافة منتج واحد على الأقل.');
        return;
    }

    const orderData: Omit<Order, 'id'> = {
      invoiceNumber,
      invoiceDate: new Date(invoiceDate).toISOString(),
      customerId: customerIdToSave,
      customerName: customerNameToSave,
      customerPhone: customerPhoneToSave,
      customerAddress: customerAddressToSave,
      items,
      totalAmount,
      status,
      createdBy: currentUser.id,
      createdByName: currentUser.name
    };

    try {
        if (orderToEdit) {
            await updateDocument('orders', orderToEdit.id, orderData);
        } else {
            await addDocument('orders', orderData);
        }
        onSave();
        onClose();
    } catch (error) {
        console.error("Failed to save order:", error);
        alert('فشل في حفظ الفاتورة.');
    }
  };

  const customerOptions = customers.map(c => ({ value: c.id, label: `${c.name} - ${c.phone}` }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="رقم الفاتورة" id="invoiceNumber" type="text" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} required readOnly/>
            <Input label="تاريخ الفاتورة" id="invoiceDate" type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} required />
        </div>

        <hr />
        
        <div className="space-y-4">
            <div className="flex items-center">
                <input type="checkbox" id="newCustomer" checked={isNewCustomer} onChange={(e) => setIsNewCustomer(e.target.checked)} className="ml-2"/>
                <label htmlFor="newCustomer">إضافة عميل جديد</label>
            </div>
            
            {isNewCustomer ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="اسم العميل" id="newCustomerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
                    <Input label="هاتف العميل" id="newCustomerPhone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} required />
                    <TextArea label="عنوان العميل" id="newCustomerAddress" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} required />
                </div>
            ) : (
                <Select 
                    label="اختر عميل"
                    id="selectCustomer"
                    options={[{ value: '', label: 'اختر عميل...' }, ...customerOptions]} 
                    value={selectedCustomerId} 
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    required
                />
            )}
        </div>
        
        <hr />

        <h4 className="text-lg font-medium">المنتجات</h4>
        <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
            {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center border-b pb-2">
                    <div className="col-span-5">
                        <Select
                            label="المنتج"
                            id={`product-${index}`}
                            options={products.map(p => ({ value: p.id, label: p.name }))}
                            value={item.productId}
                            onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                        />
                    </div>
                    <div className="col-span-2">
                        <Input 
                            label="الكمية"
                            id={`quantity-${index}`}
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        />
                    </div>
                     <div className="col-span-2 pt-7">
                        <p className="text-sm">سعر البيع: {item.sellingPrice.toFixed(2)}</p>
                    </div>
                    <div className="col-span-2 pt-7">
                        <p className="text-sm font-semibold">الإجمالي: {(item.quantity * item.sellingPrice).toFixed(2)}</p>
                    </div>
                    <div className="col-span-1 flex items-end">
                        <Button type="button" variant="danger" onClick={() => handleRemoveItem(index)} className="!p-2">X</Button>
                    </div>
                </div>
            ))}
        </div>
        <Button type="button" onClick={handleAddItem}>إضافة منتج</Button>
        
        <hr />
        
        <div className="text-left">
            <h4 className="text-xl font-bold">الإجمالي: {totalAmount.toFixed(2)} جنيه</h4>
        </div>

        <div className="flex justify-end space-x-4 space-x-reverse">
            <Button type="button" variant="secondary" onClick={onClose}>إلغاء</Button>
            <Button type="submit">حفظ الفاتورة</Button>
        </div>
    </form>
  );
};

export default OrderForm;
