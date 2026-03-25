import { useEffect, useMemo, useCallback, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { usePuzzleProvider, useProgressProvider, useThemeProvider, useSoundProvider } from '../providers/useProviders';
import { useNonogramGame } from '../hooks/useNonogramGame';
import { useSharedWallet } from '../providers/wallet/WalletContext';
import { useTutorial } from '../hooks/useTutorial';
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
import TutorialOverlay from './TutorialOverlay';
import { CoinDisplay } from './CoinDisplay';
import styles from '../styles/GamePage.module.css';
import type { PuzzleDefinition, DragMode } from '../engine/types';

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

  const [searchParams] = useSearchParams();
  const themeId = searchParams.get('theme');
  const themeProvider = useThemeProvider();
  const [themeName, setThemeName] = useState<string | null>(null);

  const onSaveProgress = useCallback(
    (progress: import('../engine/types').PuzzleProgress) => {
      progressProvider.saveProgress(progress);
    },
    [progressProvider],
  );

  const gameOptions = useMemo(() => ({ onSaveProgress }), [onSaveProgress]);
  const game = useNonogramGame(gameOptions);
  const { wallet, earn, spend } = useSharedWallet();
  const { tutorialSeen, markTutorialSeen } = useTutorial();
  const soundProvider = useSoundProvider();
  const [muted, setMuted] = useState(() => soundProvider.isMuted());
  const toolRef = useRef(game.tool);
  toolRef.current = game.tool;

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
      setEdgeRevealUsed(false);
      setBombUsed(false);
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzleId]);

  // Load theme name when in theme context
  useEffect(() => {
    if (!themeId) {
      setThemeName(null);
      return;
    }
    themeProvider.getThemeById(themeId).then(theme => {
      setThemeName(theme?.title ?? null);
    });
  }, [themeId, themeProvider]);

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

  const toggleMute = useCallback(() => {
    const next = !soundProvider.isMuted();
    soundProvider.setMuted(next);
    setMuted(next);
  }, [soundProvider]);

  const gamePaintCell = game.paintCell;
  const isDraggingRef = useRef(false);

  // Only play sound on the first cell of a drag to avoid lag during fast painting
  const paintCellDrag = useCallback((row: number, col: number, mode: DragMode) => {
    const painted = gamePaintCell(row, col, mode);
    if (painted && mode === 'fill' && !isDraggingRef.current) {
      if (toolRef.current === 'fill') soundProvider.playFill();
      else soundProvider.playCross();
      isDraggingRef.current = true;
    }
    return painted;
  }, [gamePaintCell, soundProvider]);

  const handleDragEnd = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const undoWithSound = useCallback(() => {
    if (game.canUndo) soundProvider.playUndo();
    game.undo();
  }, [game, soundProvider]);

  // Award coins when puzzle is completed
  useEffect(() => {
    if (game.completed && game.puzzle?.difficulty && !rewardedRef.current) {
      rewardedRef.current = true;
      soundProvider.playFanfare();
      const reward = calculateReward(game.puzzle.difficulty);
      earn(reward, `Completed: ${game.puzzle.title}`);
    }
  }, [game.completed, game.puzzle, earn, soundProvider]);

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
        undoWithSound();
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
  }, [game, undoWithSound]);

  const dragPaint = useDragPaint({
    onPaintCell: paintCellDrag,
    getDragMode: game.getDragMode,
    onDragEnd: handleDragEnd,
    gridSize: game.puzzle?.size ?? 0,
  });

  /** Keyboard activation: same effect as a single click on the cell. */
  const handleActivateCell = useCallback(
    (row: number, col: number) => {
      const mode = game.getDragMode(row, col);
      if (mode) {
        const painted = gamePaintCell(row, col, mode);
        if (painted && mode === 'fill') {
          if (toolRef.current === 'fill') soundProvider.playFill();
          else soundProvider.playCross();
        }
      }
    },
    [game, gamePaintCell, soundProvider],
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

  const coinReward = difficulty ? calculateReward(difficulty) : 0;
  const backUrl = themeId ? `/themes/${themeId}` : '/puzzles';

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(backUrl)}>
          ← {themeId ? 'Theme' : 'Back'}
        </button>

        {themeName ? (
          <h1 className={styles.puzzleTitle}>
            <span className={styles.breadcrumb}>
              <button
                className={styles.breadcrumbLink}
                onClick={() => navigate(backUrl)}
                type="button"
              >
                {themeName}
              </button>
              <span aria-hidden="true"> › </span>
            </span>
            {game.puzzle.title}
            {difficulty && (
              <span className={badgeClass}>
                {difficulty} · {game.puzzle.size}×{game.puzzle.size}
              </span>
            )}
          </h1>
        ) : (
          <h1 className={styles.puzzleTitle}>
            {game.puzzle.title}
            {difficulty && (
              <span className={badgeClass}>
                {difficulty} · {game.puzzle.size}×{game.puzzle.size}
              </span>
            )}
          </h1>
        )}

        <div className={styles.headerRight}>
          <CoinDisplay />
          <button
            className={styles.muteButton}
            onClick={toggleMute}
            title={muted ? 'Unmute sounds' : 'Mute sounds'}
            aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
          >
            {muted ? '🔇' : '🔊'}
          </button>
          <button
            className={styles.exportButton}
            onClick={() => downloadPuzzleFile(game.puzzle as PuzzleDefinition)}
            title="Export puzzle"
          >
            ↗ Export
          </button>
        </div>
      </div>

      <div className={styles.gameArea}>
        <Toolbar
          activeTool={game.tool}
          onToolChange={game.setTool}
          onReset={handleReset}
          onUndo={undoWithSound}
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

      {!tutorialSeen && !loading && (
        <TutorialOverlay onComplete={markTutorialSeen} />
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
            {coinReward > 0 && (
              <p className={styles.coinReward} aria-label={`Earned ${coinReward} coins`}>
                +{coinReward} <span aria-hidden="true">🪙</span>
              </p>
            )}
            <div className={styles.completionButtons}>
              <button className={styles.playAgainButton} onClick={handleReset}>
                Play Again
              </button>
              {themeId && (
                <button
                  className={styles.themeButton}
                  onClick={() => navigate(`/themes/${themeId}`)}
                >
                  Back to Theme
                </button>
              )}
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
