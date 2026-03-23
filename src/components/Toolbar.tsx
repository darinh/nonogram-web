import { Tool } from '../engine/types';
import styles from '../styles/Toolbar.module.css';

interface ToolbarProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
  onReset: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  completed: boolean;
}

export default function Toolbar({ activeTool, onToolChange, onReset, onUndo, onRedo, canUndo, canRedo, completed }: ToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.tools}>
        <button
          className={`${styles.toolButton} ${activeTool === Tool.Fill ? styles.active : ''}`}
          onClick={() => onToolChange(Tool.Fill)}
          title="Fill tool (pencil)"
          disabled={completed}
        >
          <svg viewBox="0 0 24 24" className={styles.icon}>
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" />
            <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
          </svg>
          <span>Fill</span>
        </button>

        <button
          className={`${styles.toolButton} ${activeTool === Tool.Cross ? styles.active : ''}`}
          onClick={() => onToolChange(Tool.Cross)}
          title="Mark as empty (X)"
          disabled={completed}
        >
          <svg viewBox="0 0 24 24" className={styles.icon}>
            <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2.5" />
            <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2.5" />
          </svg>
          <span>Mark X</span>
        </button>
      </div>

      <div className={styles.historyButtons}>
        <button
          className={styles.historyButton}
          onClick={onUndo}
          disabled={!canUndo || completed}
          title="Undo (Ctrl+Z)"
        >
          <svg viewBox="0 0 24 24" className={styles.icon}>
            <path d="M12.5 8c-2.65 0-5.05 1.04-6.83 2.73L3 8v9h9l-2.83-2.83A7.95 7.95 0 0 1 12.5 12c3.04 0 5.64 1.7 6.96 4.21l1.77-.89A9.96 9.96 0 0 0 12.5 8z" />
          </svg>
        </button>
        <button
          className={styles.historyButton}
          onClick={onRedo}
          disabled={!canRedo || completed}
          title="Redo (Ctrl+Shift+Z)"
        >
          <svg viewBox="0 0 24 24" className={styles.icon}>
            <path d="M11.5 8c2.65 0 5.05 1.04 6.83 2.73L21 8v9h-9l2.83-2.83A7.95 7.95 0 0 0 11.5 12c-3.04 0-5.64 1.7-6.96 4.21l-1.77-.89A9.96 9.96 0 0 1 11.5 8z" />
          </svg>
        </button>
      </div>

      <button
        className={styles.resetButton}
        onClick={onReset}
        disabled={completed}
      >
        Reset
      </button>
    </div>
  );
}
