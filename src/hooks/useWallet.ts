import { useState, useEffect, useCallback } from 'react';
import type { DualWalletState } from '../engine/types';
import { useWalletProvider } from '../providers/useProviders';
import {
  earnTokens as engineEarnTokens,
  spendTokens as engineSpendTokens,
  earnDualCoins,
  spendDualCoins,
  createEmptyDualWallet,
} from '../engine/economy';

export function useWallet() {
  const provider = useWalletProvider();
  const [wallet, setWallet] = useState<DualWalletState>(createEmptyDualWallet());
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

  const earnTokens = useCallback(
    async (amount: number, reason: string) => {
      const updated = engineEarnTokens(wallet, amount, reason);
      await provider.saveWallet(updated);
      setWallet(updated);
    },
    [wallet, provider],
  );

  const spendTokens = useCallback(
    async (amount: number, reason: string): Promise<boolean> => {
      const updated = engineSpendTokens(wallet, amount, reason);
      if (!updated) return false;
      await provider.saveWallet(updated);
      setWallet(updated);
      return true;
    },
    [wallet, provider],
  );

  const earnCoins = useCallback(
    async (amount: number, reason: string) => {
      const updated = earnDualCoins(wallet, amount, reason);
      await provider.saveWallet(updated);
      setWallet(updated);
    },
    [wallet, provider],
  );

  const spendCoins = useCallback(
    async (amount: number, reason: string): Promise<boolean> => {
      const updated = spendDualCoins(wallet, amount, reason);
      if (!updated) return false;
      await provider.saveWallet(updated);
      setWallet(updated);
      return true;
    },
    [wallet, provider],
  );

  return { wallet, earnTokens, spendTokens, earnCoins, spendCoins, loading };
}
