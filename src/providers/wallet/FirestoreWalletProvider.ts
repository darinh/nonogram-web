import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import type { WalletState } from '../../engine/types';
import type { WalletProvider } from './WalletProvider';
import { createEmptyWallet } from '../../engine/coins';

export class FirestoreWalletProvider implements WalletProvider {
  readonly uid: string;

  constructor(uid: string) {
    this.uid = uid;
  }

  async getWallet(): Promise<WalletState> {
    const ref = doc(db, 'users', this.uid, 'data', 'wallet');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as WalletState;
    }
    return createEmptyWallet();
  }

  async saveWallet(wallet: WalletState): Promise<void> {
    const ref = doc(db, 'users', this.uid, 'data', 'wallet');
    await setDoc(ref, wallet);
  }
}
