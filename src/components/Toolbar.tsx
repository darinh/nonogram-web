import { Tool } from '../engine/types';
import styles from '../styles/Toolbar.module.css';

interface ToolbarProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
  onReset: () => void;
  completed: boolean;
}

export default function Toolbar({ activeTool, onToolChange, onReset, completed }: ToolbarProps) {
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
