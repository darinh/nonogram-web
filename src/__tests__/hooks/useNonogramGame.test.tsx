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

  it('paints a cell with the fill tool', () => {
    const { result } = renderHook(() => useNonogramGame());
    act(() => result.current.loadPuzzle(testPuzzle));
    act(() => { result.current.paintCell(0, 0); });
    expect(result.current.grid[0]).toBe(CellState.Filled);
  });

  it('paints a cell with the cross tool', () => {
    const { result } = renderHook(() => useNonogramGame());
    act(() => result.current.loadPuzzle(testPuzzle));
    act(() => result.current.setTool(Tool.Cross));
    act(() => { result.current.paintCell(2, 2); });
    expect(result.current.grid[12]).toBe(CellState.Crossed);
  });

  it('does not paint an already-painted cell', () => {
    const { result } = renderHook(() => useNonogramGame());
    act(() => result.current.loadPuzzle(testPuzzle));
    act(() => { result.current.paintCell(0, 0); });
    expect(result.current.grid[0]).toBe(CellState.Filled);
    // Try to paint again — should not change
    act(() => result.current.setTool(Tool.Cross));
    act(() => { result.current.paintCell(0, 0); });
    expect(result.current.grid[0]).toBe(CellState.Filled);
  });

  it('detects completion when all solution cells are filled', () => {
    const { result } = renderHook(() => useNonogramGame());
    act(() => result.current.loadPuzzle(testPuzzle));
    act(() => { result.current.paintCell(0, 0); });
    expect(result.current.completed).toBe(false);
    act(() => { result.current.paintCell(0, 1); });
    expect(result.current.completed).toBe(true);
  });

  it('resets the grid', () => {
    const { result } = renderHook(() => useNonogramGame());
    act(() => result.current.loadPuzzle(testPuzzle));
    act(() => { result.current.paintCell(0, 0); });
    act(() => result.current.resetGrid());
    expect(result.current.grid.every(c => c === CellState.Empty)).toBe(true);
    expect(result.current.completed).toBe(false);
  });

  it('calls onSaveProgress when painting', () => {
    const onSaveProgress = vi.fn();
    const { result } = renderHook(() => useNonogramGame({ onSaveProgress }));
    act(() => result.current.loadPuzzle(testPuzzle));
    act(() => { result.current.paintCell(0, 0); });
    expect(onSaveProgress).toHaveBeenCalledTimes(1);
    expect(onSaveProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        puzzleId: 'test-1',
        completed: false,
      }),
    );
  });
});
