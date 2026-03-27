import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePuzzles } from '../hooks/usePuzzles';
import { useProgress } from '../hooks/useProgress';
import { usePageTitle } from '../hooks/usePageTitle';
import { downloadPuzzleFile, importPuzzle, readPuzzleFile } from '../engine/serialization';
import { usePuzzleProvider } from '../providers/useProviders';
import { Footer } from './Layout';
import styles from '../styles/PuzzleBrowser.module.css';
import type { PuzzleDefinition, PuzzleProgress } from '../engine/types';

/* ── Constants ───────────────────────────────────────── */

const CATEGORIES = ['All', 'Animals 🐾', 'Nature 🌿', 'Food 🍕', 'Objects 🎸', 'Abstract 🌀', 'Seasonal 🎄'];

const SORT_OPTIONS = [
  { value: 'popular', label: 'Sort by: Popular' },
  { value: 'newest', label: 'Sort by: Newest' },
  { value: 'difficulty', label: 'Sort by: Difficulty' },
];

const SIZE_OPTIONS = [
  { value: 'all', label: 'Size: All' },
  { value: '5', label: '5×5' },
  { value: '10', label: '10×10' },
  { value: '15', label: '15×15' },
];

const ITEMS_PER_PAGE = 12;

const PASTEL_COLORS = ['#ffd6e8', '#d6f0ff', '#d6ffe0', '#fff3d6', '#e8d6ff', '#ffd6d6', '#d6fff3', '#ffe8f5'];

/* ── Helpers ─────────────────────────────────────────── */

function difficultyStars(difficulty: string | undefined): number {
  const map: Record<string, number> = { blue: 1, green: 2, yellow: 3, orange: 4, red: 5 };
  return map[difficulty ?? 'green'] ?? 2;
}

function puzzleColor(difficulty: string | undefined): string {
  const map: Record<string, string> = {
    blue: 'var(--cyan)',
    green: 'var(--green)',
    yellow: 'var(--gold)',
    orange: 'var(--orange)',
    red: 'var(--pink)',
  };
  return map[difficulty ?? 'green'] ?? 'var(--pink)';
}

function getStatus(progress: PuzzleProgress | undefined): 'completed' | 'in-progress' | 'new' {
  if (!progress) return 'new';
  return progress.completed ? 'completed' : 'in-progress';
}

