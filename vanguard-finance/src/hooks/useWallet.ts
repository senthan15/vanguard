import { useState, useCallback, useEffect } from 'react';
import { WalletState } from '@/types/vanguard';

const POLYGON_AMOY_CHAIN_ID = 80002;

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    isConnected: false,
    chainId: null,
    balance: '0',
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkConnection = useCallback(async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          const balance = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [accounts[0], 'latest'],
          });
          setWallet({
            address: accounts[0],
            isConnected: true,
            chainId: parseInt(chainId, 16),
            balance: (parseInt(balance, 16) / 1e18).toFixed(4),
          });
        }
      } catch (err) {
        console.error('Error checking connection:', err);
      }
    }
  }, []);

  const switchToPolygonAmoy = async () => {
    if (typeof window.ethereum === 'undefined') return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${POLYGON_AMOY_CHAIN_ID.toString(16)}` }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${POLYGON_AMOY_CHAIN_ID.toString(16)}`,
                chainName: 'Polygon Amoy Testnet',
                nativeCurrency: {
                  name: 'MATIC',
                  symbol: 'MATIC',
                  decimals: 18,
                },
                rpcUrls: ['https://rpc-amoy.polygon.technology/'],
                blockExplorerUrls: ['https://www.oklink.com/amoy'],
              },
            ],
          });
        } catch (addError) {
          throw addError;
        }
      } else {
        throw switchError;
      }
    }
  };

  const connect = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('Please install MetaMask to continue');
      return false;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      await switchToPolygonAmoy();

      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [accounts[0], 'latest'],
      });

      setWallet({
        address: accounts[0],
        isConnected: true,
        chainId: parseInt(chainId, 16),
        balance: (parseInt(balance, 16) / 1e18).toFixed(4),
      });

      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet({
      address: null,
      isConnected: false,
      chainId: null,
      balance: '0',
    });
  }, []);

  useEffect(() => {
    checkConnection();

    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          checkConnection();
        }
      });

      window.ethereum.on('chainChanged', () => {
        checkConnection();
      });
    }

    return () => {
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, [checkConnection, disconnect]);

  return {
    wallet,
    isConnecting,
    error,
    connect,
    disconnect,
    isPolygonAmoy: wallet.chainId === POLYGON_AMOY_CHAIN_ID,
  };
};

declare global {
  interface Window {
    ethereum?: any;
  }
}
