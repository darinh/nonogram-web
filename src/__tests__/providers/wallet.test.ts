import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalStorageWalletProvider } from '../../providers/wallet/LocalStorageWalletProvider';
import type { WalletState } from '../../engine/types';

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

  it('returns empty wallet when nothing is stored', async () => {
    const wallet = await provider.getWallet();
    expect(wallet).toEqual({
      coins: 0,
      totalEarned: 0,
      totalSpent: 0,
      transactions: [],
    });
  });

  it('saves and retrieves wallet (round-trip)', async () => {
    const wallet: WalletState = {
      coins: 100,
      totalEarned: 150,
      totalSpent: 50,
      transactions: [
        { type: 'earn', amount: 150, reason: 'puzzle', timestamp: '2024-01-01T00:00:00.000Z' },
        { type: 'spend', amount: 50, reason: 'hint', timestamp: '2024-01-02T00:00:00.000Z' },
      ],
    };
    await provider.saveWallet(wallet);
    const result = await provider.getWallet();
    expect(result).toEqual(wallet);
  });
});
