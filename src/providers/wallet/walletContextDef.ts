import { createContext } from 'react';
import type { DualWalletState } from '../../engine/types';

export interface WalletContextValue {
  wallet: DualWalletState;
  earnTokens: (amount: number, reason: string) => Promise<void>;
  spendTokens: (amount: number, reason: string) => Promise<boolean>;
  earnCoins: (amount: number, reason: string) => Promise<void>;
  spendCoins: (amount: number, reason: string) => Promise<boolean>;
  loading: boolean;
}

export const WalletContext = createContext<WalletContextValue | null>(null);
