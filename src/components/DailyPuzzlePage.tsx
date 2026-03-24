import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { useStreak } from '../hooks/useStreak';
import { usePageTitle } from '../hooks/usePageTitle';
import { getTodayDateString } from '../engine/daily';
import StreakDisplay from './StreakDisplay';
import styles from '../styles/DailyPuzzlePage.module.css';

function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function msUntilUTCMidnight(): number {
  const now = new Date();
  const tomorrow = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
  );
  return tomorrow - now.getTime();
}

function formatDisplayDate(dateString: string): string {
  const date = new Date(dateString + 'T12:00:00Z');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export default function DailyPuzzlePage() {
  usePageTitle('Daily Puzzle — Nonogram');
  const navigate = useNavigate();
  const todayId = `daily-${getTodayDateString()}`;
  const todayDate = getTodayDateString();
  const { progress } = useProgress(todayId);
  const { streak, recordCompletion } = useStreak();
  const [countdown, setCountdown] = useState(msUntilUTCMidnight());

  useEffect(() => {
    const id = setInterval(() => setCountdown(msUntilUTCMidnight()), 1000);
    return () => clearInterval(id);
  }, []);

  const completed = progress?.completed ?? false;

  // Record daily completion when puzzle is completed
  useEffect(() => {
    if (completed) {
      recordCompletion(todayDate);
    }
  }, [completed, todayDate]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.page}>
      <div className={styles.badge}>📅 Daily Challenge</div>
      <h1 className={styles.title}>{formatDisplayDate(getTodayDateString())}</h1>
      <p className={styles.subtitle}>A new 10×10 puzzle every day</p>

      <div className={styles.card}>
        {completed ? (
          <>
            <div className={styles.completedIcon}>✓</div>
            <p className={styles.completedText}>You solved today's puzzle!</p>
            {streak.current > 0 && (
              <div style={{ margin: '12px 0' }}>
                <StreakDisplay current={streak.current} longest={streak.longest} />
              </div>
            )}
            <p className={styles.comeback}>Come back tomorrow for a new puzzle.</p>
          </>
        ) : (
          <>
            <p className={styles.prompt}>
              {progress ? 'Continue where you left off' : 'Ready to play?'}
            </p>
            <button
              className={styles.playButton}
              onClick={() => navigate(`/play/${todayId}`)}
            >
              {progress ? '▶ Continue' : '▶ Play'}
            </button>
          </>
        )}
      </div>

      <div className={styles.countdownSection}>
        <p className={styles.countdownLabel}>Next puzzle in</p>
        <div className={styles.countdown}>{formatCountdown(countdown)}</div>
      </div>
    </div>
  );
}
