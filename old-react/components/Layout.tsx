import React from 'react';
import { useAppStore } from '@/store';
import BottomNav from './BottomNav';

interface LayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showNav = true }) => {
  const isLoggedIn = useAppStore((state) => state.isLoggedIn);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <main className="max-w-md mx-auto min-h-screen">
        {children}
      </main>
      {showNav && isLoggedIn && <BottomNav />}
    </div>
  );
};

export default Layout;
