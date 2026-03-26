import { createContext } from 'react';
import type { WalletState } from '../../engine/types';

export interface WalletContextValue {
  wallet: WalletState;
  earn: (amount: number, reason: string) => Promise<void>;
  spend: (amount: number, reason: string) => Promise<boolean>;
  loading: boolean;
}

export const WalletContext = createContext<WalletContextValue | null>(null);
