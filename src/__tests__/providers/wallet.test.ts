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

  it('returns empty dual wallet for legacy single-currency data', async () => {
    mockStorage['nonogram-wallet'] = JSON.stringify({
      coins: 100, totalEarned: 150, totalSpent: 50, transactions: [],
    });
    const wallet = await provider.getWallet();
    expect(wallet.tokens).toBe(STARTING_TOKENS);
    // Legacy coins are preserved during migration
    expect(wallet.coins).toBe(100);
  });
});
