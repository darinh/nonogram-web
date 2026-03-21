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
  const maxRowClueLen = Math.max(...rowClues.map(c => c.length));
  const maxColClueLen = Math.max(...colClues.map(c => c.length));

  // Grid layout: maxRowClueLen columns for row clues + size columns for cells
  //              maxColClueLen rows for col clues + size rows for cells

  return (
    <div
      className={`${styles.container} ${completed ? styles.completed : ''}`}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
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
            className={styles.colClueCell}
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
            className={styles.rowClueCell}
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

          return (
            <div
              key={`cell-${row}-${col}`}
              className={`${styles.cell} ${
                cellState === CellState.Filled ? styles.filled : ''
              } ${cellState === CellState.Crossed ? styles.crossed : ''} ${
                isThickRight ? styles.thickRight : ''
              } ${isThickBottom ? styles.thickBottom : ''}`}
              style={{
                gridColumn: maxRowClueLen + 1 + col,
                gridRow: maxColClueLen + 1 + row,
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                onCellMouseDown(row, col);
              }}
              onMouseEnter={() => onCellMouseEnter(row, col)}
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
