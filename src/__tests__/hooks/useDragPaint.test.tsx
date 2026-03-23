import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDragPaint } from '../../hooks/useDragPaint';
import type { DragMode } from '../../engine/types';

describe('useDragPaint', () => {
  it('paints the starting cell on mousedown in fill mode', () => {
    const onPaintCell = vi.fn().mockReturnValue(true);
    const getDragMode = vi.fn().mockReturnValue('fill' as DragMode);
    const { result } = renderHook(() =>
      useDragPaint({ onPaintCell, getDragMode, gridSize: 5 }),
    );

    act(() => result.current.handleCellMouseDown(2, 3));
    expect(getDragMode).toHaveBeenCalledWith(2, 3);
    expect(onPaintCell).toHaveBeenCalledWith(2, 3, 'fill');
  });

  it('paints the starting cell on mousedown in erase mode', () => {
    const onPaintCell = vi.fn().mockReturnValue(true);
    const getDragMode = vi.fn().mockReturnValue('erase' as DragMode);
    const { result } = renderHook(() =>
      useDragPaint({ onPaintCell, getDragMode, gridSize: 5 }),
    );

    act(() => result.current.handleCellMouseDown(1, 1));
    expect(onPaintCell).toHaveBeenCalledWith(1, 1, 'erase');
  });

  it('does not start drag when getDragMode returns null', () => {
    const onPaintCell = vi.fn().mockReturnValue(true);
    const getDragMode = vi.fn().mockReturnValue(null);
    const { result } = renderHook(() =>
      useDragPaint({ onPaintCell, getDragMode, gridSize: 5 }),
    );

    act(() => result.current.handleCellMouseDown(2, 3));
    expect(onPaintCell).not.toHaveBeenCalled();

    // Subsequent mouse enter should be ignored (no active drag)
    act(() => result.current.handleCellMouseEnter(2, 4));
    expect(onPaintCell).not.toHaveBeenCalled();
  });

  it('locks direction horizontally on second cell', () => {
    const onPaintCell = vi.fn().mockReturnValue(true);
    const getDragMode = vi.fn().mockReturnValue('fill' as DragMode);
    const { result } = renderHook(() =>
      useDragPaint({ onPaintCell, getDragMode, gridSize: 5 }),
    );

    act(() => result.current.handleCellMouseDown(2, 1));
    act(() => result.current.handleCellMouseEnter(2, 2));
    act(() => result.current.handleCellMouseEnter(2, 3));
    // Trying to go to a different row should be ignored
    act(() => result.current.handleCellMouseEnter(3, 3));

    expect(onPaintCell).toHaveBeenCalledWith(2, 1, 'fill');
    expect(onPaintCell).toHaveBeenCalledWith(2, 2, 'fill');
    expect(onPaintCell).toHaveBeenCalledWith(2, 3, 'fill');
    // Should NOT have been called with (3, 3)
    expect(onPaintCell).not.toHaveBeenCalledWith(3, 3, 'fill');
  });

  it('locks direction vertically on second cell', () => {
    const onPaintCell = vi.fn().mockReturnValue(true);
    const getDragMode = vi.fn().mockReturnValue('fill' as DragMode);
    const { result } = renderHook(() =>
      useDragPaint({ onPaintCell, getDragMode, gridSize: 5 }),
    );

    act(() => result.current.handleCellMouseDown(1, 2));
    act(() => result.current.handleCellMouseEnter(2, 2));
    act(() => result.current.handleCellMouseEnter(3, 2));
    // Trying different column should be ignored
    act(() => result.current.handleCellMouseEnter(3, 3));

    expect(onPaintCell).toHaveBeenCalledWith(1, 2, 'fill');
    expect(onPaintCell).toHaveBeenCalledWith(2, 2, 'fill');
    expect(onPaintCell).toHaveBeenCalledWith(3, 2, 'fill');
    expect(onPaintCell).not.toHaveBeenCalledWith(3, 3, 'fill');
  });

  it('does not paint a cell twice during same drag', () => {
    const onPaintCell = vi.fn().mockReturnValue(true);
    const getDragMode = vi.fn().mockReturnValue('fill' as DragMode);
    const { result } = renderHook(() =>
      useDragPaint({ onPaintCell, getDragMode, gridSize: 5 }),
    );

    act(() => result.current.handleCellMouseDown(0, 0));
    act(() => result.current.handleCellMouseEnter(0, 1));
    act(() => result.current.handleCellMouseEnter(0, 1)); // duplicate
    act(() => result.current.handleCellMouseEnter(0, 1)); // duplicate

    // onPaintCell should only be called twice: (0,0) and (0,1)
    expect(onPaintCell).toHaveBeenCalledTimes(2);
  });

  it('calls onDragEnd on mouseUp', () => {
    const onPaintCell = vi.fn().mockReturnValue(true);
    const getDragMode = vi.fn().mockReturnValue('fill' as DragMode);
    const onDragEnd = vi.fn();
    const { result } = renderHook(() =>
      useDragPaint({ onPaintCell, getDragMode, onDragEnd, gridSize: 5 }),
    );

    act(() => result.current.handleCellMouseDown(0, 0));
    act(() => result.current.handleMouseUp());

    expect(onDragEnd).toHaveBeenCalledTimes(1);
  });

  it('resets state after mouseUp allowing new drag', () => {
    const onPaintCell = vi.fn().mockReturnValue(true);
    const getDragMode = vi.fn().mockReturnValue('fill' as DragMode);
    const { result } = renderHook(() =>
      useDragPaint({ onPaintCell, getDragMode, gridSize: 5 }),
    );

    // First drag: horizontal
    act(() => result.current.handleCellMouseDown(0, 0));
    act(() => result.current.handleCellMouseEnter(0, 1));
    act(() => result.current.handleMouseUp());

    // Second drag: vertical (should work, not locked to horizontal)
    act(() => result.current.handleCellMouseDown(2, 2));
    act(() => result.current.handleCellMouseEnter(3, 2));

    expect(onPaintCell).toHaveBeenCalledWith(3, 2, 'fill');
  });

  it('passes erase mode to all cells during erase drag', () => {
    const onPaintCell = vi.fn().mockReturnValue(true);
    const getDragMode = vi.fn().mockReturnValue('erase' as DragMode);
    const { result } = renderHook(() =>
      useDragPaint({ onPaintCell, getDragMode, gridSize: 5 }),
    );

    act(() => result.current.handleCellMouseDown(0, 0));
    act(() => result.current.handleCellMouseEnter(0, 1));
    act(() => result.current.handleCellMouseEnter(0, 2));

    expect(onPaintCell).toHaveBeenCalledWith(0, 0, 'erase');
    expect(onPaintCell).toHaveBeenCalledWith(0, 1, 'erase');
    expect(onPaintCell).toHaveBeenCalledWith(0, 2, 'erase');
  });

  it('does not call onDragEnd when no drag was started', () => {
    const onPaintCell = vi.fn().mockReturnValue(true);
    const getDragMode = vi.fn().mockReturnValue(null);
    const onDragEnd = vi.fn();
    const { result } = renderHook(() =>
      useDragPaint({ onPaintCell, getDragMode, onDragEnd, gridSize: 5 }),
    );

    // Click on a cell that returns null mode (no drag starts)
    act(() => result.current.handleCellMouseDown(0, 0));
    act(() => result.current.handleMouseUp());

    expect(onDragEnd).not.toHaveBeenCalled();
  });
});
