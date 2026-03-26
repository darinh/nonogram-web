/**
 * Firebase Setup Script
 *
 * Initializes Firestore with collections structure, puzzle data, and theme data.
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json npx tsx scripts/firebase/setup.ts
 *   FIRESTORE_EMULATOR_HOST=localhost:8080 npx tsx scripts/firebase/setup.ts
 */

import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { seedPuzzles } from './seed-puzzles.js';
import { seedThemes } from './seed-themes.js';

function initAdmin() {
  const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
  if (emulatorHost) {
    console.log(`Using Firestore emulator at ${emulatorHost}`);
    return initializeApp({ projectId: 'nonogram-local' });
  }

  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credPath) {
    console.error(
      'Error: Set GOOGLE_APPLICATION_CREDENTIALS or FIRESTORE_EMULATOR_HOST',
    );
    process.exit(1);
  }

  return initializeApp({
    credential: cert(credPath as string & ServiceAccount),
  });
}

async function createCollectionStructure(
  db: FirebaseFirestore.Firestore,
): Promise<void> {
  console.log('\n📂 Ensuring collection structure...');

  // Create a metadata doc so the _migrations collection exists
  await db.collection('_migrations').doc('_metadata').set(
    {
      createdAt: new Date().toISOString(),
      description: 'Migration tracking collection',
    },
    { merge: true },
  );

  console.log('  ✓ _migrations collection ready');
}

async function setup(): Promise<void> {
  console.log('🚀 Setting up Firestore for Nonogram...\n');

  const app = initAdmin();
  const db = getFirestore(app);

  await createCollectionStructure(db);

  const puzzleStats = await seedPuzzles(db);
  const themeStats = await seedThemes(db);

  console.log('\n📊 Setup Summary:');
  console.log(`  Puzzles: ${puzzleStats.created} created, ${puzzleStats.updated} updated`);
  console.log(`  Themes:  ${themeStats.created} created, ${themeStats.updated} updated`);
  console.log(`  Theme puzzles: ${themeStats.puzzlesSeeded} seeded`);
  console.log('\n✅ Setup complete!');

  process.exit(0);
}

setup().catch((err) => {
  console.error('Setup failed:', err);
  process.exit(1);
});
