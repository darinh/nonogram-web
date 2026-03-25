import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { WalletState } from '../../engine/types';
import { earnCoins, spendCoins, createEmptyWallet } from '../../engine/coins';
import { useWalletProvider } from '../useProviders';

interface WalletContextValue {
  wallet: WalletState;
  earn: (amount: number, reason: string) => Promise<void>;
  spend: (amount: number, reason: string) => Promise<boolean>;
  loading: boolean;
}

const WalletStateContext = createContext<WalletContextValue | null>(null);

export function WalletStateProvider({ children }: { children: ReactNode }) {
  const provider = useWalletProvider();
  const [wallet, setWallet] = useState<WalletState>(createEmptyWallet());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const w = await provider.getWallet();
      setWallet(w);
      setLoading(false);
    }
    load();
  }, [provider]);

  const earn = useCallback(
    async (amount: number, reason: string) => {
      setWallet(prev => {
        const updated = earnCoins(prev, amount, reason);
        provider.saveWallet(updated);
        return updated;
      });
    },
    [provider],
  );

  const spend = useCallback(
    async (amount: number, reason: string): Promise<boolean> => {
      let success = false;
      setWallet(prev => {
        const updated = spendCoins(prev, amount, reason);
        if (!updated) return prev;
        success = true;
        provider.saveWallet(updated);
        return updated;
      });
      return success;
    },
    [provider],
  );

  return (
    <WalletStateContext.Provider value={{ wallet, earn, spend, loading }}>
      {children}
    </WalletStateContext.Provider>
  );
}

export function useSharedWallet(): WalletContextValue {
  const ctx = useContext(WalletStateContext);
  if (!ctx) throw new Error('WalletStateProvider not found in component tree');
  return ctx;
}
