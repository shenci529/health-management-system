import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Activity, 
  FileText, 
  BookOpen, 
  User, 
  Heart, 
  Footprints 
} from 'lucide-react';

const BottomNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: '首页' },
    { path: '/record', icon: FileText, label: '记录' },
    { path: '/assessment', icon: Activity, label: '评估' },
    { path: '/knowledge', icon: BookOpen, label: '知识' },
    { path: '/exercise', icon: Footprints, label: '运动' },
    { path: '/health-log', icon: Heart, label: '日志' },
    { path: '/profile', icon: User, label: '我的' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 safe-area-bottom">
      <div className="max-w-md mx-auto">
        <div className="flex justify-around items-center h-20">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center py-2 px-2 ${
                  isActive ? 'text-primary' : 'text-gray-500'
                }`}
              >
                <item.icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
