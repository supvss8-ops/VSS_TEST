import { Order, Product, User } from '../types';

declare const XLSX: any;

export const exportToExcel = (orders: Order[], products: Product[], users: User[]) => {
  const productMap = new Map(products.map(p => [p.sku, p.name]));
  const userMap = new Map(users.map(u => [u.id, u.name]));

  // Sheet 1: Invoices Data
  const invoicesData = orders.map(order => {
    const totalSelling = order.items.reduce((sum, item) => sum + item.quantity * item.sellingPrice, 0);
    const totalPurchase = order.items.reduce((sum, item) => sum + item.quantity * item.purchasePrice, 0);
    return {
      'رقم الفاتورة': order.invoiceNumber,
      'تاريخ الفاتورة': order.invoiceDate,
      'اسم العميل': order.customerName,
      'هاتف العميل': order.customerPhone,
      'عنوان العميل': order.customerAddress,
      'إجمالي البيع': totalSelling,
      'إجمالي الشراء': totalPurchase,
      'الربح': totalSelling - totalPurchase,
      'حالة الطلب': order.status,
      'تم الإنشاء بواسطة': userMap.get(order.createdBy) || order.createdBy,
    };
  });

  // Sheet 2: Invoice Items Data
  const itemsData = orders.flatMap(order => 
    order.items.map(item => ({
      'رقم الفاتورة': order.invoiceNumber, // Key for linking
      'تاريخ الفاتورة': order.invoiceDate,
      'كود المنتج (SKU)': item.sku,
      'اسم المنتج': productMap.get(item.sku) || 'غير معروف',
      'الكمية': item.quantity,
      'سعر الشراء للقطعة': item.purchasePrice,
      'سعر البيع للقطعة': item.sellingPrice,
      'إجمالي سعر الشراء للمنتج': item.quantity * item.purchasePrice,
      'إجمالي سعر البيع للمنتج': item.quantity * item.sellingPrice,
    }))
  );

  const wb = XLSX.utils.book_new();
  const wsInvoices = XLSX.utils.json_to_sheet(invoicesData);
  const wsItems = XLSX.utils.json_to_sheet(itemsData);

  XLSX.utils.book_append_sheet(wb, wsInvoices, 'الفواتير');
  XLSX.utils.book_append_sheet(wb, wsItems, 'تفاصيل الفواتير');
  
  XLSX.writeFile(wb, 'Orders_Report.xlsx');
};
