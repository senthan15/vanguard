import React from 'react';
import { AppHeader } from './AppHeader';
import { useWalletContext } from '@/contexts/WalletContext';
import { Navigate } from 'react-router-dom';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { wallet } = useWalletContext();

  if (!wallet.isConnected) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <AppHeader />
      <main className="flex-1 overflow-auto pt-16">
        <div className="container py-8 px-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
