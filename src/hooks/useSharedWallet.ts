import { useContext } from 'react';
import { WalletContext } from '../providers/wallet/walletContextDef';
import type { WalletContextValue } from '../providers/wallet/walletContextDef';

export function useSharedWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useSharedWallet must be used within WalletStateProvider');
  return ctx;
}
