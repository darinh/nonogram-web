import { useState, useCallback, useRef } from 'react';
import { CellState, Tool } from '../engine/types';
import type { PuzzleDefinition, PuzzleProgress } from '../engine/types';
import { validateGrid } from '../engine/validation';

interface GameState {
  puzzle: PuzzleDefinition | null;
  grid: CellState[];
  tool: Tool;
  completed: boolean;
  elapsedTime: number;
}

interface UseNonogramGameOptions {
  onSaveProgress?: (progress: PuzzleProgress) => void;
}

export function useNonogramGame(options: UseNonogramGameOptions = {}) {
  const [state, setState] = useState<GameState>({
    puzzle: null,
    grid: [],
    tool: Tool.Fill,
    completed: false,
    elapsedTime: 0,
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  const loadPuzzle = useCallback(
    (puzzle: PuzzleDefinition, existingProgress?: PuzzleProgress | null) => {
      const grid = existingProgress
        ? existingProgress.grid
        : new Array(puzzle.size * puzzle.size).fill(CellState.Empty);

      const completed = existingProgress?.completed ?? false;

      setState({
        puzzle,
        grid,
        tool: Tool.Fill,
        completed,
        elapsedTime: existingProgress?.elapsedTime ?? 0,
      });
    },
    [],
  );

  const setTool = useCallback((tool: Tool) => {
    setState(prev => ({ ...prev, tool }));
  }, []);

  const paintCell = useCallback(
    (row: number, col: number): boolean => {
      const s = stateRef.current;
      if (!s.puzzle || s.completed) return false;

      const index = row * s.puzzle.size + col;
      if (index < 0 || index >= s.grid.length) return false;

      // Only paint empty cells
      if (s.grid[index] !== CellState.Empty) return false;

      const newGrid = [...s.grid];
      newGrid[index] = s.tool === Tool.Fill ? CellState.Filled : CellState.Crossed;

      const isCompleted = validateGrid(newGrid, s.puzzle.solution);

      const newState: GameState = {
        ...s,
        grid: newGrid,
        completed: isCompleted,
      };

      setState(newState);

      // Auto-save progress
      if (options.onSaveProgress && s.puzzle) {
        options.onSaveProgress({
          puzzleId: s.puzzle.id,
          grid: newGrid,
          completed: isCompleted,
          elapsedTime: newState.elapsedTime,
          lastPlayed: new Date().toISOString(),
        });
      }

      return true;
    },
    [options],
  );

  const resetGrid = useCallback(() => {
    setState(prev => {
      if (!prev.puzzle) return prev;
      const newGrid = new Array(prev.puzzle.size * prev.puzzle.size).fill(CellState.Empty);

      if (options.onSaveProgress && prev.puzzle) {
        options.onSaveProgress({
          puzzleId: prev.puzzle.id,
          grid: newGrid,
          completed: false,
          elapsedTime: prev.elapsedTime,
          lastPlayed: new Date().toISOString(),
        });
      }

      return { ...prev, grid: newGrid, completed: false };
    });
  }, [options]);

  return {
    puzzle: state.puzzle,
    grid: state.grid,
    tool: state.tool,
    completed: state.completed,
    loadPuzzle,
    setTool,
    paintCell,
    resetGrid,
  };
}
