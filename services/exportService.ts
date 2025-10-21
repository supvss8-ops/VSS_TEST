import { Order, Product } from '../types';
import * as XLSX from 'xlsx';

export const exportToExcel = (orders: Order[], products: Product[]) => {
  // Create a mapping from productId to productName for easy lookup
  const productMap = new Map<string, string>();
  products.forEach(p => productMap.set(p.id, p.name));

  const dataToExport = orders.flatMap(order => 
    order.items.map(item => ({
      'رقم الفاتورة': order.invoiceNumber,
      'تاريخ الفاتورة': order.invoiceDate,
      'اسم العميل': order.customerName,
      'هاتف العميل': order.customerPhone,
      'عنوان العميل': order.customerAddress,
      'كود المنتج': item.productId,
      'اسم المنتج': item.productName || productMap.get(item.productId) || 'غير متوفر', // Fallback
      'الكمية': item.quantity,
      'سعر التكلفة': item.costPrice,
      'سعر البيع': item.sellingPrice,
      'إجمالي الصنف': item.quantity * item.sellingPrice,
      'حالة الفاتورة': order.status,
      'اسم المندوب': order.createdByName,
    }))
  );

  if (dataToExport.length === 0) {
    alert('لا توجد بيانات لتصديرها.');
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'الفواتير');

  // Set column widths for better readability (optional)
  const colWidths = [
    { wch: 15 }, // رقم الفاتورة
    { wch: 15 }, // تاريخ الفاتورة
    { wch: 25 }, // اسم العميل
    { wch: 15 }, // هاتف العميل
    { wch: 30 }, // عنوان العميل
    { wch: 15 }, // كود المنتج
    { wch: 30 }, // اسم المنتج
    { wch: 10 }, // الكمية
    { wch: 15 }, // سعر التكلفة
    { wch: 15 }, // سعر البيع
    { wch: 20 }, // إجمالي الصنف
    { wch: 15 }, // حالة الفاتورة
    { wch: 20 }, // اسم المندوب
  ];
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, 'Orders_Export.xlsx');
};
