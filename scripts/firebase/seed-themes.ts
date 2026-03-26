/**
 * Seed Themes Script
 *
 * Seeds or updates theme data in Firestore from bundled theme definitions.
 * Writes each theme as a document in `themes/{themeId}` and its grid layout
 * as a subcollection `themes/{themeId}/gridCells/{position}`.
 * Idempotent — uses set() with merge so it can be run repeatedly.
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json npx tsx scripts/firebase/seed-themes.ts
 *   FIRESTORE_EMULATOR_HOST=localhost:8080 npx tsx scripts/firebase/seed-themes.ts
 */

import { bundledThemes } from '../../src/data/themes/index.js';

export interface SeedThemeStats {
  created: number;
  updated: number;
  puzzlesSeeded: number;
}

export async function seedThemes(
  db: FirebaseFirestore.Firestore,
): Promise<SeedThemeStats> {
  console.log('\n🎨 Seeding themes...');

  const stats: SeedThemeStats = { created: 0, updated: 0, puzzlesSeeded: 0 };
  const collection = db.collection('themes');

  for (const theme of bundledThemes) {
    const docRef = collection.doc(theme.id);
    const existing = await docRef.get();

    const themeData: Record<string, unknown> = {
      title: theme.title,
      description: theme.description,
      backgroundImage: theme.backgroundImage,
      gridSize: theme.gridLayout.length,
      updatedAt: new Date().toISOString(),
    };

    if (existing.exists) {
      stats.updated++;
    } else {
      themeData.createdAt = new Date().toISOString();
      stats.created++;
    }

    await docRef.set(themeData, { merge: true });

    // Seed grid layout as subcollection
    const batchSize = 500;
    for (let i = 0; i < theme.gridLayout.length; i += batchSize) {
      const chunk = theme.gridLayout.slice(i, i + batchSize);
      const batch = db.batch();

      for (const cell of chunk) {
        const cellRef = docRef.collection('gridCells').doc(String(cell.position));
        batch.set(
          cellRef,
          {
            position: cell.position,
            puzzleId: cell.puzzleId,
            difficulty: cell.difficulty,
          },
          { merge: true },
        );
        stats.puzzlesSeeded++;
      }

      await batch.commit();
    }

    console.log(`  ✓ Theme "${theme.title}" — ${theme.gridLayout.length} grid cells`);
  }

  console.log(`  ✓ ${stats.created} created, ${stats.updated} updated (${bundledThemes.length} total)`);
  return stats;
}

// Allow running directly
const isMain = process.argv[1]?.endsWith('seed-themes.ts') ||
  process.argv[1]?.endsWith('seed-themes.js');

if (isMain) {
  const { getAdminFirestore } = await import('./admin.js');
  const db = getAdminFirestore();

  seedThemes(db)
    .then((stats) => {
      console.log(`\n✅ Theme seeding complete: ${stats.created} created, ${stats.updated} updated`);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Theme seeding failed:', err);
      process.exit(1);
    });
}
