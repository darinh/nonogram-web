import { useState, useEffect, useCallback } from 'react';
import type { WalletState } from '../engine/types';
import { useWalletProvider } from '../providers/useProviders';
import { earnCoins, spendCoins, createEmptyWallet } from '../engine/coins';

export function useWallet() {
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
      const updated = earnCoins(wallet, amount, reason);
      await provider.saveWallet(updated);
      setWallet(updated);
    },
    [wallet, provider],
  );

  const spend = useCallback(
    async (amount: number, reason: string): Promise<boolean> => {
      const updated = spendCoins(wallet, amount, reason);
      if (!updated) return false;
      await provider.saveWallet(updated);
      setWallet(updated);
      return true;
    },
    [wallet, provider],
  );

  return { wallet, earn, spend, loading };
}
