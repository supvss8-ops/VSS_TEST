import React, { useState } from 'react';
import { loginWithUsernameAndPassword } from '../firebaseService';
import { Button } from './common/Button';
import { Input } from './common/Input';
import { User } from '../types';

interface LoginProps {
    onLoginSuccess: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await loginWithUsernameAndPassword(username, password);
      if (user) {
        onLoginSuccess(user);
      } else {
        setError('اسم المستخدم أو كلمة المرور غير صحيحة.');
      }
    } catch (err: any) {
      setError(err.message || 'فشل في تسجيل الدخول.');
      console.error(err);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            تسجيل الدخول
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <Input
                label="اسم المستخدم"
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="rounded-t-md"
              />
            </div>
            <div>
              <Input
                label="كلمة المرور"
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-b-md"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;