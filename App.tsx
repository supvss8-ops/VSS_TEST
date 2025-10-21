import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import { User, Order, Product, Customer } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import { useCollection, initializeUsersIfEmpty } from './firebaseService';

type View = 'dashboard' | 'admin';

function App() {
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
  const [view, setView] = useState<View>('dashboard');

  // Initialize users on first load
  useEffect(() => {
    initializeUsersIfEmpty();
  }, []);
  
  const { data: users, loading: usersLoading } = useCollection<User>('users');
  const { data: products, loading: productsLoading } = useCollection<Product>('products');
  const { data: customers, loading: customersLoading } = useCollection<Customer>('customers');
  const { data: orders, loading: ordersLoading } = useCollection<Order>('orders');


  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleNavigate = (path: View) => {
    setView(path);
  };

  const isLoading = usersLoading || productsLoading || customersLoading || ordersLoading;

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }
  
  if (isLoading) {
      return (
          <div className="min-h-screen flex items-center justify-center">
              <p>جاري تحميل البيانات...</p>
          </div>
      )
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header currentUser={currentUser} onNavigate={handleNavigate} onLogout={handleLogout} />
      <main>
        {view === 'dashboard' && <Dashboard orders={orders} products={products} customers={customers} currentUser={currentUser} />}
        {view === 'admin' && currentUser.role === 'Admin' && (
            <AdminPanel users={users} products={products} customers={customers} orders={orders} />
        )}
        {view === 'admin' && currentUser.role !== 'Admin' && (
            <div className="text-center p-8">
                <p>ليس لديك صلاحية الوصول لهذه الصفحة.</p>
            </div>
        )}
      </main>
    </div>
  );
}

export default App;
