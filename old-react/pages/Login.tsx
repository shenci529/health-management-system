import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, LogIn } from 'lucide-react';
import Layout from '@/components/Layout';
import { useAppStore } from '@/store';

// 固定的用户名和密码
const FIXED_USERNAME = 'admin';
const FIXED_PASSWORD = 'admin123';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const login = useAppStore((state) => state.login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // 验证固定的用户名和密码
    if (username === FIXED_USERNAME && password === FIXED_PASSWORD) {
      login({
        id: 1,
        username: FIXED_USERNAME,
        name: '管理员',
        age: 18,
        role: 'user',
      });
      navigate('/');
    } else {
      setError('用户名或密码错误');
    }
  };

  return (
    <Layout showNav={false}>
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-primary-light to-primary">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">健康管理系统</h1>
            <p className="text-gray-500">请登录您的账号</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                用户名
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="请输入用户名"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="请输入密码"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              登录
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>用户名: admin</p>
            <p>密码: admin123</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
