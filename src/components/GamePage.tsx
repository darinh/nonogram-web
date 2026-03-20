import { useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePuzzleProvider, useProgressProvider } from '../providers/ProviderContext';
import { useNonogramGame } from '../hooks/useNonogramGame';
import { useDragPaint } from '../hooks/useDragPaint';
import { downloadPuzzleFile } from '../engine/serialization';
import NonogramGrid from './NonogramGrid';
import Toolbar from './Toolbar';
import styles from '../styles/GamePage.module.css';
import { useState } from 'react';
import type { PuzzleDefinition } from '../engine/types';

export default function GamePage() {
  const { puzzleId } = useParams<{ puzzleId: string }>();
  const navigate = useNavigate();
  const puzzleProvider = usePuzzleProvider();
  const progressProvider = useProgressProvider();
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzleId]);

  const dragPaint = useDragPaint({
    onPaintCell: game.paintCell,
    gridSize: game.puzzle?.size ?? 0,
  });

  if (loading || !game.puzzle) {
    return <div className={styles.page}>Loading...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate('/puzzles')}>
          ← Back
        </button>
        <h1 className={styles.puzzleTitle}>{game.puzzle.title}</h1>
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
          onReset={game.resetGrid}
          completed={game.completed}
        />

        <NonogramGrid
          grid={game.grid}
          size={game.puzzle.size}
          rowClues={game.puzzle.rowClues}
          colClues={game.puzzle.colClues}
          completed={game.completed}
          onCellMouseDown={dragPaint.handleCellMouseDown}
          onCellMouseEnter={dragPaint.handleCellMouseEnter}
          onMouseUp={dragPaint.handleMouseUp}
        />
      </div>

      {game.completed && (
        <div className={styles.completionOverlay}>
          <div className={styles.completionMessage}>
            <span className={styles.checkMark}>✓</span>
            <h2>Puzzle Complete!</h2>
            <p>Great job solving "{game.puzzle.title}"!</p>
            <button className={styles.continueButton} onClick={() => navigate('/puzzles')}>
              More Puzzles
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
