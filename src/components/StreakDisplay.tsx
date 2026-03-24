import styles from '../styles/StreakDisplay.module.css';

interface StreakDisplayProps {
  current: number;
  longest: number;
}

export default function StreakDisplay({ current, longest }: StreakDisplayProps) {
  if (current === 0) return null;

  return (
    <div className={styles.streak} title={`Longest streak: ${longest} day${longest !== 1 ? 's' : ''}`}>
      <span className={styles.fire} aria-hidden="true">🔥</span>
      <span className={styles.count}>{current}</span>
      <span className={styles.label}>day{current !== 1 ? 's' : ''}</span>
      {longest > current && (
        <span className={styles.longest}>(best: {longest})</span>
      )}
    </div>
  );
}
