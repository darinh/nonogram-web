import type { DualWalletState, EconomyTransaction, Difficulty } from './types';
import {
  COIN_REWARDS,
  HINT_COSTS,
  MAX_TRANSACTIONS,
  PLAY_COST,
  REPLAY_COIN_COST,
  REPLAY_TOKEN_REWARD,
  STARTING_TOKENS,
  STARTING_COINS,
} from './constants';

// Re-export constants for convenience
export {
  PLAY_COST,
  REPLAY_COIN_COST,
  REPLAY_TOKEN_REWARD,
  STARTING_TOKENS,
  STARTING_COINS,
};

/**
 * Create a fresh dual wallet with starting balances and no transactions.
 */
export function createEmptyDualWallet(): DualWalletState {
  return {
    tokens: STARTING_TOKENS,
    coins: STARTING_COINS,
    totalTokensEarned: STARTING_TOKENS,
    totalTokensSpent: 0,
    totalCoinsEarned: 0,
    totalCoinsSpent: 0,
    transactions: [],
  };
}

/**
 * Return a new DualWalletState with earned tokens added.
 * Prepends a transaction and caps the list at MAX_TRANSACTIONS.
 */
export function earnTokens(
  wallet: DualWalletState,
  amount: number,
  reason: string,
): DualWalletState {
  const transaction: EconomyTransaction = {
    type: 'earn',
    currency: 'tokens',
    amount,
    reason,
    timestamp: new Date().toISOString(),
  };
  const transactions = [transaction, ...wallet.transactions].slice(0, MAX_TRANSACTIONS);
  return {
    ...wallet,
    tokens: wallet.tokens + amount,
    totalTokensEarned: wallet.totalTokensEarned + amount,
    transactions,
  };
}

/**
 * Return a new DualWalletState with tokens deducted, or null if insufficient funds.
 * Prepends a transaction and caps the list at MAX_TRANSACTIONS.
 */
export function spendTokens(
  wallet: DualWalletState,
  amount: number,
  reason: string,
): DualWalletState | null {
  if (wallet.tokens < amount) return null;
  const transaction: EconomyTransaction = {
    type: 'spend',
    currency: 'tokens',
    amount,
    reason,
    timestamp: new Date().toISOString(),
  };
  const transactions = [transaction, ...wallet.transactions].slice(0, MAX_TRANSACTIONS);
  return {
    ...wallet,
    tokens: wallet.tokens - amount,
    totalTokensSpent: wallet.totalTokensSpent + amount,
    transactions,
  };
}

/**
 * Return a new DualWalletState with earned coins added.
 * Prepends a transaction and caps the list at MAX_TRANSACTIONS.
 */
export function earnDualCoins(
  wallet: DualWalletState,
  amount: number,
  reason: string,
): DualWalletState {
  const transaction: EconomyTransaction = {
    type: 'earn',
    currency: 'coins',
    amount,
    reason,
    timestamp: new Date().toISOString(),
  };
  const transactions = [transaction, ...wallet.transactions].slice(0, MAX_TRANSACTIONS);
  return {
    ...wallet,
    coins: wallet.coins + amount,
    totalCoinsEarned: wallet.totalCoinsEarned + amount,
    transactions,
  };
}

/**
 * Return a new DualWalletState with coins deducted, or null if insufficient funds.
 * Prepends a transaction and caps the list at MAX_TRANSACTIONS.
 */
export function spendDualCoins(
  wallet: DualWalletState,
  amount: number,
  reason: string,
): DualWalletState | null {
  if (wallet.coins < amount) return null;
  const transaction: EconomyTransaction = {
    type: 'spend',
    currency: 'coins',
    amount,
    reason,
    timestamp: new Date().toISOString(),
  };
  const transactions = [transaction, ...wallet.transactions].slice(0, MAX_TRANSACTIONS);
  return {
    ...wallet,
    coins: wallet.coins - amount,
    totalCoinsSpent: wallet.totalCoinsSpent + amount,
    transactions,
  };
}

/**
 * Get the coin reward for completing a puzzle of a given difficulty.
 */
export function calculateCoinReward(difficulty: Difficulty): number {
  return COIN_REWARDS[difficulty];
}

/**
 * Get the hint cost (in coins) for a given difficulty.
 */
export function getHintCoinCost(difficulty: Difficulty | undefined): number {
  if (difficulty === undefined) return 8;
  return HINT_COSTS[difficulty];
}
