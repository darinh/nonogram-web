import type { DualWalletState } from '../../engine/types';

export interface WalletProvider {
  getWallet(): Promise<DualWalletState>;
  saveWallet(wallet: DualWalletState): Promise<void>;
}