function renderStatusBadge(status: 'completed' | 'in-progress' | 'new', progress?: PuzzleProgress) {
  switch (status) {
    case 'completed':
      return <div className={`${styles.cardStatus} ${styles.statusCompleted}`}>✓ Completed</div>;
    case 'in-progress': {
      const pct = progress && progress.grid
        ? Math.round((progress.grid.filter(c => c !== 0).length / progress.grid.length) * 100)
        : 0;
      return (
        <div className={`${styles.cardStatus} ${styles.statusInProgress}`}>
          In Progress
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${pct}%` }} />
          </div>
        </div>
      );
    }
    case 'new':
      return <div className={`${styles.cardStatus} ${styles.statusNew}`}>New</div>;
  }
}

/* ── Pixel grid preview ──────────────────────────────── */

function MiniPixelGrid({ puzzle, isCompleted }: { puzzle: PuzzleDefinition; isCompleted: boolean }) {
  const size = puzzle.size;
  const cols = Math.min(size, 10);
  const color = puzzleColor(puzzle.difficulty);
  const cells = puzzle.solution;

  return (
    <div
      className={`${styles.pixelGrid} ${!isCompleted ? styles.previewBlurred : ''}`}
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {cells.slice(0, cols * cols).map((val, i) => (
        <span key={i} style={val === 1 ? { background: color } : undefined} />
      ))}
    </div>
  );
}

/* ── Daily preview (scrambled pastel) ────────────────── */

function DailyPreviewGrid() {
  const cells = useMemo(() => {
    const arr: string[] = [];
    for (let i = 0; i < 64; i++) {
      arr.push(PASTEL_COLORS[i % PASTEL_COLORS.length]);
    }
    return arr;
  }, []);

  return (
    <div
      className={styles.dailyPreview}
      style={{ gridTemplateColumns: 'repeat(8, 1fr)' }}
    >
      {cells.map((color, i) => (
        <span key={i} className={styles.dailyPreviewCell} style={{ background: color }} />
      ))}
    </div>
  );
}

/* ── Main Component ──────────────────────────────────── */

export default function PuzzleBrowser() {
  usePageTitle('Puzzles — Nonogram');
  const navigate = useNavigate();
  const { puzzles, loading, refresh } = usePuzzles();
  const { allProgress } = useProgress();
  const puzzleProvider = usePuzzleProvider();

  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const progressMap = useMemo(
    () => new Map(allProgress.map(p => [p.puzzleId, p])),
    [allProgress],
  );

  /* ── Filtering & sorting ── */
  const filteredPuzzles = useMemo(() => {
    let result = [...puzzles];

    if (sizeFilter !== 'all') {
      const size = parseInt(sizeFilter, 10);
      result = result.filter(p => p.size === size);
    }

    if (sortBy === 'difficulty') {
      const order: Record<string, number> = { blue: 1, green: 2, yellow: 3, orange: 4, red: 5 };
      result.sort((a, b) => (order[a.difficulty ?? 'green'] ?? 2) - (order[b.difficulty ?? 'green'] ?? 2));
    }

    return result;
  }, [puzzles, sizeFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredPuzzles.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * ITEMS_PER_PAGE;
  const pagePuzzles = filteredPuzzles.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  /* ── Daily puzzle (first puzzle as demo) ── */
  const dailyPuzzle = puzzles[0] ?? null;

  /* ── Import handler ── */
  const handleImport = useCallback(async () => {
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
  }, [puzzleProvider, refresh]);

  /* ── Pagination ── */
  const pageNumbers = useMemo(() => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push('ellipsis');
      for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) {
        pages.push(i);
      }
      if (safePage < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, safePage]);

  if (loading) {
    return <div className={styles.loadingState}>Loading puzzles...</div>;
  }

  return (
    <>
      {/* ══════ PAGE HEADER ══════ */}
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Puzzles</h1>
        <p className={styles.pageSubtitle}>Choose your challenge</p>
        <div className={styles.headerActions}>
          <button className={styles.importButton} onClick={handleImport}>
            ↓ Import Puzzle
          </button>
        </div>
      </header>

      {/* ══════ DAILY CHALLENGE ══════ */}
      {dailyPuzzle && (
        <section className={styles.dailySection}>
          <div className={styles.dailyCard}>
            <span className={styles.dailyBadge}>🔥 DAILY CHALLENGE</span>
            <div className={styles.dailyContent}>
              <DailyPreviewGrid />
              <div className={styles.dailyInfo}>
                <h2>Today&apos;s Puzzle: Mystery Puzzle</h2>
                <div className={styles.dailyMeta}>
                  <span className={styles.stars}>
                    {'★'.repeat(difficultyStars(dailyPuzzle.difficulty))}
                    {'☆'.repeat(5 - difficultyStars(dailyPuzzle.difficulty))}
                  </span>
                  <span className={styles.sizePill}>{dailyPuzzle.size}×{dailyPuzzle.size}</span>
                </div>
                <button
                  className={styles.playButton}
                  onClick={() => navigate(`/play/${dailyPuzzle.id}`)}
                >
                  Play Now
                </button>
                <p className={styles.timer}>Resets at midnight</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══════ FILTER BAR ══════ */}
      <section className={styles.filterSection}>
        <div className={styles.filterBar}>
          <div className={styles.categories} tabIndex={0} role="region" aria-label="Puzzle categories">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`${styles.catPill} ${activeCategory === cat ? styles.catPillActive : ''}`}
                onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className={styles.filterControls}>
            <select
              className={styles.sortSelect}
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
              aria-label="Sort puzzles by"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              className={styles.sortSelect}
              value={sizeFilter}
              onChange={(e) => { setSizeFilter(e.target.value); setCurrentPage(1); }}
              aria-label="Filter by puzzle size"
            >
              {SIZE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* ══════ PUZZLE CARDS GRID ══════ */}
      <section className={styles.puzzlesSection}>
        <div className={styles.puzzlesGrid}>
          {pagePuzzles.map((puzzle) => {
            const progress = progressMap.get(puzzle.id);
            const status = getStatus(progress);
            const isCompleted = status === 'completed';
            const displayTitle = isCompleted ? puzzle.title : 'Mystery Puzzle';
            const starCount = difficultyStars(puzzle.difficulty);

            return (
              <div
                key={puzzle.id}
                className={styles.puzzleCard}
                onClick={() => navigate(`/play/${puzzle.id}`)}
                role="button"
                tabIndex={0}
                aria-label={`${displayTitle}, ${puzzle.size}×${puzzle.size}, ${starCount} star difficulty`}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/play/${puzzle.id}`); }}
              >
                <div className={styles.cardPreview}>
                  <MiniPixelGrid puzzle={puzzle} isCompleted={isCompleted} />
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{displayTitle}</h3>
                  <div className={styles.cardMeta}>
                    <span className={styles.stars}>
                      {'★'.repeat(starCount)}{'☆'.repeat(5 - starCount)}
                    </span>
                    <span className={styles.sizePill}>{puzzle.size}×{puzzle.size}</span>
                  </div>
                  {renderStatusBadge(status, progress)}
                  <div className={styles.cardFooter}>
                    <span>{puzzle.size}×{puzzle.size}</span>
                    {puzzle.source && puzzle.source !== 'bundled' && (
                      <span>{puzzle.source === 'user-created' ? '✎ Custom' : '↓ Imported'}</span>
                    )}
                    {isCompleted && (
                      <button
                        className={styles.importButton}
                        style={{ fontSize: '0.65rem', padding: '0.25em 0.8em' }}
                        onClick={(e) => { e.stopPropagation(); downloadPuzzleFile(puzzle); }}
                      >
                        ↗ Export
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════ PAGINATION ══════ */}
      {totalPages > 1 && (
        <section className={styles.paginationSection}>
          <div className={styles.pagination}>
            <button
              className={styles.pageButton}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1}
              aria-label="Previous page"
            >
              «
            </button>
            {pageNumbers.map((p, i) =>
              p === 'ellipsis' ? (
                <span key={`e${i}`} className={styles.pageEllipsis}>…</span>
              ) : (
                <button
                  key={p}
                  className={`${styles.pageButton} ${p === safePage ? styles.pageButtonActive : ''}`}
                  onClick={() => setCurrentPage(p)}
                >
                  {p}
                </button>
              ),
            )}
            <button
              className={styles.pageButton}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              aria-label="Next page"
            >
              »
            </button>
          </div>
          <p className={styles.paginationInfo}>
            Showing {startIdx + 1}–{Math.min(startIdx + ITEMS_PER_PAGE, filteredPuzzles.length)} of {filteredPuzzles.length} puzzles
          </p>
        </section>
      )}

      {/* ══════ FOOTER ══════ */}
      <Footer />
    </>
  );
}
