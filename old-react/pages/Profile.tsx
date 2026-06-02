import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, FileText, Activity, Info } from 'lucide-react';
import Layout from '@/components/Layout';
import { useAppStore } from '@/store';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const healthRecords = useAppStore((state) => state.healthRecords);
  const logout = useAppStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: FileText, label: '历史记录', path: '/records' },
    { icon: Activity, label: '健康数据', path: '/health-data' },
    { icon: Settings, label: '设置', path: '/settings' },
    { icon: Info, label: '关于我们', path: '/about' },
  ];

  return (
    <Layout>
      {/* 用户信息 */}
      <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
            <User className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{user?.name || '用户'}</h1>
            <p className="text-primary-100 text-sm mt-1">{user?.username}</p>
          </div>
        </div>
      </div>

      {/* 统计数据 */}
      <div className="p-4 -mt-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-sm font-semibold text-gray-600 mb-4">数据统计</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{healthRecords.length}</p>
              <p className="text-xs text-gray-500 mt-1">健康记录</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {healthRecords.length > 0 ? (
                  new Date(healthRecords[healthRecords.length - 1].createdAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
                ) : '-'}
              </p>
              <p className="text-xs text-gray-500 mt-1">最近记录</p>
            </div>
          </div>
        </div>
      </div>

      {/* 功能菜单 */}
      <div className="p-4">
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full px-4 py-4 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors ${
                  index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <Icon className="w-5 h-5 text-gray-600" />
                </div>
                <span className="font-medium text-gray-700">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 退出登录 */}
      <div className="p-4">
        <button
          onClick={handleLogout}
          className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-4 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          退出登录
        </button>
      </div>
    </Layout>
  );
};

export default Profile;
