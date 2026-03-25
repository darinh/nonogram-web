/**
 * Seed Puzzles Script
 *
 * Seeds or updates puzzle data in Firestore from bundled puzzle definitions.
 * Idempotent — uses set() with merge so it can be run repeatedly.
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json npx tsx scripts/firebase/seed-puzzles.ts
 *   FIRESTORE_EMULATOR_HOST=localhost:8080 npx tsx scripts/firebase/seed-puzzles.ts
 */

import type { PuzzleDefinition } from '../../src/engine/types.js';
import { bundledPuzzles } from '../../src/data/puzzles/index.js';

export interface SeedPuzzleStats {
  created: number;
  updated: number;
}

export async function seedPuzzles(
  db: FirebaseFirestore.Firestore,
): Promise<SeedPuzzleStats> {
  console.log('\n🧩 Seeding puzzles...');

  const stats: SeedPuzzleStats = { created: 0, updated: 0 };
  const collection = db.collection('puzzles');

  // Process in batches of 500 (Firestore batch limit)
  const batchSize = 500;
  for (let i = 0; i < bundledPuzzles.length; i += batchSize) {
    const chunk = bundledPuzzles.slice(i, i + batchSize);
    const batch = db.batch();

    for (const puzzle of chunk) {
      const docRef = collection.doc(puzzle.id);
      const existing = await docRef.get();

      const data: Record<string, unknown> = {
        title: puzzle.title,
        size: puzzle.size,
        solution: puzzle.solution,
        rowClues: puzzle.rowClues,
        colClues: puzzle.colClues,
        source: puzzle.source ?? 'bundled',
        updatedAt: new Date().toISOString(),
      };

      if (puzzle.difficulty) data.difficulty = puzzle.difficulty;
      if (puzzle.description) data.description = puzzle.description;

      if (existing.exists) {
        stats.updated++;
      } else {
        data.createdAt = new Date().toISOString();
        stats.created++;
      }

      batch.set(docRef, data, { merge: true });
    }

    await batch.commit();
  }

  console.log(`  ✓ ${stats.created} created, ${stats.updated} updated (${bundledPuzzles.length} total)`);
  return stats;
}

// Allow running directly
const isMain = process.argv[1]?.endsWith('seed-puzzles.ts') ||
  process.argv[1]?.endsWith('seed-puzzles.js');

if (isMain) {
  const { getAdminFirestore } = await import('./admin.js');
  const db = getAdminFirestore();

  seedPuzzles(db)
    .then((stats) => {
      console.log(`\n✅ Puzzle seeding complete: ${stats.created} created, ${stats.updated} updated`);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Puzzle seeding failed:', err);
      process.exit(1);
    });
}
