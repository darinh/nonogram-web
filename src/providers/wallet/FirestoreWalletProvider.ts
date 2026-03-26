import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db as _db } from '../../firebase';
const db = _db!;
import type { DualWalletState } from '../../engine/types';
import type { WalletProvider } from './WalletProvider';
import { createEmptyDualWallet } from '../../engine/economy';

export class FirestoreWalletProvider implements WalletProvider {
  readonly uid: string;

  constructor(uid: string) {
    this.uid = uid;
  }

  async getWallet(): Promise<DualWalletState> {
    const ref = doc(db, 'users', this.uid, 'data', 'wallet');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as DualWalletState;
    }
    return createEmptyDualWallet();
  }

  async saveWallet(wallet: DualWalletState): Promise<void> {
    const ref = doc(db, 'users', this.uid, 'data', 'wallet');
    await setDoc(ref, wallet);
  }
}
