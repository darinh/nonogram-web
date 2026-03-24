import type { Difficulty, WalletState, CoinTransaction } from './types';
import { COIN_REWARDS, HINT_COSTS, MAX_TRANSACTIONS } from './constants';

/**
 * Get the coin reward for completing a puzzle of a given difficulty.
 */
export function calculateReward(difficulty: Difficulty): number {
  return COIN_REWARDS[difficulty];
}

/**
 * Check whether the wallet has enough coins to cover a cost.
 */
export function canAfford(wallet: WalletState, cost: number): boolean {
  return wallet.coins >= cost;
}

/**
 * Return a new WalletState with earned coins added.
 * Prepends a transaction and caps the list at MAX_TRANSACTIONS.
 */
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

/**
 * Return a new WalletState with coins deducted, or null if insufficient funds.
 * Prepends a transaction and caps the list at MAX_TRANSACTIONS.
 */
export function spendCoins(wallet: WalletState, amount: number, reason: string): WalletState | null {
  if (!canAfford(wallet, amount)) return null;
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

/**
 * Get the hint cost for a given difficulty.
 */
export function getHintCost(difficulty: Difficulty): number {
  return HINT_COSTS[difficulty];
}

/**
 * Create a fresh wallet with zero balances and no transactions.
 */
export function createEmptyWallet(): WalletState {
  return { coins: 0, totalEarned: 0, totalSpent: 0, transactions: [] };
}
