import { useEffect, useMemo, useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePuzzleProvider, useProgressProvider } from '../providers/ProviderContext';
import { useNonogramGame } from '../hooks/useNonogramGame';
import { useDragPaint } from '../hooks/useDragPaint';
import { downloadPuzzleFile } from '../engine/serialization';
import NonogramGrid from './NonogramGrid';
import Toolbar from './Toolbar';
import styles from '../styles/GamePage.module.css';
import type { PuzzleDefinition } from '../engine/types';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function GamePage() {
  const { puzzleId } = useParams<{ puzzleId: string }>();
  const navigate = useNavigate();
  const puzzleProvider = usePuzzleProvider();
  const progressProvider = useProgressProvider();
  const [loading, setLoading] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);

  const onSaveProgress = useCallback(
    (progress: import('../engine/types').PuzzleProgress) => {
      progressProvider.saveProgress(progress);
    },
    [progressProvider],
  );

  const gameOptions = useMemo(() => ({ onSaveProgress }), [onSaveProgress]);
  const game = useNonogramGame(gameOptions);

  useEffect(() => {
    async function load() {
      if (!puzzleId) return;
      const puzzle = await puzzleProvider.getPuzzleById(puzzleId);
      if (!puzzle) {
        navigate('/puzzles');
        return;
      }
      const progress = await progressProvider.getProgress(puzzleId);
      game.loadPuzzle(puzzle, progress);
      setElapsedTime(progress?.elapsedTime ?? 0);
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzleId]);

  // Timer: tick every second while puzzle is active
  useEffect(() => {
    if (!game.puzzle || game.completed) return;
    const id = setInterval(() => setElapsedTime(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [game.puzzle, game.completed]);

  const handleReset = useCallback(() => {
    game.resetGrid();
    setElapsedTime(0);
  }, [game]);

  // Keyboard shortcuts: Ctrl+Z → undo, Ctrl+Shift+Z / Ctrl+Y → redo
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        game.undo();
      } else if (
        ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) ||
        ((e.ctrlKey || e.metaKey) && e.key === 'y')
      ) {
        e.preventDefault();
        game.redo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [game]);

  const dragPaint = useDragPaint({
    onPaintCell: game.paintCell,
    getDragMode: game.getDragMode,
    gridSize: game.puzzle?.size ?? 0,
  });

  /** Keyboard activation: same effect as a single click on the cell. */
  const handleActivateCell = useCallback(
    (row: number, col: number) => {
      const mode = game.getDragMode(row, col);
      if (mode) game.paintCell(row, col, mode);
    },
    [game],
  );

  // Pre-generate confetti particles so they're stable across renders
  const confettiParticles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        key: i,
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 1.5}s`,
        animationDuration: `${1.5 + Math.random() * 1.5}s`,
      })),
    [],
  );

  if (loading || !game.puzzle) {
    return <div className={styles.page}>Loading...</div>;
  }

  const difficulty = game.puzzle.difficulty;
  const badgeClass = difficulty
    ? `${styles.difficultyBadge} ${styles[`badge${difficulty.charAt(0).toUpperCase()}${difficulty.slice(1)}`]}`
    : undefined;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate('/puzzles')}>
          ← Back
        </button>
        <h1 className={styles.puzzleTitle}>
          {game.puzzle.title}
          {difficulty && (
            <span className={badgeClass}>
              {difficulty} · {game.puzzle.size}×{game.puzzle.size}
            </span>
          )}
        </h1>
        <button
          className={styles.exportButton}
          onClick={() => downloadPuzzleFile(game.puzzle as PuzzleDefinition)}
          title="Export puzzle"
        >
          ↗ Export
        </button>
      </div>

      <div className={styles.gameArea}>
        <Toolbar
          activeTool={game.tool}
          onToolChange={game.setTool}
          onReset={handleReset}
          onUndo={game.undo}
          onRedo={game.redo}
          canUndo={game.canUndo}
          canRedo={game.canRedo}
          completed={game.completed}
        />

        <div className={styles.timer}>{formatTime(elapsedTime)}</div>

        <NonogramGrid
          grid={game.grid}
          size={game.puzzle.size}
          rowClues={game.puzzle.rowClues}
          colClues={game.puzzle.colClues}
          completed={game.completed}
          onCellMouseDown={dragPaint.handleCellMouseDown}
          onCellMouseEnter={dragPaint.handleCellMouseEnter}
          onMouseUp={dragPaint.handleMouseUp}
          onActivateCell={handleActivateCell}
        />
      </div>

      {game.completed && (
        <div className={styles.completionOverlay}>
          {confettiParticles.map(p => (
            <div
              key={p.key}
              className={styles.confetti}
              style={{
                left: p.left,
                animationDelay: p.animationDelay,
                animationDuration: p.animationDuration,
              }}
            />
          ))}
          <div className={styles.completionMessage}>
            <span className={styles.checkMark}>✓</span>
            <h2>Puzzle Complete!</h2>
            <p>Solved "{game.puzzle.title}" in {formatTime(elapsedTime)}!</p>
            <div className={styles.completionButtons}>
              <button className={styles.playAgainButton} onClick={handleReset}>
                Play Again
              </button>
              <button className={styles.continueButton} onClick={() => navigate('/puzzles')}>
                More Puzzles
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
