import type { PuzzleDefinition, PuzzleProgress } from '../engine/types';
import styles from '../styles/PuzzleCard.module.css';

interface PuzzleCardProps {
  puzzle: PuzzleDefinition;
  progress?: PuzzleProgress | null;
  onClick: () => void;
  onExport?: () => void;
}

export default function PuzzleCard({ puzzle, progress, onClick, onExport }: PuzzleCardProps) {
  const isCompleted = progress?.completed ?? false;

  const statusLabel = isCompleted
    ? '✓ Completed'
    : progress
      ? '◐ In Progress'
      : 'Not Started';

  const statusClass = isCompleted
    ? styles.completed
    : progress
      ? styles.inProgress
      : styles.notStarted;

  const difficultyClass = puzzle.difficulty
    ? styles[puzzle.difficulty]
    : undefined;

  const displayTitle = isCompleted ? puzzle.title : 'Mystery Puzzle';

  return (
    <div
      className={`${styles.card} ${difficultyClass}`}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
    >
      <div className={styles.header}>
        <h3 className={styles.title}>{displayTitle}</h3>
        <span className={styles.size}>{puzzle.size}×{puzzle.size}</span>
      </div>
      {isCompleted && puzzle.description && (
        <p className={styles.description}>{puzzle.description}</p>
      )}
      <div className={styles.footer}>
        <span className={`${styles.status} ${statusClass}`}>{statusLabel}</span>
        {puzzle.source && puzzle.source !== 'bundled' && (
          <span className={styles.sourceBadge}>{puzzle.source === 'user-created' ? '✎ Custom' : '↓ Imported'}</span>
        )}
        {onExport && (
          <button
            className={styles.exportButton}
            onClick={(e) => {
              e.stopPropagation();
              onExport();
            }}
            title="Export puzzle"
          >
            ↗ Export
          </button>
        )}
      </div>
    </div>
  );
}
