import { useState, useRef, useCallback, useMemo } from 'react';
import { CellState } from '../engine/types';
import type { Tool } from '../engine/types';
import { isLineSatisfied, getRowLine, getColLine } from '../engine/validation';
import { useGridNavigation } from '../hooks/useGridNavigation';
import styles from '../styles/NonogramGrid.module.css';

interface NonogramGridProps {
  grid: CellState[];
  size: number;
  rowClues: number[][];
  colClues: number[][];
  completed: boolean;
  onCellMouseDown: (row: number, col: number) => void;
  onCellMouseEnter: (row: number, col: number) => void;
  onMouseUp: () => void;
  /** Called when a cell is activated via keyboard (Enter/Space). */
  onActivateCell: (row: number, col: number) => void;
  /** Called when the user presses 'f' or 'x' to switch tools. */
  onToolChange?: (tool: Tool) => void;
  /** Called when a clue cell is clicked (for hint prompts). */
  onClueClick?: (axis: 'row' | 'col', index: number) => void;
}

function getCellCoords(el: Element | null): { row: number; col: number } | null {
  if (!el) return null;
  const cellEl = el.closest<HTMLElement>('[data-row]');
  if (!cellEl) return null;
  const row = Number(cellEl.dataset.row);
  const col = Number(cellEl.dataset.col);
  if (isNaN(row) || isNaN(col)) return null;
  return { row, col };
}

/** Describe a cell state for screen readers. */
function cellStateLabel(state: CellState): string {
  switch (state) {
    case CellState.Filled:
      return 'filled';
    case CellState.Crossed:
      return 'crossed';
    default:
      return 'empty';
  }
}

