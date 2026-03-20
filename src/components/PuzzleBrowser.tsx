import { useNavigate } from 'react-router-dom';
import { usePuzzles } from '../hooks/usePuzzles';
import { useProgress } from '../hooks/useProgress';
import { downloadPuzzleFile, importPuzzle, readPuzzleFile } from '../engine/serialization';
import { usePuzzleProvider } from '../providers/ProviderContext';
import PuzzleCard from './PuzzleCard';
import styles from '../styles/PuzzleBrowser.module.css';
import type { GridSize } from '../engine/types';

export default function PuzzleBrowser() {
  const navigate = useNavigate();
  const { puzzles, loading, refresh } = usePuzzles();
  const { allProgress } = useProgress();
  const puzzleProvider = usePuzzleProvider();

  const progressMap = new Map(allProgress.map(p => [p.puzzleId, p]));

  const groupedPuzzles = puzzles.reduce(
    (acc, puzzle) => {
      acc[puzzle.size] = acc[puzzle.size] || [];
      acc[puzzle.size].push(puzzle);
      return acc;
    },
    {} as Record<number, typeof puzzles>,
  );

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const text = await readPuzzleFile(file);
        const puzzle = importPuzzle(text);
        if (puzzleProvider.savePuzzle) {
          await puzzleProvider.savePuzzle(puzzle);
          refresh();
        }
      } catch (err) {
        alert(`Failed to import puzzle: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };
    input.click();
  };

  if (loading) {
    return <div className={styles.page}>Loading puzzles...</div>;
  }

  const sizeGroups: GridSize[] = [5, 10, 15];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>★ Puzzles ★</h1>
        <button className={styles.importButton} onClick={handleImport}>
          ↓ Import Puzzle
        </button>
      </div>

      {sizeGroups.map(size => {
        const group = groupedPuzzles[size];
        if (!group || group.length === 0) return null;

        return (
          <section key={size} className={styles.sizeGroup}>
            <h2 className={styles.sizeTitle}>{size}×{size}</h2>
            <div className={styles.grid}>
              {group.map(puzzle => (
                <PuzzleCard
                  key={puzzle.id}
                  puzzle={puzzle}
                  progress={progressMap.get(puzzle.id)}
                  onClick={() => navigate(`/play/${puzzle.id}`)}
                  onExport={() => downloadPuzzleFile(puzzle)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
