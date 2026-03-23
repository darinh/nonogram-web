import { useNavigate } from 'react-router-dom';
import { usePuzzles } from '../hooks/usePuzzles';
import { useProgress } from '../hooks/useProgress';
import { usePageTitle } from '../hooks/usePageTitle';
import styles from '../styles/HomePage.module.css';

export default function HomePage() {
  usePageTitle('Nonogram — Puzzle Game');
  const navigate = useNavigate();
  const { puzzles } = usePuzzles();
  const { allProgress } = useProgress();

  const inProgressPuzzles = allProgress
    .filter(p => !p.completed)
    .map(p => ({
      progress: p,
      puzzle: puzzles.find(pz => pz.id === p.puzzleId),
    }))
    .filter(p => p.puzzle);

  return (
    <div className={styles.hero}>
      <h1 className={styles.title}>Nonogram</h1>
      <p className={styles.subtitle}>Logic puzzles, one cell at a time ★</p>

      <div className={styles.nav}>
        <button className={styles.actionButton} onClick={() => navigate('/puzzles')}>
          Browse Puzzles
        </button>
        <button
          className={`${styles.actionButton} ${styles.secondary}`}
          onClick={() => navigate('/create')}
        >
          Create Puzzle
        </button>
      </div>

      {inProgressPuzzles.length > 0 && (
        <section className={styles.continueSection}>
          <h2 className={styles.sectionTitle}>Continue Playing</h2>
          <div className={styles.continueList}>
            {inProgressPuzzles.map(({ puzzle, progress }) => (
              <button
                key={puzzle!.id}
                className={styles.continueCard}
                onClick={() => navigate(`/play/${puzzle!.id}`)}
              >
                <span className={styles.continueName}>{puzzle!.title}</span>
                <span className={styles.continueSize}>{puzzle!.size}×{puzzle!.size}</span>
                <span className={styles.continueDate}>
                  {new Date(progress.lastPlayed).toLocaleDateString()}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {puzzles.length > 0 && (
        <section className={styles.featuredSection}>
          <h2 className={styles.sectionTitle}>Quick Start</h2>
          <p className={styles.featuredText}>Jump right in with a puzzle:</p>
          <button
            className={styles.featuredButton}
            onClick={() => navigate(`/play/${puzzles[0].id}`)}
          >
            Play "{puzzles[0].title}" ({puzzles[0].size}×{puzzles[0].size})
          </button>
        </section>
      )}
    </div>
  );
}
