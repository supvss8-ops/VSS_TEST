import React from 'react';
import { User } from '../types';
import { Button } from './common/Button';

interface HeaderProps {
  currentUser: User | null;
  onNavigate: (path: 'dashboard' | 'admin') => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onNavigate, onLogout }) => {

  return (
    <header className="bg-white shadow-sm" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold text-indigo-600">نظام إدارة الطلبات</h1>
          </div>
          {currentUser && (
            <div className="flex items-center space-x-4 space-x-reverse">
                <span className="text-sm font-medium text-gray-700">مرحباً, {currentUser.name}</span>
                 <Button variant="secondary" onClick={() => onNavigate('dashboard')}>الفواتير</Button>
                {currentUser.role === 'Admin' && (
                    <Button variant="secondary" onClick={() => onNavigate('admin')}>لوحة الأدمن</Button>
                )}
              <Button onClick={onLogout} variant="danger">
                تسجيل الخروج
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;