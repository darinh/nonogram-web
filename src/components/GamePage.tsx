import { useEffect, useMemo, useCallback, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePuzzleProvider, useProgressProvider } from '../providers/ProviderContext';
import { useNonogramGame } from '../hooks/useNonogramGame';
import { useWallet } from '../hooks/useWallet';
import { useDragPaint } from '../hooks/useDragPaint';
import { downloadPuzzleFile } from '../engine/serialization';
import { getHintCost } from '../engine/hints';
import { calculateReward } from '../engine/coins';
import { CellState } from '../engine/types';
import { EDGE_REVEAL_COST, BOMB_COST } from '../engine/constants';
import NonogramGrid from './NonogramGrid';
import Toolbar from './Toolbar';
import HintPrompt from './HintPrompt';
import PowerUpToolbar from './PowerUpToolbar';
import styles from '../styles/GamePage.module.css';
import type { PuzzleDefinition } from '../engine/types';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Count cells that would change if a row/column hint were applied. */
function countRevealable(
  grid: CellState[],
  solution: number[],
  size: number,
  axis: 'row' | 'col',
  index: number,
): number {
  let count = 0;
  for (let i = 0; i < size; i++) {
    const idx = axis === 'row' ? index * size + i : i * size + index;
    const target = solution[idx] === 1 ? CellState.Filled : CellState.Crossed;
    if (grid[idx] !== target) count++;
  }
  return count;
}

export default function GamePage() {
  const { puzzleId } = useParams<{ puzzleId: string }>();
  const navigate = useNavigate();
  const puzzleProvider = usePuzzleProvider();
  const progressProvider = useProgressProvider();
  const [loading, setLoading] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hintPrompt, setHintPrompt] = useState<{ axis: 'row' | 'col'; index: number } | null>(null);
  const [edgeRevealUsed, setEdgeRevealUsed] = useState(false);
  const [bombUsed, setBombUsed] = useState(false);
  const rewardedRef = useRef(false);

  const onSaveProgress = useCallback(
    (progress: import('../engine/types').PuzzleProgress) => {
      progressProvider.saveProgress(progress);
    },
    [progressProvider],
  );

  const gameOptions = useMemo(() => ({ onSaveProgress }), [onSaveProgress]);
  const game = useNonogramGame(gameOptions);
  const { wallet, earn, spend } = useWallet();

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
      rewardedRef.current = progress?.completed ?? false;
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
    setEdgeRevealUsed(false);
    setBombUsed(false);
    rewardedRef.current = false;
  }, [game]);

  // Award coins when puzzle is completed
  useEffect(() => {
    if (game.completed && game.puzzle?.difficulty && !rewardedRef.current) {
      rewardedRef.current = true;
      const reward = calculateReward(game.puzzle.difficulty);
      earn(reward, `Completed: ${game.puzzle.title}`);
    }
  }, [game.completed, game.puzzle, earn]);

  const handleClueClick = useCallback(
    (axis: 'row' | 'col', index: number) => {
      setHintPrompt({ axis, index });
    },
    [],
  );

  const handleHintConfirm = useCallback(async () => {
    if (!hintPrompt || !game.puzzle) return;
    const cost = getHintCost(game.puzzle.difficulty);
    const ok = await spend(cost, `Hint: ${hintPrompt.axis} ${hintPrompt.index + 1}`);
    if (ok) {
      if (hintPrompt.axis === 'row') {
        game.applyRowHint(hintPrompt.index);
      } else {
        game.applyColHint(hintPrompt.index);
      }
    }
    setHintPrompt(null);
  }, [hintPrompt, game, spend]);

  const handleHintCancel = useCallback(() => {
    setHintPrompt(null);
  }, []);

  const handleEdgeReveal = useCallback(async () => {
    const ok = await spend(EDGE_REVEAL_COST, 'Power-up: Edge Reveal');
    if (ok) {
      game.applyEdgeReveal();
      setEdgeRevealUsed(true);
    }
  }, [spend, game]);

  const handleBomb = useCallback(async () => {
    const ok = await spend(BOMB_COST, 'Power-up: Bomb');
    if (ok) {
      game.applyBomb();
      setBombUsed(true);
    }
  }, [spend, game]);

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

        <PowerUpToolbar
          edgeRevealUsed={edgeRevealUsed}
          bombUsed={bombUsed}
          currentCoins={wallet.coins}
          onEdgeReveal={handleEdgeReveal}
          onBomb={handleBomb}
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
          onToolChange={game.setTool}
          onClueClick={handleClueClick}
        />
      </div>

      {hintPrompt && game.puzzle && (
        <HintPrompt
          axis={hintPrompt.axis}
          index={hintPrompt.index}
          cost={getHintCost(game.puzzle.difficulty)}
          currentCoins={wallet.coins}
          revealableCount={countRevealable(
            game.grid,
            game.puzzle.solution,
            game.puzzle.size,
            hintPrompt.axis,
            hintPrompt.index,
          )}
          onConfirm={handleHintConfirm}
          onCancel={handleHintCancel}
        />
      )}

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
