import type { WalletState } from '../../engine/types';

export interface WalletProvider {
  getWallet(): Promise<WalletState>;
  saveWallet(wallet: WalletState): Promise<void>;
}
