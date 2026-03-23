import { useState, useRef, useCallback } from 'react';
import { CellState } from '../engine/types';
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

export default function NonogramGrid({
  grid,
  size,
  rowClues,
  colClues,
  completed,
  onCellMouseDown,
  onCellMouseEnter,
  onMouseUp,
}: NonogramGridProps) {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastHoveredRef = useRef<{ row: number; col: number } | null>(null);
  const maxRowClueLen = Math.max(...rowClues.map(c => c.length));
  const maxColClueLen = Math.max(...colClues.map(c => c.length));

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
      ref={containerRef}
      className={`${styles.container} ${completed ? styles.completed : ''}`}
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
            className={`${styles.colClueCell} ${!completed && hoveredCell?.col === colIdx ? styles.highlighted : ''}`}
            style={{
              gridColumn: maxRowClueLen + 1 + colIdx,
              gridRow: clueRow + 1,
            }}
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
            className={`${styles.rowClueCell} ${!completed && hoveredCell?.row === rowIdx ? styles.highlighted : ''}`}
            style={{
              gridColumn: clueCol + 1,
              gridRow: maxColClueLen + 1 + rowIdx,
            }}
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

          return (
            <div
              key={`cell-${row}-${col}`}
              className={`${styles.cell} ${
                cellState === CellState.Filled ? styles.filled : ''
              } ${cellState === CellState.Crossed ? styles.crossed : ''} ${
                isThickRight ? styles.thickRight : ''
              } ${isThickBottom ? styles.thickBottom : ''} ${
                isHighlighted ? styles.highlighted : ''
              }`}
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
