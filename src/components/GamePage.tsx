import { useEffect, useMemo, useCallback, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { usePuzzleProvider, useProgressProvider, useThemeProvider, useSoundProvider } from '../providers/useProviders';
import { useNonogramGame } from '../hooks/useNonogramGame';
import { useSharedWallet } from '../hooks/useSharedWallet';
import { useTutorial } from '../hooks/useTutorial';
import { useDragPaint } from '../hooks/useDragPaint';
import { downloadPuzzleFile } from '../engine/serialization';
import { getHintCost } from '../engine/hints';
import { calculateCoinReward } from '../engine/economy';
import { CellState, Tool } from '../engine/types';
import { EDGE_REVEAL_COST, BOMB_COST } from '../engine/constants';
import NonogramGrid from './NonogramGrid';
import HintPrompt from './HintPrompt';
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

/** Generate a 5x5 thumbnail from the solution (downsampled). */
function getSolutionThumb(solution: number[], size: number): boolean[] {
  const thumb: boolean[] = [];
  const step = size / 5;
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const sr = Math.floor(r * step);
      const sc = Math.floor(c * step);
      thumb.push(solution[sr * size + sc] === 1);
    }
  }
  return thumb;
}

/** Count filled cells in grid that match the solution. */
function countFilledCells(grid: CellState[], solution: number[]): number {
  let count = 0;
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] === CellState.Filled && solution[i] === 1) count++;
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
  const { wallet, earnCoins, spendCoins } = useSharedWallet();
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
      const reward = calculateCoinReward(game.puzzle.difficulty);
      earnCoins(reward, `Completed: ${game.puzzle.title}`);
    }
  }, [game.completed, game.puzzle, earnCoins, soundProvider]);

  const handleClueClick = useCallback(
    (axis: 'row' | 'col', index: number) => {
      setHintPrompt({ axis, index });
    },
    [],
  );

  const handleHintConfirm = useCallback(async () => {
    if (!hintPrompt || !game.puzzle) return;
    const cost = getHintCost(game.puzzle.difficulty);
    const ok = await spendCoins(cost, `Hint: ${hintPrompt.axis} ${hintPrompt.index + 1}`);
    if (ok) {
      if (hintPrompt.axis === 'row') {
        game.applyRowHint(hintPrompt.index);
      } else {
        game.applyColHint(hintPrompt.index);
      }
    }
    setHintPrompt(null);
  }, [hintPrompt, game, spendCoins]);

  const handleHintCancel = useCallback(() => {
    setHintPrompt(null);
  }, []);

  const handleEdgeReveal = useCallback(async () => {
    const ok = await spendCoins(EDGE_REVEAL_COST, 'Power-up: Edge Reveal');
    if (ok) {
      game.applyEdgeReveal();
      setEdgeRevealUsed(true);
    }
  }, [spendCoins, game]);

  const handleBomb = useCallback(async () => {
    const ok = await spendCoins(BOMB_COST, 'Power-up: Bomb');
    if (ok) {
      game.applyBomb();
      setBombUsed(true);
    }
  }, [spendCoins, game]);

  // Keyboard shortcuts: Ctrl+Z -> undo, Ctrl+Shift+Z / Ctrl+Y -> redo
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

  // Keep edgeRevealUsed/bombUsed referenced to avoid lint warnings
  void edgeRevealUsed;
  void bombUsed;
  void handleEdgeReveal;
  void handleBomb;

  if (loading || !game.puzzle) {
    return <div className={styles.page}>Loading...</div>;
  }

  const difficulty = game.puzzle.difficulty;
  const badgeClass = difficulty
    ? `${styles.difficultyBadge} ${styles[`badge${difficulty.charAt(0).toUpperCase()}${difficulty.slice(1)}`]}`
    : undefined;

  const coinReward = difficulty ? calculateCoinReward(difficulty) : 0;
  const backUrl = themeId ? `/themes/${themeId}` : '/puzzles';
  const totalCells = game.puzzle.solution.filter(c => c === 1).length;
  const solvedCells = countFilledCells(game.grid, game.puzzle.solution);
  const progressPct = totalCells > 0 ? Math.round((solvedCells / totalCells) * 100) : 0;
  const solutionThumb = getSolutionThumb(game.puzzle.solution, game.puzzle.size);

  // Display "Mystery Puzzle" until solved
  const displayTitle = game.completed ? game.puzzle.title : 'Mystery Puzzle';

  return (
    <div className={styles.page}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <h1 className={styles.puzzleTitle}>
          {themeName && (
            <span className={styles.breadcrumb}>
              <button
                className={styles.breadcrumbLink}
                onClick={() => navigate(backUrl)}
                type="button"
              >
                {themeName}
              </button>
              <span aria-hidden="true"> &rsaquo; </span>
            </span>
          )}
          {game.completed ? game.puzzle.title : (
            <>Puzzle <span className={styles.titleMuted}>&mdash;</span> {displayTitle}</>
          )}
        </h1>
        <div className={styles.topBarStats}>
          <div className={styles.statItem}>
            <span aria-hidden="true">&#x23F1;&#xFE0F;</span>
            <span className={styles.statValue}>{formatTime(elapsedTime)}</span>
          </div>
          {difficulty && (
            <span className={badgeClass}>
              {difficulty} &middot; {game.puzzle.size}&times;{game.puzzle.size}
            </span>
          )}
          <span className={styles.sizeBadge}>{game.puzzle.size}&times;{game.puzzle.size}</span>
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

      {/* Main Game Layout */}
      <main className={styles.gameMain}>
        <div className={styles.puzzleArea}>
          {/* Puzzle board */}
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

          {/* Vertical tool palette */}
          <div className={styles.toolPalette} role="toolbar" aria-label="Drawing tools">
            <button
              className={`${styles.toolBtn} ${game.tool === Tool.Fill ? styles.toolBtnActive : ''}`}
              onClick={() => game.setTool(Tool.Fill)}
              title="Fill tool"
              disabled={game.completed}
              aria-pressed={game.tool === Tool.Fill}
            >
              🖊️
            </button>
            <button
              className={`${styles.toolBtn} ${game.tool === Tool.Cross ? styles.toolBtnActive : ''}`}
              onClick={() => game.setTool(Tool.Cross)}
              title="X-Mark tool"
              disabled={game.completed}
              aria-pressed={game.tool === Tool.Cross}
            >
              ✕
            </button>
            <div className={styles.toolDivider} />
            <button
              className={styles.toolBtn}
              onClick={undoWithSound}
              title="Undo (Ctrl+Z)"
              disabled={!game.canUndo || game.completed}
            >
              ↩️
            </button>
            <button
              className={styles.toolBtn}
              onClick={game.redo}
              title="Redo (Ctrl+Shift+Z)"
              disabled={!game.canRedo || game.completed}
            >
              ↪️
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          {/* Puzzle Info Card */}
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarTitle}>Puzzle Info</div>
            <div className={game.completed ? styles.puzzleThumbRevealed : styles.puzzleThumb}>
              {solutionThumb.map((on, i) => (
                <div key={i} className={on ? styles.thumbCellOn : styles.thumbCellOff} />
              ))}
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Name</span>
              <span className={game.completed ? styles.infoValue : styles.hiddenName}>
                {displayTitle}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Size</span>
              <span className={styles.infoValue}>{game.puzzle.size}&times;{game.puzzle.size}</span>
            </div>
            {difficulty && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Difficulty</span>
                <span className={badgeClass}>{difficulty}</span>
              </div>
            )}
          </div>

          {/* Actions Card */}
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarTitle}>Actions</div>
            <button
              className={styles.actionBtnGold}
              onClick={() => {
                if (game.puzzle) {
                  setHintPrompt({ axis: 'row', index: 0 });
                }
              }}
              disabled={game.completed}
            >
              ✨ Get Hint
            </button>
            <button
              className={styles.actionBtnMuted}
              onClick={handleReset}
              disabled={game.completed}
            >
              Reset Puzzle
            </button>
          </div>

          {/* Progress Card */}
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarTitle}>Progress</div>
            <div
              className={styles.progressTrack}
              role="progressbar"
              aria-valuenow={solvedCells}
              aria-valuemin={0}
              aria-valuemax={totalCells}
              aria-label={`${solvedCells} of ${totalCells} cells solved`}
            >
              <div
                className={styles.progressFill}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className={styles.progressText}>
              {solvedCells} / {totalCells} cells solved
            </div>
          </div>
        </aside>
      </main>

      {/* Hint Prompt Modal */}
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

      {/* Tutorial */}
      {!tutorialSeen && !loading && (
        <TutorialOverlay onComplete={markTutorialSeen} />
      )}

      {/* Completion Modal */}
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
          <div className={styles.completionCard}>
            <div className={styles.completionEmoji} aria-hidden="true">🎉</div>
            <h2 className={styles.completionTitle}>Puzzle Complete!</h2>

            {/* Revealed pattern */}
            <div
              className={styles.completionPattern}
              style={{
                gridTemplateColumns: `repeat(${game.puzzle.size}, 14px)`,
                gridTemplateRows: `repeat(${game.puzzle.size}, 14px)`,
              }}
            >
              {game.puzzle.solution.map((cell, i) => (
                <div
                  key={i}
                  className={cell === 1 ? styles.cpCellOn : styles.cpCellOff}
                />
              ))}
            </div>

            <div className={styles.completionStats}>
              <div>
                <div className={styles.compStatValue}>{formatTime(elapsedTime)}</div>
                <div className={styles.compStatLabel}>Time</div>
              </div>
            </div>

            {coinReward > 0 && (
              <p className={styles.coinReward} aria-label={`Earned ${coinReward} coins`}>
                +{coinReward} <span aria-hidden="true">🪙</span>
              </p>
            )}

            <div className={styles.completionButtons}>
              <button className={styles.nextPuzzleButton} onClick={() => navigate('/puzzles')}>
                Next Puzzle →
              </button>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
