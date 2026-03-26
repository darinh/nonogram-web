import { useState, useEffect, useCallback, type ReactNode } from 'react';
import type { DualWalletState } from '../../engine/types';
import {
  earnTokens as engineEarnTokens,
  spendTokens as engineSpendTokens,
  earnDualCoins,
  spendDualCoins,
  createEmptyDualWallet,
} from '../../engine/economy';
import { useWalletProvider } from '../useProviders';
import { WalletContext } from './walletContextDef';

export function WalletStateProvider({ children }: { children: ReactNode }) {
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
      setWallet((prev: DualWalletState) => {
        const updated = engineEarnTokens(prev, amount, reason);
        provider.saveWallet(updated);
        return updated;
      });
    },
    [provider],
  );

  const spendTokens = useCallback(
    async (amount: number, reason: string): Promise<boolean> => {
      let success = false;
      setWallet((prev: DualWalletState) => {
        const updated = engineSpendTokens(prev, amount, reason);
        if (!updated) return prev;
        success = true;
        provider.saveWallet(updated);
        return updated;
      });
      return success;
    },
    [provider],
  );

  const earnCoins = useCallback(
    async (amount: number, reason: string) => {
      setWallet((prev: DualWalletState) => {
        const updated = earnDualCoins(prev, amount, reason);
        provider.saveWallet(updated);
        return updated;
      });
    },
    [provider],
  );

  const spendCoins = useCallback(
    async (amount: number, reason: string): Promise<boolean> => {
      let success = false;
      setWallet((prev: DualWalletState) => {
        const updated = spendDualCoins(prev, amount, reason);
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
    <WalletContext.Provider value={{ wallet, earnTokens, spendTokens, earnCoins, spendCoins, loading }}>
      {children}
    </WalletContext.Provider>
  );
}
