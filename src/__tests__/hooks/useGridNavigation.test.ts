import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGridNavigation } from '../../hooks/useGridNavigation';

/** Create a minimal React.KeyboardEvent-like object for testing. */
function keyEvent(key: string, extras: Partial<React.KeyboardEvent> = {}): React.KeyboardEvent {
  return {
    key,
    preventDefault: vi.fn(),
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    ...extras,
  } as unknown as React.KeyboardEvent;
}

describe('useGridNavigation', () => {
  const defaultOpts = () => ({
    size: 5,
    onActivateCell: vi.fn(),
  });

  // ── Initial state ────────────────────────────────────────

  it('starts with focusedCell as null', () => {
    const { result } = renderHook(() => useGridNavigation(defaultOpts()));
    expect(result.current.focusedCell).toBeNull();
  });

  // ── getCellTabIndex ──────────────────────────────────────

  it('getCellTabIndex returns 0 for (0,0) when no cell is focused', () => {
    const { result } = renderHook(() => useGridNavigation(defaultOpts()));
    expect(result.current.getCellTabIndex(0, 0)).toBe(0);
    expect(result.current.getCellTabIndex(1, 0)).toBe(-1);
    expect(result.current.getCellTabIndex(4, 4)).toBe(-1);
  });

  it('getCellTabIndex returns 0 only for the focused cell', () => {
    const { result } = renderHook(() => useGridNavigation(defaultOpts()));
    act(() => result.current.setFocusedCell({ row: 2, col: 3 }));

    expect(result.current.getCellTabIndex(2, 3)).toBe(0);
    expect(result.current.getCellTabIndex(0, 0)).toBe(-1);
    expect(result.current.getCellTabIndex(2, 2)).toBe(-1);
  });

  // ── Arrow key movement ───────────────────────────────────

  it('ArrowDown moves focus down', () => {
    const { result } = renderHook(() => useGridNavigation(defaultOpts()));
    act(() => result.current.setFocusedCell({ row: 0, col: 0 }));

    act(() => result.current.handleCellKeyDown(keyEvent('ArrowDown')));
    expect(result.current.focusedCell).toEqual({ row: 1, col: 0 });
  });

  it('ArrowUp moves focus up', () => {
    const { result } = renderHook(() => useGridNavigation(defaultOpts()));
    act(() => result.current.setFocusedCell({ row: 2, col: 1 }));

    act(() => result.current.handleCellKeyDown(keyEvent('ArrowUp')));
    expect(result.current.focusedCell).toEqual({ row: 1, col: 1 });
  });

  it('ArrowRight moves focus right', () => {
    const { result } = renderHook(() => useGridNavigation(defaultOpts()));
    act(() => result.current.setFocusedCell({ row: 0, col: 1 }));

    act(() => result.current.handleCellKeyDown(keyEvent('ArrowRight')));
    expect(result.current.focusedCell).toEqual({ row: 0, col: 2 });
  });

  it('ArrowLeft moves focus left', () => {
    const { result } = renderHook(() => useGridNavigation(defaultOpts()));
    act(() => result.current.setFocusedCell({ row: 0, col: 3 }));

    act(() => result.current.handleCellKeyDown(keyEvent('ArrowLeft')));
    expect(result.current.focusedCell).toEqual({ row: 0, col: 2 });
  });

  // ── Clamping at boundaries ───────────────────────────────

  it('clamps at top boundary (ArrowUp from row 0)', () => {
    const { result } = renderHook(() => useGridNavigation(defaultOpts()));
    act(() => result.current.setFocusedCell({ row: 0, col: 2 }));

    act(() => result.current.handleCellKeyDown(keyEvent('ArrowUp')));
    expect(result.current.focusedCell).toEqual({ row: 0, col: 2 });
  });

  it('clamps at bottom boundary (ArrowDown from last row)', () => {
    const { result } = renderHook(() => useGridNavigation(defaultOpts()));
    act(() => result.current.setFocusedCell({ row: 4, col: 2 }));

    act(() => result.current.handleCellKeyDown(keyEvent('ArrowDown')));
    expect(result.current.focusedCell).toEqual({ row: 4, col: 2 });
  });

  it('clamps at left boundary (ArrowLeft from col 0)', () => {
    const { result } = renderHook(() => useGridNavigation(defaultOpts()));
    act(() => result.current.setFocusedCell({ row: 1, col: 0 }));

    act(() => result.current.handleCellKeyDown(keyEvent('ArrowLeft')));
    expect(result.current.focusedCell).toEqual({ row: 1, col: 0 });
  });

  it('clamps at right boundary (ArrowRight from last col)', () => {
    const { result } = renderHook(() => useGridNavigation(defaultOpts()));
    act(() => result.current.setFocusedCell({ row: 1, col: 4 }));

    act(() => result.current.handleCellKeyDown(keyEvent('ArrowRight')));
    expect(result.current.focusedCell).toEqual({ row: 1, col: 4 });
  });

  // ── Enter / Space activation ─────────────────────────────

  it('Enter calls onActivateCell with the focused cell', () => {
    const opts = defaultOpts();
    const { result } = renderHook(() => useGridNavigation(opts));
    act(() => result.current.setFocusedCell({ row: 3, col: 2 }));

    act(() => result.current.handleCellKeyDown(keyEvent('Enter')));
    expect(opts.onActivateCell).toHaveBeenCalledWith(3, 2);
  });

  it('Space calls onActivateCell with the focused cell', () => {
    const opts = defaultOpts();
    const { result } = renderHook(() => useGridNavigation(opts));
    act(() => result.current.setFocusedCell({ row: 1, col: 4 }));

    act(() => result.current.handleCellKeyDown(keyEvent(' ')));
    expect(opts.onActivateCell).toHaveBeenCalledWith(1, 4);
  });

  it('Enter/Space does nothing when no cell is focused', () => {
    const opts = defaultOpts();
    const { result } = renderHook(() => useGridNavigation(opts));

    act(() => result.current.handleCellKeyDown(keyEvent('Enter')));
    act(() => result.current.handleCellKeyDown(keyEvent(' ')));
    expect(opts.onActivateCell).not.toHaveBeenCalled();
  });

  // ── Home / End ───────────────────────────────────────────

  it('Home moves focus to (0, 0)', () => {
    const { result } = renderHook(() => useGridNavigation(defaultOpts()));
    act(() => result.current.setFocusedCell({ row: 3, col: 4 }));

    act(() => result.current.handleCellKeyDown(keyEvent('Home')));
    expect(result.current.focusedCell).toEqual({ row: 0, col: 0 });
  });

  it('End moves focus to (size-1, size-1)', () => {
    const { result } = renderHook(() => useGridNavigation(defaultOpts()));
    act(() => result.current.setFocusedCell({ row: 1, col: 1 }));

    act(() => result.current.handleCellKeyDown(keyEvent('End')));
    expect(result.current.focusedCell).toEqual({ row: 4, col: 4 });
  });

  // ── Escape ───────────────────────────────────────────────

  it('Escape clears focus', () => {
    const { result } = renderHook(() => useGridNavigation(defaultOpts()));
    act(() => result.current.setFocusedCell({ row: 2, col: 2 }));

    act(() => result.current.handleCellKeyDown(keyEvent('Escape')));
    expect(result.current.focusedCell).toBeNull();
  });

  // ── Enabled flag ─────────────────────────────────────────

  it('does nothing when enabled is false', () => {
    const opts = { ...defaultOpts(), enabled: false };
    const { result } = renderHook(() => useGridNavigation(opts));
    act(() => result.current.setFocusedCell({ row: 0, col: 0 }));

    const ev = keyEvent('ArrowDown');
    act(() => result.current.handleCellKeyDown(ev));
    // Focus should not have moved
    expect(result.current.focusedCell).toEqual({ row: 0, col: 0 });
    expect(ev.preventDefault).not.toHaveBeenCalled();
  });

  // ── Modifier keys pass through ───────────────────────────

  it('does not handle keys when Ctrl is held (lets Ctrl+Z through)', () => {
    const opts = defaultOpts();
    const { result } = renderHook(() => useGridNavigation(opts));
    act(() => result.current.setFocusedCell({ row: 1, col: 1 }));

    const ev = keyEvent('ArrowDown', { ctrlKey: true });
    act(() => result.current.handleCellKeyDown(ev));
    // Focus should stay put — event was not handled
    expect(result.current.focusedCell).toEqual({ row: 1, col: 1 });
    expect(ev.preventDefault).not.toHaveBeenCalled();
  });

  // ── preventDefault ───────────────────────────────────────

  it('calls preventDefault on handled arrow keys', () => {
    const { result } = renderHook(() => useGridNavigation(defaultOpts()));
    act(() => result.current.setFocusedCell({ row: 1, col: 1 }));

    const ev = keyEvent('ArrowDown');
    act(() => result.current.handleCellKeyDown(ev));
    expect(ev.preventDefault).toHaveBeenCalled();
  });

  it('does not call preventDefault on unrecognized keys', () => {
    const { result } = renderHook(() => useGridNavigation(defaultOpts()));
    act(() => result.current.setFocusedCell({ row: 1, col: 1 }));

    const ev = keyEvent('a');
    act(() => result.current.handleCellKeyDown(ev));
    expect(ev.preventDefault).not.toHaveBeenCalled();
  });

  // ── Arrow from null focus ────────────────────────────────

  it('arrow keys start from (0,0) when focusedCell is null', () => {
    const { result } = renderHook(() => useGridNavigation(defaultOpts()));
    expect(result.current.focusedCell).toBeNull();

    act(() => result.current.handleCellKeyDown(keyEvent('ArrowDown')));
    expect(result.current.focusedCell).toEqual({ row: 1, col: 0 });
  });
});
