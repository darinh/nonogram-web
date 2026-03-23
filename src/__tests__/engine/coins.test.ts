import { describe, it, expect } from 'vitest';
import { calculateReward, earnCoins, spendCoins, createEmptyWallet } from '../../engine/coins';
import type { WalletState } from '../../engine/types';

describe('createEmptyWallet', () => {
  it('returns a wallet with zero balances and no transactions', () => {
    const wallet = createEmptyWallet();
    expect(wallet).toEqual({ coins: 0, totalEarned: 0, totalSpent: 0, transactions: [] });
  });
});

describe('calculateReward', () => {
  it('returns correct reward for each difficulty', () => {
    expect(calculateReward('blue')).toBe(5);
    expect(calculateReward('green')).toBe(10);
    expect(calculateReward('yellow')).toBe(20);
    expect(calculateReward('orange')).toBe(35);
    expect(calculateReward('red')).toBe(50);
  });
});

describe('earnCoins', () => {
  it('adds coins and records a transaction', () => {
    const wallet = createEmptyWallet();
    const updated = earnCoins(wallet, 10, 'puzzle complete');
    expect(updated.coins).toBe(10);
    expect(updated.totalEarned).toBe(10);
    expect(updated.totalSpent).toBe(0);
    expect(updated.transactions).toHaveLength(1);
    expect(updated.transactions[0].type).toBe('earn');
    expect(updated.transactions[0].amount).toBe(10);
    expect(updated.transactions[0].reason).toBe('puzzle complete');
  });

  it('does not mutate the original wallet', () => {
    const wallet = createEmptyWallet();
    earnCoins(wallet, 10, 'test');
    expect(wallet.coins).toBe(0);
    expect(wallet.transactions).toHaveLength(0);
  });

  it('trims transactions to MAX_TRANSACTIONS', () => {
    let wallet: WalletState = createEmptyWallet();
    for (let i = 0; i < 105; i++) {
      wallet = earnCoins(wallet, 1, `tx-${i}`);
    }
    expect(wallet.transactions).toHaveLength(100);
    expect(wallet.transactions[0].reason).toBe('tx-104');
  });
});

describe('spendCoins', () => {
  it('deducts coins and records a transaction', () => {
    const wallet = earnCoins(createEmptyWallet(), 50, 'earned');
    const updated = spendCoins(wallet, 20, 'hint');
    expect(updated).not.toBeNull();
    expect(updated!.coins).toBe(30);
    expect(updated!.totalSpent).toBe(20);
    expect(updated!.transactions[0].type).toBe('spend');
  });

  it('returns null for insufficient funds', () => {
    const wallet = earnCoins(createEmptyWallet(), 5, 'earned');
    const result = spendCoins(wallet, 10, 'too expensive');
    expect(result).toBeNull();
  });

  it('allows spending exact balance', () => {
    const wallet = earnCoins(createEmptyWallet(), 25, 'earned');
    const result = spendCoins(wallet, 25, 'all in');
    expect(result).not.toBeNull();
    expect(result!.coins).toBe(0);
  });
});
