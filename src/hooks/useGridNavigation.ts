import { useState, useCallback, useRef, useEffect } from 'react';
import type { Tool } from '../engine/types';

export interface UseGridNavigationOptions {
  size: number;
  onActivateCell: (row: number, col: number) => void;
  onToolChange?: (tool: Tool) => void;
  enabled?: boolean;
}

export interface UseGridNavigationReturn {
  focusedCell: { row: number; col: number } | null;
  setFocusedCell: (cell: { row: number; col: number } | null) => void;
  handleCellKeyDown: (e: React.KeyboardEvent) => void;
  getCellTabIndex: (row: number, col: number) => number;
  gridRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Keyboard navigation for a grid using roving tabindex pattern.
 *
 * Arrow keys move focus, Enter/Space activates the cell,
 * Home jumps to (0,0), End jumps to (size-1, size-1), Escape clears focus.
 */
export function useGridNavigation({
  size,
  onActivateCell,
  onToolChange,
  enabled = true,
}: UseGridNavigationOptions): UseGridNavigationReturn {
  const [focusedCell, setFocusedCell] = useState<{ row: number; col: number } | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  // Keep a ref to the latest onActivateCell to avoid stale closures
  const onActivateCellRef = useRef(onActivateCell);
  onActivateCellRef.current = onActivateCell;

  const onToolChangeRef = useRef(onToolChange);
  onToolChangeRef.current = onToolChange;

  // When focusedCell changes, programmatically move DOM focus
  useEffect(() => {
    if (!focusedCell || !gridRef.current) return;
    const cell = gridRef.current.querySelector<HTMLElement>(
      `[data-row="${focusedCell.row}"][data-col="${focusedCell.col}"]`,
    );
    cell?.focus();
  }, [focusedCell]);

  const handleCellKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!enabled) return;

      // Don't handle if a modifier is held (let Ctrl+Z etc. pass through)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      let nextRow = focusedCell?.row ?? 0;
      let nextCol = focusedCell?.col ?? 0;
      let handled = true;

      switch (e.key) {
        case 'ArrowUp':
          nextRow = Math.max(0, nextRow - 1);
          break;
        case 'ArrowDown':
          nextRow = Math.min(size - 1, nextRow + 1);
          break;
        case 'ArrowLeft':
          nextCol = Math.max(0, nextCol - 1);
          break;
        case 'ArrowRight':
          nextCol = Math.min(size - 1, nextCol + 1);
          break;
        case 'Home':
          nextRow = 0;
          nextCol = 0;
          break;
        case 'End':
          nextRow = size - 1;
          nextCol = size - 1;
          break;
        case 'Escape':
          setFocusedCell(null);
          // Return focus to the grid container so the user can tab away
          gridRef.current?.focus();
          e.preventDefault();
          return;
        case 'Enter':
        case ' ':
          if (focusedCell) {
            onActivateCellRef.current(focusedCell.row, focusedCell.col);
          }
          e.preventDefault();
          return;
        case 'x':
        case 'X':
          onToolChangeRef.current?.('cross');
          e.preventDefault();
          return;
        case 'f':
        case 'F':
          onToolChangeRef.current?.('fill');
          e.preventDefault();
          return;
        default:
          handled = false;
      }

      if (handled) {
        e.preventDefault();
        setFocusedCell({ row: nextRow, col: nextCol });
      }
    },
    [enabled, focusedCell, size],
  );

  const getCellTabIndex = useCallback(
    (row: number, col: number): number => {
      if (!focusedCell) {
        // No cell focused — make (0,0) tabbable so the grid is reachable
        return row === 0 && col === 0 ? 0 : -1;
      }
      return focusedCell.row === row && focusedCell.col === col ? 0 : -1;
    },
    [focusedCell],
  );

  return {
    focusedCell,
    setFocusedCell,
    handleCellKeyDown,
    getCellTabIndex,
    gridRef,
  };
}
