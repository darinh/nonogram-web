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
  const maxRowClueLength = Math.max(...rowClues.map(c => c.length));
  const maxColClueLength = Math.max(...colClues.map(c => c.length));

  return (
    <div
      className={`${styles.container} ${completed ? styles.completed : ''}`}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* Column clues area */}
      <div
        className={styles.colCluesRow}
        style={{
          gridColumn: `${maxRowClueLength + 1} / span ${size}`,
          display: 'grid',
          gridTemplateColumns: `repeat(${size}, 1fr)`,
        }}
      >
        {colClues.map((clue, colIdx) => (
          <div key={colIdx} className={styles.colClue}>
            {Array.from({ length: maxColClueLength - clue.length }).map((_, i) => (
              <span key={`pad-${i}`} className={styles.clueNumber}>&nbsp;</span>
            ))}
            {clue.map((n, i) => (
              <span key={i} className={styles.clueNumber}>{n}</span>
            ))}
          </div>
        ))}
      </div>

      {/* Grid rows with row clues */}
      {Array.from({ length: size }).map((_, row) => (
        <div key={row} className={styles.gridRow}>
          {/* Row clue */}
          <div className={styles.rowClue}>
            {rowClues[row].map((n, i) => (
              <span key={i} className={styles.clueNumber}>{n}</span>
            ))}
          </div>

          {/* Cells */}
          {Array.from({ length: size }).map((_, col) => {
            const index = row * size + col;
            const cellState = grid[index];
            const isThickRight = (col + 1) % 5 === 0 && col + 1 !== size;
            const isThickBottom = (row + 1) % 5 === 0 && row + 1 !== size;

            return (
              <div
                key={col}
                className={`${styles.cell} ${
                  cellState === CellState.Filled ? styles.filled : ''
                } ${cellState === CellState.Crossed ? styles.crossed : ''} ${
                  isThickRight ? styles.thickRight : ''
                } ${isThickBottom ? styles.thickBottom : ''}`}
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
          })}
        </div>
      ))}
    </div>
  );
}
