import { COIN_REWARDS, MAX_TRANSACTIONS } from './constants';
import type { Difficulty, WalletState, CoinTransaction } from './types';

export function calculateReward(difficulty: Difficulty): number {
  return COIN_REWARDS[difficulty];
}

export function earnCoins(wallet: WalletState, amount: number, reason: string): WalletState {
  const transaction: CoinTransaction = {
    type: 'earn',
    amount,
    reason,
    timestamp: new Date().toISOString(),
  };
  const transactions = [transaction, ...wallet.transactions].slice(0, MAX_TRANSACTIONS);
  return {
    coins: wallet.coins + amount,
    totalEarned: wallet.totalEarned + amount,
    totalSpent: wallet.totalSpent,
    transactions,
  };
}

export function spendCoins(wallet: WalletState, amount: number, reason: string): WalletState | null {
  if (wallet.coins < amount) return null;
  const transaction: CoinTransaction = {
    type: 'spend',
    amount,
    reason,
    timestamp: new Date().toISOString(),
  };
  const transactions = [transaction, ...wallet.transactions].slice(0, MAX_TRANSACTIONS);
  return {
    coins: wallet.coins - amount,
    totalEarned: wallet.totalEarned,
    totalSpent: wallet.totalSpent + amount,
    transactions,
  };
}

export function createEmptyWallet(): WalletState {
  return { coins: 0, totalEarned: 0, totalSpent: 0, transactions: [] };
}
