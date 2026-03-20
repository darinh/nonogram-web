import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDragPaint } from '../../hooks/useDragPaint';

describe('useDragPaint', () => {
  it('paints the starting cell on mousedown', () => {
    const onPaintCell = vi.fn().mockReturnValue(true);
    const { result } = renderHook(() =>
      useDragPaint({ onPaintCell, gridSize: 5 }),
    );

    act(() => result.current.handleCellMouseDown(2, 3));
    expect(onPaintCell).toHaveBeenCalledWith(2, 3);
  });

  it('locks direction horizontally on second cell', () => {
    const onPaintCell = vi.fn().mockReturnValue(true);
    const { result } = renderHook(() =>
      useDragPaint({ onPaintCell, gridSize: 5 }),
    );

    act(() => result.current.handleCellMouseDown(2, 1));
    act(() => result.current.handleCellMouseEnter(2, 2));
    act(() => result.current.handleCellMouseEnter(2, 3));
    // Trying to go to a different row should be ignored
    act(() => result.current.handleCellMouseEnter(3, 3));

    expect(onPaintCell).toHaveBeenCalledWith(2, 1);
    expect(onPaintCell).toHaveBeenCalledWith(2, 2);
    expect(onPaintCell).toHaveBeenCalledWith(2, 3);
    // Should NOT have been called with (3, 3)
    expect(onPaintCell).not.toHaveBeenCalledWith(3, 3);
  });

  it('locks direction vertically on second cell', () => {
    const onPaintCell = vi.fn().mockReturnValue(true);
    const { result } = renderHook(() =>
      useDragPaint({ onPaintCell, gridSize: 5 }),
    );

    act(() => result.current.handleCellMouseDown(1, 2));
    act(() => result.current.handleCellMouseEnter(2, 2));
    act(() => result.current.handleCellMouseEnter(3, 2));
    // Trying different column should be ignored
    act(() => result.current.handleCellMouseEnter(3, 3));

    expect(onPaintCell).toHaveBeenCalledWith(1, 2);
    expect(onPaintCell).toHaveBeenCalledWith(2, 2);
    expect(onPaintCell).toHaveBeenCalledWith(3, 2);
    expect(onPaintCell).not.toHaveBeenCalledWith(3, 3);
  });

  it('does not paint a cell twice during same drag', () => {
    const onPaintCell = vi.fn().mockReturnValue(true);
    const { result } = renderHook(() =>
      useDragPaint({ onPaintCell, gridSize: 5 }),
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
    const onDragEnd = vi.fn();
    const { result } = renderHook(() =>
      useDragPaint({ onPaintCell, onDragEnd, gridSize: 5 }),
    );

    act(() => result.current.handleCellMouseDown(0, 0));
    act(() => result.current.handleMouseUp());

    expect(onDragEnd).toHaveBeenCalledTimes(1);
  });

  it('resets state after mouseUp allowing new drag', () => {
    const onPaintCell = vi.fn().mockReturnValue(true);
    const { result } = renderHook(() =>
      useDragPaint({ onPaintCell, gridSize: 5 }),
    );

    // First drag: horizontal
    act(() => result.current.handleCellMouseDown(0, 0));
    act(() => result.current.handleCellMouseEnter(0, 1));
    act(() => result.current.handleMouseUp());

    // Second drag: vertical (should work, not locked to horizontal)
    act(() => result.current.handleCellMouseDown(2, 2));
    act(() => result.current.handleCellMouseEnter(3, 2));

    expect(onPaintCell).toHaveBeenCalledWith(3, 2);
  });
});
