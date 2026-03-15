import React, { createContext, useContext, ReactNode } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { WalletState } from '@/types/vanguard';

interface WalletContextType {
  wallet: WalletState;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  isPolygonAmoy: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const walletHook = useWallet();

  return (
    <WalletContext.Provider value={walletHook}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
};
