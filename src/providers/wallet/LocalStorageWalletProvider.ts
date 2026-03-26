import type { DualWalletState } from '../../engine/types';
import type { WalletProvider } from './WalletProvider';
import { createEmptyDualWallet } from '../../engine/economy';
import { STARTING_TOKENS } from '../../engine/constants';

const STORAGE_KEY = 'nonogram-wallet';

function migrateV1Wallet(data: Record<string, unknown>): DualWalletState {
  const coins = typeof data.coins === 'number' ? data.coins : 0;
  const totalEarned = typeof data.totalEarned === 'number' ? data.totalEarned : 0;
  const totalSpent = typeof data.totalSpent === 'number' ? data.totalSpent : 0;
  const oldTransactions = Array.isArray(data.transactions) ? data.transactions : [];

  return {
    tokens: STARTING_TOKENS,
    coins,
    totalTokensEarned: STARTING_TOKENS,
    totalTokensSpent: 0,
    totalCoinsEarned: totalEarned,
    totalCoinsSpent: totalSpent,
    transactions: oldTransactions.map((tx: Record<string, unknown>) => ({
      type: tx.type as 'earn' | 'spend',
      currency: 'coins' as const,
      amount: tx.amount as number,
      reason: tx.reason as string,
      timestamp: tx.timestamp as string,
    })),
  };
}

function isDualWallet(data: Record<string, unknown>): data is DualWalletState & Record<string, unknown> {
  return typeof data.tokens === 'number' && typeof data.totalTokensEarned === 'number';
}

export class LocalStorageWalletProvider implements WalletProvider {
  async getWallet(): Promise<DualWalletState> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return createEmptyDualWallet();
      const data = JSON.parse(raw) as Record<string, unknown>;
      if (isDualWallet(data)) return data as unknown as DualWalletState;
      const migrated = migrateV1Wallet(data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    } catch {
      return createEmptyDualWallet();
    }
  }

  async saveWallet(wallet: DualWalletState): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wallet));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }
}
