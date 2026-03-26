import { useState, useEffect, useCallback, type ReactNode } from 'react';
import type { WalletState } from '../../engine/types';
import { earnCoins, spendCoins, createEmptyWallet } from '../../engine/coins';
import { useWalletProvider } from '../useProviders';
import { WalletContext } from './walletContextDef';

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
      setWallet((prev: WalletState) => {
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
      setWallet((prev: WalletState) => {
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
    <WalletContext.Provider value={{ wallet, earn, spend, loading }}>
      {children}
    </WalletContext.Provider>
  );
}
