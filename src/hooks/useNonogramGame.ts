import { useState, useCallback, useRef } from 'react';
import { CellState, Tool } from '../engine/types';
import type { DragMode, PuzzleDefinition, PuzzleProgress, BombConfig, BombResult } from '../engine/types';
import { validateGrid } from '../engine/validation';
import { applyRowHint, applyColHint } from '../engine/hints';
import { applyEdgeReveal, applyBomb } from '../engine/powerups';
import { DEFAULT_BOMB_CONFIG } from '../engine/constants';

const MAX_UNDO_HISTORY = 100;

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

  const undoStack = useRef<CellState[][]>([]);
  const redoStack = useRef<CellState[][]>([]);

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

  const getDragMode = useCallback(
    (row: number, col: number): DragMode | null => {
      const s = stateRef.current;
      if (!s.puzzle || s.completed) return null;

      const index = row * s.puzzle.size + col;
      if (index < 0 || index >= s.grid.length) return null;

      const cellState = s.grid[index];
      if (cellState === CellState.Empty) return 'fill';

      // Cell matches active tool → erase it
      const toolState = s.tool === Tool.Fill ? CellState.Filled : CellState.Crossed;
      if (cellState === toolState) return 'erase';

      // Cell set by other tool → no-op
      return null;
    },
    [],
  );

  const paintCell = useCallback(
    (row: number, col: number, mode: DragMode): boolean => {
      const s = stateRef.current;
      if (!s.puzzle || s.completed) return false;

      const index = row * s.puzzle.size + col;
      if (index < 0 || index >= s.grid.length) return false;

      const toolState = s.tool === Tool.Fill ? CellState.Filled : CellState.Crossed;

      if (mode === 'fill') {
        // Only paint empty cells
        if (s.grid[index] !== CellState.Empty) return false;
      } else {
        // Erase mode: only unset cells that match the active tool's state
        if (s.grid[index] !== toolState) return false;
      }

      // Snapshot current grid for undo before mutating
      undoStack.current = [...undoStack.current.slice(-(MAX_UNDO_HISTORY - 1)), [...s.grid]];
      redoStack.current = [];

      const newGrid = [...s.grid];
      newGrid[index] = mode === 'fill' ? toolState : CellState.Empty;

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
    undoStack.current = [];
    redoStack.current = [];
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

  const undo = useCallback(() => {
    const prev = undoStack.current.pop();
    if (!prev) return;
    const s = stateRef.current;
    redoStack.current.push([...s.grid]);
    const isCompleted = s.puzzle ? validateGrid(prev, s.puzzle.solution) : false;
    setState(cur => ({ ...cur, grid: prev, completed: isCompleted }));
  }, []);

  const redo = useCallback(() => {
    const next = redoStack.current.pop();
    if (!next) return;
    const s = stateRef.current;
    undoStack.current.push([...s.grid]);
    const isCompleted = s.puzzle ? validateGrid(next, s.puzzle.solution) : false;
    setState(cur => ({ ...cur, grid: next, completed: isCompleted }));
  }, []);

  const applyRowHintAction = useCallback(
    (row: number): boolean => {
      const s = stateRef.current;
      if (!s.puzzle || s.completed) return false;
      if (row < 0 || row >= s.puzzle.size) return false;

      undoStack.current = [...undoStack.current.slice(-(MAX_UNDO_HISTORY - 1)), [...s.grid]];
      redoStack.current = [];

      const newGrid = applyRowHint(s.grid, s.puzzle.solution, s.puzzle.size, row);
      const isCompleted = validateGrid(newGrid, s.puzzle.solution);

      setState(cur => ({ ...cur, grid: newGrid, completed: isCompleted }));

      if (options.onSaveProgress && s.puzzle) {
        options.onSaveProgress({
          puzzleId: s.puzzle.id,
          grid: newGrid,
          completed: isCompleted,
          elapsedTime: s.elapsedTime,
          lastPlayed: new Date().toISOString(),
        });
      }

      return true;
    },
    [options],
  );

  const applyColHintAction = useCallback(
    (col: number): boolean => {
      const s = stateRef.current;
      if (!s.puzzle || s.completed) return false;
      if (col < 0 || col >= s.puzzle.size) return false;

      undoStack.current = [...undoStack.current.slice(-(MAX_UNDO_HISTORY - 1)), [...s.grid]];
      redoStack.current = [];

      const newGrid = applyColHint(s.grid, s.puzzle.solution, s.puzzle.size, col);
      const isCompleted = validateGrid(newGrid, s.puzzle.solution);

      setState(cur => ({ ...cur, grid: newGrid, completed: isCompleted }));

      if (options.onSaveProgress && s.puzzle) {
        options.onSaveProgress({
          puzzleId: s.puzzle.id,
          grid: newGrid,
          completed: isCompleted,
          elapsedTime: s.elapsedTime,
          lastPlayed: new Date().toISOString(),
        });
      }

      return true;
    },
    [options],
  );

  const applyEdgeRevealAction = useCallback((): CellState[] => {
    const s = stateRef.current;
    if (!s.puzzle || s.completed) return [...s.grid];

    undoStack.current = [...undoStack.current.slice(-(MAX_UNDO_HISTORY - 1)), [...s.grid]];
    redoStack.current = [];

    const newGrid = applyEdgeReveal(s.grid, s.puzzle.solution, s.puzzle.size);
    const isCompleted = validateGrid(newGrid, s.puzzle.solution);

    setState(cur => ({ ...cur, grid: newGrid, completed: isCompleted }));

    if (options.onSaveProgress && s.puzzle) {
      options.onSaveProgress({
        puzzleId: s.puzzle.id,
        grid: newGrid,
        completed: isCompleted,
        elapsedTime: s.elapsedTime,
        lastPlayed: new Date().toISOString(),
      });
    }

    return newGrid;
  }, [options]);

  const applyBombAction = useCallback(
    (config?: BombConfig): BombResult => {
      const s = stateRef.current;
      if (!s.puzzle || s.completed) {
        return { grid: [...s.grid], revealedPositions: [] };
      }

      undoStack.current = [...undoStack.current.slice(-(MAX_UNDO_HISTORY - 1)), [...s.grid]];
      redoStack.current = [];

      const bombConfig = config ?? DEFAULT_BOMB_CONFIG;
      const result = applyBomb(s.grid, s.puzzle.solution, s.puzzle.size, bombConfig);
      const isCompleted = validateGrid(result.grid, s.puzzle.solution);

      setState(cur => ({ ...cur, grid: result.grid, completed: isCompleted }));

      if (options.onSaveProgress && s.puzzle) {
        options.onSaveProgress({
          puzzleId: s.puzzle.id,
          grid: result.grid,
          completed: isCompleted,
          elapsedTime: s.elapsedTime,
          lastPlayed: new Date().toISOString(),
        });
      }

      return result;
    },
    [options],
  );

  const canUndo = undoStack.current.length > 0;
  const canRedo = redoStack.current.length > 0;

  return {
    puzzle: state.puzzle,
    grid: state.grid,
    tool: state.tool,
    completed: state.completed,
    loadPuzzle,
    setTool,
    paintCell,
    getDragMode,
    resetGrid,
    undo,
    redo,
    canUndo,
    canRedo,
    applyRowHint: applyRowHintAction,
    applyColHint: applyColHintAction,
    applyEdgeReveal: applyEdgeRevealAction,
    applyBomb: applyBombAction,
  };
}