export default function NonogramGrid({
  grid,
  size,
  rowClues,
  colClues,
  completed,
  onCellMouseDown,
  onCellMouseEnter,
  onMouseUp,
  onActivateCell,
  onToolChange,
  onClueClick,
}: NonogramGridProps) {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastHoveredRef = useRef<{ row: number; col: number } | null>(null);
  const maxRowClueLen = Math.max(...rowClues.map(c => c.length));
  const maxColClueLen = Math.max(...colClues.map(c => c.length));

  const {
    focusedCell,
    handleCellKeyDown,
    getCellTabIndex,
    setGridElement,
  } = useGridNavigation({
    size,
    onActivateCell,
    onToolChange,
    enabled: !completed,
  });

  const satisfiedRows = useMemo(
    () => new Set(rowClues.map((clue, i) => isLineSatisfied(getRowLine(grid, size, i), clue) ? i : -1).filter(i => i >= 0)),
    [grid, size, rowClues],
  );
  const satisfiedCols = useMemo(
    () => new Set(colClues.map((clue, i) => isLineSatisfied(getColLine(grid, size, i), clue) ? i : -1).filter(i => i >= 0)),
    [grid, size, colClues],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const coords = getCellCoords(el);
      if (coords) {
        const last = lastHoveredRef.current;
        if (!last || last.row !== coords.row || last.col !== coords.col) {
          lastHoveredRef.current = coords;
          setHoveredCell(coords);
          onCellMouseEnter(coords.row, coords.col);
        }
      } else if (lastHoveredRef.current !== null) {
        lastHoveredRef.current = null;
        setHoveredCell(null);
      }
    },
    [onCellMouseEnter],
  );

  const handlePointerUp = useCallback(() => {
    onMouseUp();
  }, [onMouseUp]);

  const handlePointerLeave = useCallback(() => {
    onMouseUp();
    lastHoveredRef.current = null;
    setHoveredCell(null);
  }, [onMouseUp]);

  return (
    <div
      ref={(el) => {
        // Merge refs: containerRef for pointer capture, setGridElement for keyboard focus management
        (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
        setGridElement(el);
      }}
      className={`${styles.container} ${completed ? styles.completed : ''}`}
      role="group"
      aria-label="Nonogram puzzle grid"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${maxRowClueLen}, auto) repeat(${size}, 1fr)`,
        gridTemplateRows: `repeat(${maxColClueLen}, auto) repeat(${size}, 1fr)`,
      }}
    >
      {/* Column clues — each number in its own grid cell */}
      {colClues.map((clue, colIdx) => {
        const paddedClue = Array.from(
          { length: maxColClueLen },
          (_, i) => i < maxColClueLen - clue.length ? null : clue[i - (maxColClueLen - clue.length)],
        );

        return paddedClue.map((n, clueRow) => (
          <div
            key={`cc-${colIdx}-${clueRow}`}
            className={`${styles.colClueCell} ${!completed && hoveredCell?.col === colIdx ? styles.highlightedClue : ''} ${satisfiedCols.has(colIdx) ? styles.satisfied : ''} ${onClueClick && !completed ? styles.clickableClue : ''}`}
            style={{
              gridColumn: maxRowClueLen + 1 + colIdx,
              gridRow: clueRow + 1,
            }}
            role={onClueClick && !completed && n !== null ? 'button' : undefined}
            tabIndex={onClueClick && !completed && n !== null ? 0 : undefined}
            aria-label={onClueClick && !completed && n !== null ? `Column ${colIdx + 1} clue ${n}` : undefined}
            onClick={onClueClick && !completed ? () => onClueClick('col', colIdx) : undefined}
            onKeyDown={onClueClick && !completed ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClueClick('col', colIdx); } } : undefined}
          >
            {n !== null && <span className={styles.clueNumber}>{n}</span>}
          </div>
        ));
      })}

      {/* Row clues — each number in its own grid cell */}
      {rowClues.map((clue, rowIdx) => {
        const paddedClue = Array.from(
          { length: maxRowClueLen },
          (_, i) => i < maxRowClueLen - clue.length ? null : clue[i - (maxRowClueLen - clue.length)],
        );

        return paddedClue.map((n, clueCol) => (
          <div
            key={`rc-${rowIdx}-${clueCol}`}
            className={`${styles.rowClueCell} ${!completed && hoveredCell?.row === rowIdx ? styles.highlightedClue : ''} ${satisfiedRows.has(rowIdx) ? styles.satisfied : ''} ${onClueClick && !completed ? styles.clickableClue : ''}`}
            style={{
              gridColumn: clueCol + 1,
              gridRow: maxColClueLen + 1 + rowIdx,
            }}
            role={onClueClick && !completed && n !== null ? 'button' : undefined}
            tabIndex={onClueClick && !completed && n !== null ? 0 : undefined}
            aria-label={onClueClick && !completed && n !== null ? `Row ${rowIdx + 1} clue ${n}` : undefined}
            onClick={onClueClick && !completed ? () => onClueClick('row', rowIdx) : undefined}
            onKeyDown={onClueClick && !completed ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClueClick('row', rowIdx); } } : undefined}
          >
            {n !== null && <span className={styles.clueNumber}>{n}</span>}
          </div>
        ));
      })}

      {/* Game cells */}
      {Array.from({ length: size }).map((_, row) =>
        Array.from({ length: size }).map((_, col) => {
          const index = row * size + col;
          const cellState = grid[index];
          const isThickRight = (col + 1) % 5 === 0 && col + 1 !== size;
          const isThickBottom = (row + 1) % 5 === 0 && row + 1 !== size;
          const isHighlighted = !completed && hoveredCell !== null &&
            (hoveredCell.row === row || hoveredCell.col === col) &&
            !(hoveredCell.row === row && hoveredCell.col === col);
          const isFocused = !completed && focusedCell !== null &&
            focusedCell.row === row && focusedCell.col === col;

          return (
            <div
              key={`cell-${row}-${col}`}
              role="button"
              aria-label={`Row ${row + 1}, Column ${col + 1}, ${cellStateLabel(cellState)}`}
              tabIndex={getCellTabIndex(row, col)}
              onKeyDown={handleCellKeyDown}
              className={`${styles.cell} ${
                cellState === CellState.Filled ? styles.filled : ''
              } ${cellState === CellState.Crossed ? styles.crossed : ''} ${
                isThickRight ? styles.thickRight : ''
              } ${isThickBottom ? styles.thickBottom : ''} ${
                isHighlighted ? styles.highlighted : ''
              } ${isFocused ? styles.focused : ''}`}
              style={{
                gridColumn: maxRowClueLen + 1 + col,
                gridRow: maxColClueLen + 1 + row,
              }}
              data-row={row}
              data-col={col}
              onPointerDown={(e) => {
                e.preventDefault();
                onCellMouseDown(row, col);
                lastHoveredRef.current = { row, col };
                setHoveredCell({ row, col });
                containerRef.current?.setPointerCapture(e.pointerId);
              }}
            >
              {cellState === CellState.Crossed && (
                <svg viewBox="0 0 24 24" className={styles.xMark}>
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              )}
            </div>
          );
        }),
      )}
    </div>
  );
}
