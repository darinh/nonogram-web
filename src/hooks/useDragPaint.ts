import { useRef, useCallback } from 'react';
import type { DragMode } from '../engine/types';

type Direction = 'horizontal' | 'vertical' | null;

interface DragState {
  isDragging: boolean;
  startRow: number;
  startCol: number;
  direction: Direction;
  paintedCells: Set<string>;
  mode: DragMode | null;
}

interface UseDragPaintOptions {
  onPaintCell: (row: number, col: number, mode: DragMode) => boolean;
  getDragMode: (row: number, col: number) => DragMode | null;
  onDragEnd?: () => void;
  gridSize: number;
}

function cellKey(row: number, col: number): string {
  return `${row},${col}`;
}

export function useDragPaint({ onPaintCell, getDragMode, onDragEnd, gridSize }: UseDragPaintOptions) {
  const dragState = useRef<DragState>({
    isDragging: false,
    startRow: -1,
    startCol: -1,
    direction: null,
    paintedCells: new Set(),
    mode: null,
  });

  const handleCellMouseDown = useCallback(
    (row: number, col: number) => {
      const mode = getDragMode(row, col);
      if (mode === null) {
        // No-op: cell set by other tool, don't start drag
        dragState.current = {
          isDragging: false,
          startRow: -1,
          startCol: -1,
          direction: null,
          paintedCells: new Set(),
          mode: null,
        };
        return;
      }

      const painted = onPaintCell(row, col, mode);
      dragState.current = {
        isDragging: true,
        startRow: row,
        startCol: col,
        direction: null,
        paintedCells: new Set(painted ? [cellKey(row, col)] : []),
        mode,
      };
    },
    [onPaintCell, getDragMode],
  );

  const handleCellMouseEnter = useCallback(
    (row: number, col: number) => {
      const state = dragState.current;
      if (!state.isDragging || state.mode === null) return;

      // Determine direction on the second cell
      if (state.direction === null) {
        if (row === state.startRow && col !== state.startCol) {
          state.direction = 'horizontal';
        } else if (col === state.startCol && row !== state.startRow) {
          state.direction = 'vertical';
        } else {
          // Diagonal movement — ignore
          return;
        }
      }

      // Enforce direction lock
      if (state.direction === 'horizontal' && row !== state.startRow) return;
      if (state.direction === 'vertical' && col !== state.startCol) return;

      // Bounds check
      if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) return;

      // Paint all cells between last painted and current (fill gaps from fast mouse movement)
      const key = cellKey(row, col);
      if (!state.paintedCells.has(key)) {
        onPaintCell(row, col, state.mode);
        state.paintedCells.add(key);
      }
    },
    [onPaintCell, gridSize],
  );

  const handleMouseUp = useCallback(() => {
    if (dragState.current.isDragging) {
      dragState.current = {
        isDragging: false,
        startRow: -1,
        startCol: -1,
        direction: null,
        paintedCells: new Set(),
        mode: null,
      };
      onDragEnd?.();
    }
  }, [onDragEnd]);

  return {
    handleCellMouseDown,
    handleCellMouseEnter,
    handleMouseUp,
  };
}
