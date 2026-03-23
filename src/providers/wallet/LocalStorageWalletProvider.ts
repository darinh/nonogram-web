import type { WalletState } from '../../engine/types';
import type { WalletProvider } from './WalletProvider';
import { createEmptyWallet } from '../../engine/coins';

const STORAGE_KEY = 'nonogram-wallet';

export class LocalStorageWalletProvider implements WalletProvider {
  async getWallet(): Promise<WalletState> {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : createEmptyWallet();
    } catch {
      return createEmptyWallet();
    }
  }

  async saveWallet(wallet: WalletState): Promise<void> {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wallet));
  }
}
