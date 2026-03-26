/**
 * Migration Runner
 *
 * Applies numbered migrations in order, tracking which have been applied
 * in a `_migrations` collection. Skips already-applied migrations.
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json npx tsx scripts/firebase/migrate.ts
 *   FIRESTORE_EMULATOR_HOST=localhost:8080 npx tsx scripts/firebase/migrate.ts
 */

import { getAdminFirestore } from './admin.js';

interface Migration {
  id: string;
  name: string;
  fn: (db: FirebaseFirestore.Firestore) => Promise<void>;
}

const migrations: Migration[] = [
  {
    id: '001',
    name: 'initial-schema',
    fn: async (db) => {
      // Ensure base collections exist with metadata documents
      const collections = ['puzzles', 'themes', 'users', 'leaderboards'] as const;

      for (const name of collections) {
        await db.collection(name).doc('_metadata').set(
          {
            createdAt: new Date().toISOString(),
            description: `${name} collection`,
          },
          { merge: true },
        );
      }
    },
  },
  {
    id: '002',
    name: 'add-streak-fields',
    fn: async (db) => {
      // Add default streak fields to existing user documents
      const usersSnapshot = await db.collection('users').get();

      const batch = db.batch();
      let count = 0;

      for (const doc of usersSnapshot.docs) {
        if (doc.id === '_metadata') continue;

        const data = doc.data();
        if (data.currentStreak === undefined) {
          batch.update(doc.ref, {
            currentStreak: 0,
            longestStreak: 0,
            lastPlayedDate: null,
          });
          count++;
        }
      }

      if (count > 0) {
        await batch.commit();
        console.log(`    Updated ${count} user documents with streak fields`);
      }
    },
  },
];

async function getAppliedMigrations(
  db: FirebaseFirestore.Firestore,
): Promise<Set<string>> {
  const snapshot = await db.collection('_migrations').get();
  const applied = new Set<string>();

  for (const doc of snapshot.docs) {
    if (doc.id !== '_metadata') {
      applied.add(doc.id);
    }
  }

  return applied;
}

async function recordMigration(
  db: FirebaseFirestore.Firestore,
  migration: Migration,
): Promise<void> {
  await db.collection('_migrations').doc(migration.id).set({
    name: migration.name,
    appliedAt: new Date().toISOString(),
  });
}

async function migrate(): Promise<void> {
  console.log('🔄 Running migrations...\n');

  const db = getAdminFirestore();
  const applied = await getAppliedMigrations(db);

  let appliedCount = 0;
  let skippedCount = 0;

  for (const migration of migrations) {
    if (applied.has(migration.id)) {
      console.log(`  ⏭  ${migration.id}: ${migration.name} (already applied)`);
      skippedCount++;
      continue;
    }

    console.log(`  ▶  ${migration.id}: ${migration.name}...`);

    try {
      await migration.fn(db);
      await recordMigration(db, migration);
      console.log(`  ✓  ${migration.id}: ${migration.name} — applied`);
      appliedCount++;
    } catch (err) {
      console.error(`  ✗  ${migration.id}: ${migration.name} — FAILED`);
      console.error(err);
      process.exit(1);
    }
  }

  console.log(`\n📊 Migration Summary:`);
  console.log(`  Applied: ${appliedCount}`);
  console.log(`  Skipped: ${skippedCount}`);
  console.log(`  Total:   ${migrations.length}`);
  console.log('\n✅ Migrations complete!');

  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration runner failed:', err);
  process.exit(1);
});
