import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalStorageWalletProvider } from '../../providers/wallet/LocalStorageWalletProvider';
import type { DualWalletState } from '../../engine/types';
import { STARTING_TOKENS, STARTING_COINS } from '../../engine/constants';

const mockStorage: Record<string, string> = {};

beforeEach(() => {
  Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => mockStorage[key] ?? null,
    setItem: (key: string, value: string) => { mockStorage[key] = value; },
    removeItem: (key: string) => { delete mockStorage[key]; },
    clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); },
  });
});

describe('LocalStorageWalletProvider', () => {
  const provider = new LocalStorageWalletProvider();

  it('returns empty dual wallet when nothing is stored', async () => {
    const wallet = await provider.getWallet();
    expect(wallet).toEqual({
      tokens: STARTING_TOKENS,
      coins: STARTING_COINS,
      totalTokensEarned: STARTING_TOKENS,
      totalTokensSpent: 0,
      totalCoinsEarned: 0,
      totalCoinsSpent: 0,
      transactions: [],
    });
  });

  it('saves and retrieves dual wallet (round-trip)', async () => {
    const wallet: DualWalletState = {
      tokens: 8,
      coins: 100,
      totalTokensEarned: 12,
      totalTokensSpent: 4,
      totalCoinsEarned: 150,
      totalCoinsSpent: 50,
      transactions: [
        { type: 'earn', currency: 'coins', amount: 150, reason: 'puzzle', timestamp: '2024-01-01T00:00:00.000Z' },
        { type: 'spend', currency: 'coins', amount: 50, reason: 'hint', timestamp: '2024-01-02T00:00:00.000Z' },
      ],
    };
    await provider.saveWallet(wallet);
    const result = await provider.getWallet();
    expect(result).toEqual(wallet);
  });

  it('migrates v1 single-currency wallet to dual wallet', async () => {
    const v1Wallet = {
      coins: 75,
      totalEarned: 100,
      totalSpent: 25,
      transactions: [
        { type: 'earn', amount: 100, reason: 'puzzle', timestamp: '2024-01-01T00:00:00.000Z' },
        { type: 'spend', amount: 25, reason: 'hint', timestamp: '2024-01-02T00:00:00.000Z' },
      ],
    };
    mockStorage['nonogram-wallet'] = JSON.stringify(v1Wallet);

    const wallet = await provider.getWallet();
    expect(wallet.tokens).toBe(STARTING_TOKENS);
    expect(wallet.coins).toBe(75);
    expect(wallet.totalTokensEarned).toBe(STARTING_TOKENS);
    expect(wallet.totalTokensSpent).toBe(0);
    expect(wallet.totalCoinsEarned).toBe(100);
    expect(wallet.totalCoinsSpent).toBe(25);
    expect(wallet.transactions).toHaveLength(2);
    expect(wallet.transactions[0]).toMatchObject({
      type: 'earn',
      currency: 'coins',
      amount: 100,
    });
  });

  it('persists migrated wallet back to localStorage', async () => {
    const v1Wallet = { coins: 50, totalEarned: 50, totalSpent: 0, transactions: [] };
    mockStorage['nonogram-wallet'] = JSON.stringify(v1Wallet);

    await provider.getWallet();
    const wallet = await provider.getWallet();
    expect(wallet.tokens).toBe(STARTING_TOKENS);
    expect(wallet.coins).toBe(50);
  });
});
