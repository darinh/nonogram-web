import { useParams, useNavigate } from 'react-router-dom';
import { useThemes } from '../hooks/useThemes';
import { usePageTitle } from '../hooks/usePageTitle';
import type { ThemeGridCell } from '../engine/types';
import styles from '../styles/ThemeGridPage.module.css';

const GRID_SIZE = 10;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;

const difficultyDotClass: Record<string, string> = {
  blue: styles.dotBlue,
  green: styles.dotGreen,
  yellow: styles.dotYellow,
  orange: styles.dotOrange,
  red: styles.dotRed,
};

export default function ThemeGridPage() {
  const { themeId } = useParams<{ themeId: string }>();
  const navigate = useNavigate();
  const { themes, themeProgress, loading } = useThemes();

  const theme = themes.find((t) => t.id === themeId);
  const progress = themeId ? themeProgress.get(themeId) : undefined;
  const completedSet = new Set(progress?.completedPuzzles ?? []);
  const completedCount = completedSet.size;

  usePageTitle(theme ? `${theme.title} — Nonogram` : 'Theme — Nonogram');

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>Loading theme…</div>
      </div>
    );
  }

  if (!theme) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={() => navigate('/themes')}>
            ← Back
          </button>
        </div>
        <div className={styles.emptyState}>Theme not found.</div>
      </div>
    );
  }

  // Build a lookup: position → cell data
  const cellMap = new Map<number, ThemeGridCell>();
  for (const cell of theme.gridLayout) {
    cellMap.set(cell.position, cell);
  }

  const totalPuzzles = theme.gridLayout.length || TOTAL_CELLS;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate('/themes')}>
          ← Back
        </button>
        <h1 className={styles.title}>{theme.title}</h1>
        <span className={styles.progressCounter}>
          {completedCount}/{totalPuzzles}
        </span>
      </div>

      <div className={styles.gridWrapper}>
        {theme.backgroundImage ? (
          <div
            className={styles.gridBackground}
            style={{ backgroundImage: `url(${theme.backgroundImage})` }}
          />
        ) : (
          <div className={styles.gridBackgroundPlaceholder} />
        )}

        <div className={styles.grid}>
          {Array.from({ length: TOTAL_CELLS }, (_, i) => {
            const cell = cellMap.get(i);

            if (!cell) {
              return <div key={i} className={styles.cellEmpty} />;
            }

            const isCompleted = completedSet.has(cell.puzzleId);

            return (
              <div
                key={i}
                className={`${styles.cell} ${isCompleted ? styles.cellCompleted : styles.cellLocked}`}
                onClick={() => navigate(`/themes/${themeId}/${cell.puzzleId}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') navigate(`/themes/${themeId}/${cell.puzzleId}`);
                }}
              >
                {isCompleted ? (
                  <span className={styles.checkmark}>✓</span>
                ) : (
                  <span className={`${styles.dot} ${difficultyDotClass[cell.difficulty] ?? ''}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
