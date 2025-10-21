import React from 'react';
import { User } from '../types';
import { Button } from './common/Button';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onSwitchToAdmin?: () => void;
  isAdminView?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout, onSwitchToAdmin, isAdminView }) => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold text-indigo-600">نظام إدارة الطلبات</h1>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <span className="text-gray-700 ml-4 hidden sm:block">مرحباً, {user.name}</span>
            {user.role === 'Admin' && onSwitchToAdmin && (
               <Button onClick={onSwitchToAdmin} variant="secondary">
                {isAdminView ? 'عرض الفواتير' : 'لوحة تحكم المدير'}
              </Button>
            )}
            <Button onClick={onLogout} variant="secondary">
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
