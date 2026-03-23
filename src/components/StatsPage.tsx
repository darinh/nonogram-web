import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePuzzles } from '../hooks/usePuzzles';
import { useProgress } from '../hooks/useProgress';
import { usePageTitle } from '../hooks/usePageTitle';
import { formatTime, formatDuration, formatRelativeDate } from '../utils/formatTime';
import type { PuzzleDefinition, PuzzleProgress, GridSize, Difficulty } from '../engine/types';
import styles from '../styles/StatsPage.module.css';

/* ── Difficulty display config ──────────────────────── */

const DIFFICULTY_META: Record<Difficulty, { label: string; style: string }> = {
  blue: { label: 'Blue', style: styles.barFillBlue },
  green: { label: 'Green', style: styles.barFillGreen },
  yellow: { label: 'Yellow', style: styles.barFillYellow },
  orange: { label: 'Orange', style: styles.barFillOrange },
  red: { label: 'Red', style: styles.barFillRed },
};

const GRID_SIZES: GridSize[] = [5, 10, 15];

type SortField = 'title' | 'size' | 'completed' | 'time' | 'lastPlayed';
type SortDir = 'asc' | 'desc';

/* ── Component ──────────────────────────────────────── */

export default function StatsPage() {
  usePageTitle('Stats — Nonogram');

  const { puzzles, loading: puzzlesLoading } = usePuzzles();
  const { allProgress, loading: progressLoading } = useProgress();
  const navigate = useNavigate();

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>('lastPlayed');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const loading = puzzlesLoading || progressLoading;

  /* ── Derived data ───────────────────────────────────── */

  const progressMap = useMemo(() => {
    const map = new Map<string, PuzzleProgress>();
    for (const p of allProgress) {
      map.set(p.puzzleId, p);
    }
    return map;
  }, [allProgress]);

  const puzzleMap = useMemo(() => {
    const map = new Map<string, PuzzleDefinition>();
    for (const p of puzzles) {
      map.set(p.id, p);
    }
    return map;
  }, [puzzles]);

  const completedProgress = useMemo(
    () => allProgress.filter(p => p.completed),
    [allProgress],
  );

  /* ── Overview stats ─────────────────────────────────── */

  const totalCompleted = completedProgress.length;

  const totalTimePlayed = useMemo(
    () => allProgress.reduce((sum, p) => sum + p.elapsedTime, 0),
    [allProgress],
  );

  const averageTime = useMemo(() => {
    if (completedProgress.length === 0) return 0;
    const total = completedProgress.reduce((sum, p) => sum + p.elapsedTime, 0);
    return total / completedProgress.length;
  }, [completedProgress]);

  const bestTime = useMemo(() => {
    if (completedProgress.length === 0) return 0;
    return Math.min(...completedProgress.map(p => p.elapsedTime));
  }, [completedProgress]);

  /* ── Completion by size ─────────────────────────────── */

  const sizeStats = useMemo(() => {
    return GRID_SIZES.map(size => {
      const sizePuzzles = puzzles.filter(p => p.size === size);
      const completed = sizePuzzles.filter(p => progressMap.get(p.id)?.completed).length;
      return { size, total: sizePuzzles.length, completed };
    });
  }, [puzzles, progressMap]);

  /* ── Completion by difficulty ────────────────────────── */

  const difficultyStats = useMemo(() => {
    const difficulties = Object.keys(DIFFICULTY_META) as Difficulty[];
    return difficulties
      .map(diff => {
        const diffPuzzles = puzzles.filter(p => p.difficulty === diff);
        const completed = diffPuzzles.filter(p => progressMap.get(p.id)?.completed).length;
        return { difficulty: diff, total: diffPuzzles.length, completed };
      })
      .filter(d => d.total > 0);
  }, [puzzles, progressMap]);

  /* ── Recent activity ────────────────────────────────── */

  const recentActivity = useMemo(() => {
    return completedProgress
      .slice()
      .sort((a, b) => new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime())
      .slice(0, 10)
      .map(p => ({
        progress: p,
        puzzle: puzzleMap.get(p.puzzleId),
      }))
      .filter((item): item is { progress: PuzzleProgress; puzzle: PuzzleDefinition } =>
        item.puzzle !== undefined,
      );
  }, [completedProgress, puzzleMap]);

  /* ── Details table sorting ──────────────────────────── */

  const allPuzzleRows = useMemo(() => {
    const rows = puzzles.map(puzzle => ({
      puzzle,
      progress: progressMap.get(puzzle.id) ?? null,
    }));

    rows.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      switch (sortField) {
        case 'title':
          return dir * a.puzzle.title.localeCompare(b.puzzle.title);
        case 'size':
          return dir * (a.puzzle.size - b.puzzle.size);
        case 'completed': {
          const aVal = a.progress?.completed ? 1 : 0;
          const bVal = b.progress?.completed ? 1 : 0;
          return dir * (aVal - bVal);
        }
        case 'time': {
          const aVal = a.progress?.elapsedTime ?? Infinity;
          const bVal = b.progress?.elapsedTime ?? Infinity;
          return dir * (aVal - bVal);
        }
        case 'lastPlayed': {
          const aVal = a.progress?.lastPlayed
            ? new Date(a.progress.lastPlayed).getTime()
            : 0;
          const bVal = b.progress?.lastPlayed
            ? new Date(b.progress.lastPlayed).getTime()
            : 0;
          return dir * (aVal - bVal);
        }
        default:
          return 0;
      }
    });

    return rows;
  }, [puzzles, progressMap, sortField, sortDir]);

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  }

  function sortIndicator(field: SortField): string {
    if (sortField !== field) return '';
    return sortDir === 'asc' ? ' ▲' : ' ▼';
  }

  /* ── Loading state ──────────────────────────────────── */

  if (loading) {
    return (
      <div className={styles.page}>
        <p className={styles.loading} role="status">Loading stats…</p>
      </div>
    );
  }

  /* ── Empty state ────────────────────────────────────── */

  if (allProgress.length === 0) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>📊 Stats</h1>
        </header>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon} aria-hidden="true">🧩</div>
          <h2 className={styles.emptyTitle}>No stats yet</h2>
          <p className={styles.emptyText}>
            Start solving puzzles and your stats will show up here!
          </p>
          <button
            className={styles.emptyAction}
            onClick={() => navigate('/puzzles')}
          >
            Browse Puzzles
          </button>
        </div>
      </div>
    );
  }

  /* ── Main render ────────────────────────────────────── */

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>📊 Stats</h1>
        <p className={styles.subtitle}>Your puzzle-solving journey so far</p>
      </header>

      {/* Overview Cards */}
      <div className={styles.overviewGrid} role="list" aria-label="Statistics overview">
        <div className={styles.card} role="listitem">
          <div className={styles.cardIcon} aria-hidden="true">✅</div>
          <div className={styles.cardValue}>{totalCompleted}</div>
          <div className={styles.cardLabel}>Completed</div>
        </div>
        <div className={styles.card} role="listitem">
          <div className={styles.cardIcon} aria-hidden="true">⏱️</div>
          <div className={styles.cardValue}>{formatDuration(totalTimePlayed)}</div>
          <div className={styles.cardLabel}>Total Time</div>
        </div>
        <div className={styles.card} role="listitem">
          <div className={styles.cardIcon} aria-hidden="true">📈</div>
          <div className={styles.cardValue}>{formatTime(averageTime)}</div>
          <div className={styles.cardLabel}>Avg. Time</div>
        </div>
        <div className={styles.card} role="listitem">
          <div className={styles.cardIcon} aria-hidden="true">🏆</div>
          <div className={styles.cardValue}>{formatTime(bestTime)}</div>
          <div className={styles.cardLabel}>Best Time</div>
        </div>
      </div>

      {/* Completion by Size */}
      <section className={styles.section} aria-labelledby="size-heading">
        <h2 className={styles.sectionTitle} id="size-heading">Completion by Size</h2>
        <div className={styles.barGrid}>
          {sizeStats.map(({ size, total, completed }) => (
            <div className={styles.barRow} key={size}>
              <span className={styles.barLabel}>{size}×{size}</span>
              <div
                className={styles.barTrack}
                role="progressbar"
                aria-valuenow={completed}
                aria-valuemin={0}
                aria-valuemax={total}
                aria-label={`${size}×${size}: ${completed} of ${total} completed`}
              >
                <div
                  className={styles.barFill}
                  style={{ width: total > 0 ? `${(completed / total) * 100}%` : '0%' }}
                />
              </div>
              <span className={styles.barCount}>{completed} / {total}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Completion by Difficulty */}
      {difficultyStats.length > 0 && (
        <section className={styles.section} aria-labelledby="difficulty-heading">
          <h2 className={styles.sectionTitle} id="difficulty-heading">Completion by Difficulty</h2>
          <div className={styles.barGrid}>
            {difficultyStats.map(({ difficulty, total, completed }) => {
              const meta = DIFFICULTY_META[difficulty];
              return (
                <div className={styles.barRow} key={difficulty}>
                  <span className={styles.barLabel}>{meta.label}</span>
                  <div
                    className={styles.barTrack}
                    role="progressbar"
                    aria-valuenow={completed}
                    aria-valuemin={0}
                    aria-valuemax={total}
                    aria-label={`${meta.label}: ${completed} of ${total} completed`}
                  >
                    <div
                      className={meta.style}
                      style={{ width: total > 0 ? `${(completed / total) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className={styles.barCount}>{completed} / {total}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <section className={styles.section} aria-labelledby="recent-heading">
          <h2 className={styles.sectionTitle} id="recent-heading">Recent Activity</h2>
          <div className={styles.activityList}>
            {recentActivity.map(({ puzzle, progress }) => (
              <div className={styles.activityItem} key={puzzle.id}>
                <span className={styles.activityTitle}>{puzzle.title}</span>
                <span className={styles.activitySize}>{puzzle.size}×{puzzle.size}</span>
                <span className={styles.activityTime}>{formatTime(progress.elapsedTime)}</span>
                <span className={styles.activityDate}>
                  {formatRelativeDate(progress.lastPlayed)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Puzzle Details Table */}
      <section className={styles.section} aria-labelledby="details-heading">
        <button
          className={styles.detailsToggle}
          onClick={() => setDetailsOpen(o => !o)}
          aria-expanded={detailsOpen}
          aria-controls="details-table"
        >
          <span
            className={detailsOpen ? styles.detailsToggleIconOpen : styles.detailsToggleIcon}
            aria-hidden="true"
          >
            ▶
          </span>
          <span id="details-heading">All Puzzles</span>
        </button>

        {detailsOpen && (
          <table className={styles.table} id="details-table">
            <thead>
              <tr>
                <th scope="col" onClick={() => handleSort('title')}>
                  Puzzle{sortIndicator('title') && (
                    <span className={styles.sortArrow}>{sortIndicator('title')}</span>
                  )}
                </th>
                <th scope="col" onClick={() => handleSort('size')}>
                  Size{sortIndicator('size') && (
                    <span className={styles.sortArrow}>{sortIndicator('size')}</span>
                  )}
                </th>
                <th scope="col" onClick={() => handleSort('completed')}>
                  Status{sortIndicator('completed') && (
                    <span className={styles.sortArrow}>{sortIndicator('completed')}</span>
                  )}
                </th>
                <th scope="col" onClick={() => handleSort('time')}>
                  Time{sortIndicator('time') && (
                    <span className={styles.sortArrow}>{sortIndicator('time')}</span>
                  )}
                </th>
                <th scope="col" onClick={() => handleSort('lastPlayed')}>
                  Last Played{sortIndicator('lastPlayed') && (
                    <span className={styles.sortArrow}>{sortIndicator('lastPlayed')}</span>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {allPuzzleRows.map(({ puzzle, progress }) => (
                <tr key={puzzle.id}>
                  <td>{puzzle.title}</td>
                  <td>{puzzle.size}×{puzzle.size}</td>
                  <td>
                    {progress?.completed ? (
                      <span className={styles.completedYes}>✓ Done</span>
                    ) : (
                      <span className={styles.completedNo}>—</span>
                    )}
                  </td>
                  <td>{progress ? formatTime(progress.elapsedTime) : '—'}</td>
                  <td>
                    {progress?.lastPlayed
                      ? formatRelativeDate(progress.lastPlayed)
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
