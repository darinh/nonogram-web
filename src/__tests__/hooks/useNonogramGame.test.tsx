import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNonogramGame } from '../../hooks/useNonogramGame';
import { CellState, Tool } from '../../engine/types';
import type { PuzzleDefinition } from '../../engine/types';

const testPuzzle: PuzzleDefinition = {
  id: 'test-1',
  title: 'Test',
  size: 5,
  solution: [
    1, 1, 0, 0, 0,
    0, 0, 0, 0, 0,
    0, 0, 0, 0, 0,
    0, 0, 0, 0, 0,
    0, 0, 0, 0, 0,
  ],
  rowClues: [[2], [0], [0], [0], [0]],
  colClues: [[1], [1], [0], [0], [0]],
  source: 'bundled',
};

describe('useNonogramGame', () => {
  it('initializes with empty state', () => {
    const { result } = renderHook(() => useNonogramGame());
    expect(result.current.puzzle).toBeNull();
    expect(result.current.grid).toEqual([]);
    expect(result.current.tool).toBe(Tool.Fill);
    expect(result.current.completed).toBe(false);
  });

  it('loads a puzzle with empty grid', () => {
    const { result } = renderHook(() => useNonogramGame());
    act(() => result.current.loadPuzzle(testPuzzle));
    expect(result.current.puzzle).toBe(testPuzzle);
    expect(result.current.grid).toHaveLength(25);
    expect(result.current.grid.every(c => c === CellState.Empty)).toBe(true);
  });

  it('switches tools', () => {
    const { result } = renderHook(() => useNonogramGame());
    act(() => result.current.setTool(Tool.Cross));
    expect(result.current.tool).toBe(Tool.Cross);
    act(() => result.current.setTool(Tool.Fill));
    expect(result.current.tool).toBe(Tool.Fill);
  });

  it('paints a cell with the fill tool in fill mode', () => {
    const { result } = renderHook(() => useNonogramGame());
    act(() => result.current.loadPuzzle(testPuzzle));
    act(() => { result.current.paintCell(0, 0, 'fill'); });
    expect(result.current.grid[0]).toBe(CellState.Filled);
  });

  it('paints a cell with the cross tool in fill mode', () => {
    const { result } = renderHook(() => useNonogramGame());
    act(() => result.current.loadPuzzle(testPuzzle));
    act(() => result.current.setTool(Tool.Cross));
    act(() => { result.current.paintCell(2, 2, 'fill'); });
    expect(result.current.grid[12]).toBe(CellState.Crossed);
  });

  it('fill mode skips non-empty cells', () => {
    const { result } = renderHook(() => useNonogramGame());
    act(() => result.current.loadPuzzle(testPuzzle));
    act(() => { result.current.paintCell(0, 0, 'fill'); });
    expect(result.current.grid[0]).toBe(CellState.Filled);
    // Fill mode should not overwrite a filled cell
    let changed = false;
    act(() => { changed = result.current.paintCell(0, 0, 'fill'); });
    expect(changed).toBe(false);
    expect(result.current.grid[0]).toBe(CellState.Filled);
  });

  it('erase mode unsets a cell matching the active tool', () => {
    const { result } = renderHook(() => useNonogramGame());
    act(() => result.current.loadPuzzle(testPuzzle));
    // Fill cell (0,0)
    act(() => { result.current.paintCell(0, 0, 'fill'); });
    expect(result.current.grid[0]).toBe(CellState.Filled);
    // Erase it with fill tool
    act(() => { result.current.paintCell(0, 0, 'erase'); });
    expect(result.current.grid[0]).toBe(CellState.Empty);
  });

  it('erase mode skips cells set by the other tool', () => {
    const { result } = renderHook(() => useNonogramGame());
    act(() => result.current.loadPuzzle(testPuzzle));
    // Cross cell (0,0)
    act(() => result.current.setTool(Tool.Cross));
    act(() => { result.current.paintCell(0, 0, 'fill'); });
    expect(result.current.grid[0]).toBe(CellState.Crossed);
    // Switch to fill tool and try to erase — should not work
    act(() => result.current.setTool(Tool.Fill));
    let changed = false;
    act(() => { changed = result.current.paintCell(0, 0, 'erase'); });
    expect(changed).toBe(false);
    expect(result.current.grid[0]).toBe(CellState.Crossed);
  });

  it('erase mode skips empty cells', () => {
    const { result } = renderHook(() => useNonogramGame());
    act(() => result.current.loadPuzzle(testPuzzle));
    let changed = false;
    act(() => { changed = result.current.paintCell(0, 0, 'erase'); });
    expect(changed).toBe(false);
    expect(result.current.grid[0]).toBe(CellState.Empty);
  });

  it('erase mode with cross tool unsets crossed cells', () => {
    const { result } = renderHook(() => useNonogramGame());
    act(() => result.current.loadPuzzle(testPuzzle));
    act(() => result.current.setTool(Tool.Cross));
    act(() => { result.current.paintCell(2, 2, 'fill'); });
    expect(result.current.grid[12]).toBe(CellState.Crossed);
    act(() => { result.current.paintCell(2, 2, 'erase'); });
    expect(result.current.grid[12]).toBe(CellState.Empty);
  });

  it('detects completion when all solution cells are filled', () => {
    const { result } = renderHook(() => useNonogramGame());
    act(() => result.current.loadPuzzle(testPuzzle));
    act(() => { result.current.paintCell(0, 0, 'fill'); });
    expect(result.current.completed).toBe(false);
    act(() => { result.current.paintCell(0, 1, 'fill'); });
    expect(result.current.completed).toBe(true);
  });

  it('resets the grid', () => {
    const { result } = renderHook(() => useNonogramGame());
    act(() => result.current.loadPuzzle(testPuzzle));
    act(() => { result.current.paintCell(0, 0, 'fill'); });
    act(() => result.current.resetGrid());
    expect(result.current.grid.every(c => c === CellState.Empty)).toBe(true);
    expect(result.current.completed).toBe(false);
  });

  it('calls onSaveProgress when painting', () => {
    const onSaveProgress = vi.fn();
    const { result } = renderHook(() => useNonogramGame({ onSaveProgress }));
    act(() => result.current.loadPuzzle(testPuzzle));
    act(() => { result.current.paintCell(0, 0, 'fill'); });
    expect(onSaveProgress).toHaveBeenCalledTimes(1);
    expect(onSaveProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        puzzleId: 'test-1',
        completed: false,
      }),
    );
  });

  it('calls onSaveProgress when erasing', () => {
    const onSaveProgress = vi.fn();
    const { result } = renderHook(() => useNonogramGame({ onSaveProgress }));
    act(() => result.current.loadPuzzle(testPuzzle));
    act(() => { result.current.paintCell(0, 0, 'fill'); });
    onSaveProgress.mockClear();
    act(() => { result.current.paintCell(0, 0, 'erase'); });
    expect(onSaveProgress).toHaveBeenCalledTimes(1);
  });

  describe('undo/redo', () => {
    it('undo restores the previous grid state', () => {
      const { result } = renderHook(() => useNonogramGame());
      act(() => result.current.loadPuzzle(testPuzzle));
      act(() => { result.current.paintCell(0, 0, 'fill'); });
      expect(result.current.grid[0]).toBe(CellState.Filled);
      act(() => result.current.undo());
      expect(result.current.grid[0]).toBe(CellState.Empty);
    });

    it('redo re-applies the undone state', () => {
      const { result } = renderHook(() => useNonogramGame());
      act(() => result.current.loadPuzzle(testPuzzle));
      act(() => { result.current.paintCell(0, 0, 'fill'); });
      act(() => result.current.undo());
      expect(result.current.grid[0]).toBe(CellState.Empty);
      act(() => result.current.redo());
      expect(result.current.grid[0]).toBe(CellState.Filled);
    });

    it('new paint clears the redo stack', () => {
      const { result } = renderHook(() => useNonogramGame());
      act(() => result.current.loadPuzzle(testPuzzle));
      act(() => { result.current.paintCell(0, 0, 'fill'); });
      act(() => result.current.undo());
      expect(result.current.canRedo).toBe(true);
      act(() => { result.current.paintCell(1, 1, 'fill'); });
      expect(result.current.canRedo).toBe(false);
    });

    it('reset clears both stacks', () => {
      const { result } = renderHook(() => useNonogramGame());
      act(() => result.current.loadPuzzle(testPuzzle));
      act(() => { result.current.paintCell(0, 0, 'fill'); });
      expect(result.current.canUndo).toBe(true);
      act(() => result.current.undo());
      expect(result.current.canRedo).toBe(true);
      act(() => result.current.redo());
      act(() => result.current.resetGrid());
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(false);
    });

    it('canUndo and canRedo reflect stack state', () => {
      const { result } = renderHook(() => useNonogramGame());
      act(() => result.current.loadPuzzle(testPuzzle));
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(false);
      act(() => { result.current.paintCell(0, 0, 'fill'); });
      expect(result.current.canUndo).toBe(true);
      expect(result.current.canRedo).toBe(false);
      act(() => result.current.undo());
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(true);
    });

    it('multiple undo steps restore each prior state', () => {
      const { result } = renderHook(() => useNonogramGame());
      act(() => result.current.loadPuzzle(testPuzzle));
      act(() => { result.current.paintCell(0, 0, 'fill'); });
      act(() => { result.current.paintCell(0, 1, 'fill'); });
      expect(result.current.grid[0]).toBe(CellState.Filled);
      expect(result.current.grid[1]).toBe(CellState.Filled);
      act(() => result.current.undo());
      expect(result.current.grid[0]).toBe(CellState.Filled);
      expect(result.current.grid[1]).toBe(CellState.Empty);
      act(() => result.current.undo());
      expect(result.current.grid[0]).toBe(CellState.Empty);
    });
  });

  describe('getDragMode', () => {
    it('returns fill for empty cells', () => {
      const { result } = renderHook(() => useNonogramGame());
      act(() => result.current.loadPuzzle(testPuzzle));
      expect(result.current.getDragMode(0, 0)).toBe('fill');
    });

    it('returns erase for cells matching the active tool', () => {
      const { result } = renderHook(() => useNonogramGame());
      act(() => result.current.loadPuzzle(testPuzzle));
      act(() => { result.current.paintCell(0, 0, 'fill'); });
      // Fill tool + Filled cell → erase
      expect(result.current.getDragMode(0, 0)).toBe('erase');
    });

    it('returns null for cells set by the other tool', () => {
      const { result } = renderHook(() => useNonogramGame());
      act(() => result.current.loadPuzzle(testPuzzle));
      act(() => result.current.setTool(Tool.Cross));
      act(() => { result.current.paintCell(0, 0, 'fill'); });
      // Switch to fill tool — cell is Crossed → null (other tool)
      act(() => result.current.setTool(Tool.Fill));
      expect(result.current.getDragMode(0, 0)).toBeNull();
    });

    it('returns null when puzzle is completed', () => {
      const { result } = renderHook(() => useNonogramGame());
      act(() => result.current.loadPuzzle(testPuzzle));
      act(() => { result.current.paintCell(0, 0, 'fill'); });
      act(() => { result.current.paintCell(0, 1, 'fill'); });
      expect(result.current.completed).toBe(true);
      expect(result.current.getDragMode(2, 2)).toBeNull();
    });

    it('returns null for out-of-bounds coordinates', () => {
      const { result } = renderHook(() => useNonogramGame());
      act(() => result.current.loadPuzzle(testPuzzle));
      expect(result.current.getDragMode(-1, 0)).toBeNull();
      expect(result.current.getDragMode(0, 99)).toBeNull();
    });

    it('returns erase for crossed cell with cross tool', () => {
      const { result } = renderHook(() => useNonogramGame());
      act(() => result.current.loadPuzzle(testPuzzle));
      act(() => result.current.setTool(Tool.Cross));
      act(() => { result.current.paintCell(1, 1, 'fill'); });
      expect(result.current.getDragMode(1, 1)).toBe('erase');
    });
  });
});
