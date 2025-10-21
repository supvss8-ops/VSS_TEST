import React, { useState, useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { User, Product, Customer, Order } from './types';
import { INITIAL_USERS, INITIAL_PRODUCTS, INITIAL_CUSTOMERS, INITIAL_ORDERS } from './constants';
import Login from './components/Login';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';

function App() {
  const [users, setUsers] = useLocalStorage<User[]>('users', INITIAL_USERS);
  const [products, setProducts] = useLocalStorage<Product[]>('products', INITIAL_PRODUCTS);
  const [customers, setCustomers] = useLocalStorage<Customer[]>('customers', INITIAL_CUSTOMERS);
  const [orders, setOrders] = useLocalStorage<Order[]>('orders', INITIAL_ORDERS);
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
  const [view, setView] = useState<'dashboard' | 'admin'>('dashboard');

  // --- CRUD Handlers ---
  // Wrapped in useCallback to ensure functions have the latest state and prevent stale closures.

  // Orders
  const handleSaveOrder = useCallback((order: Order) => {
    setOrders(prevOrders => {
      const index = prevOrders.findIndex(o => o.invoiceNumber === order.invoiceNumber);
      if (index > -1) {
        const newOrders = [...prevOrders];
        newOrders[index] = order;
        return newOrders;
      }
      return [order, ...prevOrders];
    });
  }, [setOrders]);

  const handleDeleteOrder = useCallback((invoiceNumber: string) => {
    setOrders(prev => prev.filter(o => o.invoiceNumber !== invoiceNumber));
  }, [setOrders]);

  // Users
  const handleAddUser = useCallback((user: User) => {
    setUsers(prev => [...prev, user]);
  }, [setUsers]);

  const handleUpdateUser = useCallback((updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  }, [setUsers]);

  const handleDeleteUser = useCallback((userId: string) => {
    if (users.filter(u => u.role === 'Admin').length <= 1 && users.find(u => u.id === userId)?.role === 'Admin') {
        alert("لا يمكن حذف آخر مدير في النظام.");
        return;
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
  }, [setUsers, users]);

  // Products
  const handleAddProduct = useCallback((product: Product): boolean => {
    if (products.some(p => p.sku === product.sku)) return false;
    setProducts(prev => [...prev, product]);
    return true;
  }, [products, setProducts]);

  const handleUpdateProduct = useCallback((updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.sku === updatedProduct.sku ? updatedProduct : p));
  }, [setProducts]);

  const handleDeleteProduct = useCallback((sku: string) => {
    if (orders.some(o => o.items.some(i => i.sku === sku))) {
        alert("لا يمكن حذف المنتج لأنه مستخدم في بعض الفواتير.");
        return;
    }
    setProducts(prev => prev.filter(p => p.sku !== sku));
  }, [orders, setProducts]);
  
  // Customers
  const handleAddCustomer = useCallback((customer: Customer): boolean => {
      if (customers.some(c => c.phone === customer.phone)) return false;
      setCustomers(prev => [...prev, customer]);
      return true;
  }, [customers, setCustomers]);

  const handleUpdateCustomer = useCallback((updatedCustomer: Customer) => {
      setCustomers(prev => prev.map(c => c.phone === updatedCustomer.phone ? updatedCustomer : c));
  }, [setCustomers]);

  const handleDeleteCustomer = useCallback((phone: string) => {
      if (orders.some(o => o.customerPhone === phone)) {
          alert("لا يمكن حذف العميل لأنه مرتبط بفواتير.");
          return;
      }
      setCustomers(prev => prev.filter(c => c.phone !== phone));
  }, [orders, setCustomers]);

  // --- Auth and View Logic ---
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setView('dashboard'); // Always default to dashboard on login
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <Login users={users} onLogin={handleLogin} />;
  }
  
  const renderContent = () => {
    if (currentUser.role === 'Admin' && view === 'admin') {
      return (
        <AdminPanel
          users={users}
          onAddUser={handleAddUser}
          onUpdateUser={handleUpdateUser}
          onDeleteUser={handleDeleteUser}
          products={products}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          customers={customers}
          onAddCustomer={handleAddCustomer}
          onUpdateCustomer={handleUpdateCustomer}
          onDeleteCustomer={handleDeleteCustomer}
        />
      );
    }
    return (
      <Dashboard
        currentUser={currentUser}
        orders={orders}
        onSaveOrder={handleSaveOrder}
        onDeleteOrder={handleDeleteOrder}
        products={products}
        customers={customers}
        users={users}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        user={currentUser} 
        onLogout={handleLogout} 
        onSwitchToAdmin={currentUser.role === 'Admin' ? () => setView(v => v === 'admin' ? 'dashboard' : 'admin') : undefined}
        isAdminView={view === 'admin'}
      />
      <main>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
