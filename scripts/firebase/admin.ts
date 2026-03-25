/**
 * Shared Firebase Admin initialization for scripts.
 */

import { initializeApp, cert, getApps, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export function getAdminFirestore(): FirebaseFirestore.Firestore {
  if (getApps().length === 0) {
    const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
    if (emulatorHost) {
      console.log(`Using Firestore emulator at ${emulatorHost}`);
      initializeApp({ projectId: 'nonogram-local' });
    } else {
      const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      if (!credPath) {
        console.error(
          'Error: Set GOOGLE_APPLICATION_CREDENTIALS or FIRESTORE_EMULATOR_HOST',
        );
        process.exit(1);
      }
      initializeApp({
        credential: cert(credPath as string & ServiceAccount),
      });
    }
  }

  return getFirestore();
}
