import React, { useState } from 'react';
import { User } from '../types';
import { Input } from './common/Input';
import { Button } from './common/Button';
import { Select } from './common/Select';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ users, onLogin }) => {
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.id === selectedUserId);
    if (user && user.password === password) {
      onLogin(user);
    } else {
      setError('كلمة المرور غير صحيحة.');
    }
  };

  const userOptions = users.map(u => ({ value: u.id, label: u.name }));

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">تسجيل الدخول</h2>
        {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-center">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-6" dir="rtl">
           <Select
              label="اختر المستخدم"
              id="user-select"
              options={userOptions}
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              required
            />
          <Input
            label="كلمة المرور"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full">
            دخول
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
