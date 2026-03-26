import { useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePuzzles } from '../hooks/usePuzzles';
import { useProgress } from '../hooks/useProgress';
import { useStreak } from '../hooks/useStreak';
import { usePageTitle } from '../hooks/usePageTitle';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useAuth } from '../hooks/useAuth';
import { formatTime, formatDuration, formatRelativeDate } from '../utils/formatTime';
import type { PuzzleDefinition, PuzzleProgress } from '../engine/types';
import styles from '../styles/ProfilePage.module.css';

interface Achievement {
  icon: string;
  name: string;
  description: string;
  check: (stats: ProfileStats) => boolean;
}

interface ProfileStats {
  totalCompleted: number;
  bestStreak: number;
  totalTime: number;
  avgTime: number;
  bestTime: number;
}

const ACHIEVEMENTS: Achievement[] = [
  { icon: '🌟', name: 'First Solve', description: 'Complete your first puzzle', check: s => s.totalCompleted >= 1 },
  { icon: '🔥', name: 'On Fire', description: '7-day streak', check: s => s.bestStreak >= 7 },
  { icon: '⚡', name: 'Speed Demon', description: 'Solve a puzzle in under 2 minutes', check: s => s.bestTime > 0 && s.bestTime < 120 },
  { icon: '🏆', name: 'Century', description: 'Solve 100 puzzles', check: s => s.totalCompleted >= 100 },
  { icon: '💎', name: 'Perfectionist', description: 'Solve 10 puzzles without errors', check: s => s.totalCompleted >= 10 },
  { icon: '🌍', name: 'Explorer', description: 'Solve 50 puzzles', check: s => s.totalCompleted >= 50 },
  { icon: '🔒', name: '???', description: 'Solve 500 puzzles', check: s => s.totalCompleted >= 500 },
  { icon: '🔒', name: '???', description: '30-day streak', check: s => s.bestStreak >= 30 },
];

interface StatCardDef {
  label: string;
  colorClass: string;
  getValue: (stats: ProfileStats, totalPuzzles: number) => string;
}

const STAT_CARDS: StatCardDef[] = [
  { label: 'Puzzles Solved', colorClass: 'statPink', getValue: s => String(s.totalCompleted) },
  { label: 'Accuracy', colorClass: 'statGreen', getValue: (s, t) => t > 0 ? `${Math.round((s.totalCompleted / t) * 100)}%` : '0%' },
  { label: 'Best Streak', colorClass: 'statOrange', getValue: s => `${s.bestStreak} days` },
  { label: 'Total Time', colorClass: 'statCyan', getValue: s => formatDuration(s.totalTime) },
  { label: 'Avg. Solve Time', colorClass: 'statPurple', getValue: s => formatTime(s.avgTime) },
  { label: 'Best Time', colorClass: 'statGold', getValue: s => s.bestTime > 0 ? formatTime(s.bestTime) : '—' },
];

function useCounterAnimation(target: number, visible: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!visible || !ref.current) return;
    const el = ref.current;
    const end = target;
    if (end <= 0) return;
    let cur = 0;
    const step = Math.ceil(end / 40);
    const timer = setInterval(() => {
      cur = Math.min(cur + step, end);
      el.textContent = String(cur);
      if (cur >= end) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [target, visible]);
  return ref;
}

export default function ProfilePage() {
  usePageTitle('Profile — Nonogram');
  useScrollReveal();

  const { puzzles, loading: puzzlesLoading } = usePuzzles();
  const { allProgress, loading: progressLoading } = useProgress();
  const { streak, loading: streakLoading } = useStreak();
  const { user } = useAuth();
  const navigate = useNavigate();

  const loading = puzzlesLoading || progressLoading || streakLoading;

  const puzzleMap = useMemo(() => {
    const map = new Map<string, PuzzleDefinition>();
    for (const p of puzzles) map.set(p.id, p);
    return map;
  }, [puzzles]);

  const completedProgress = useMemo(
    () => allProgress.filter(p => p.completed),
    [allProgress],
  );

  const stats: ProfileStats = useMemo(() => {
    const totalCompleted = completedProgress.length;
    const totalTime = allProgress.reduce((sum, p) => sum + p.elapsedTime, 0);
    const avgTime = completedProgress.length > 0
      ? completedProgress.reduce((sum, p) => sum + p.elapsedTime, 0) / completedProgress.length
      : 0;
    const bestTime = completedProgress.length > 0
      ? Math.min(...completedProgress.map(p => p.elapsedTime))
      : 0;
    return { totalCompleted, bestStreak: streak.longest, totalTime, avgTime, bestTime };
  }, [completedProgress, allProgress, streak]);

  const recentActivity = useMemo(() => {
    return completedProgress
      .slice()
      .sort((a, b) => new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime())
      .slice(0, 8)
      .map(p => ({ progress: p, puzzle: puzzleMap.get(p.puzzleId) }))
      .filter((item): item is { progress: PuzzleProgress; puzzle: PuzzleDefinition } =>
        item.puzzle !== undefined,
      );
  }, [completedProgress, puzzleMap]);

  const achievements = useMemo(() => {
    return ACHIEVEMENTS.map(a => ({ ...a, unlocked: a.check(stats) }));
  }, [stats]);

  const username = user?.username ?? 'Puzzle Player';
  const initials = username.slice(0, 2).toUpperCase();
  const xp = stats.totalCompleted * 100;
  const level = Math.floor(xp / 1000) + 1;
  const xpInLevel = xp % 1000;
  const xpForNext = 1000;
  const xpPct = Math.round((xpInLevel / xpForNext) * 100);

  const counterRef = useCounterAnimation(stats.totalCompleted, !loading);

  if (loading) {
    return (
      <div className={styles.page}>
        <p className={styles.loading} role="status">Loading profile…</p>
      </div>
    );
  }

  if (allProgress.length === 0) {
    return (
      <div className={styles.page}>
        <header className={`${styles.hero} ${styles.sectionDark}`}>
          <div className={styles.container}>
            <h1 className={styles.heroTitle}>PROFILE</h1>
          </div>
        </header>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon} aria-hidden="true">🧩</div>
          <h2 className={styles.emptyTitle}>No stats yet</h2>
          <p className={styles.emptyText}>Start solving puzzles and your profile will come to life!</p>
          <button className={styles.emptyAction} onClick={() => navigate('/puzzles')}>Browse Puzzles</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={`${styles.hero} ${styles.sectionDark}`}>
        <div className={styles.container}>
          <h1 className={`${styles.heroTitle} reveal`}>PROFILE</h1>
        </div>
      </header>

      <section className={styles.sectionDark}>
        <div className={styles.playerCardWrap}>
          <div className={`${styles.playerCard} reveal`}>
            <div className={styles.playerAvatar}><span>{initials}</span></div>
            <div className={styles.playerUsername}>{username}</div>
            <div className={styles.playerRank}>🏅 Level {level}</div>
            <div className={styles.playerLevel}>Level {level}</div>
            <div className={styles.xpBar}><div className={styles.xpBarFill} style={{ width: `${xpPct}%` }} /></div>
            <div className={styles.xpBarLabel}>
              <span>{xpInLevel.toLocaleString()} XP</span>
              <span>{xpForNext.toLocaleString()} XP</span>
            </div>
            <div className={styles.playerMeta}>
              {streak.current > 0 && (
                <span className={styles.playerMetaStreak}>🔥 {streak.current}-day streak</span>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionLight}`}>
        <div className={styles.container}>
          <h2 className={`${styles.sectionTitleBar} reveal`}>Statistics</h2>
          <div className={styles.statsGrid} role="list" aria-label="Statistics">
            {STAT_CARDS.map((card, i) => (
              <div key={i} className={`${styles.statCard} reveal`} role="listitem">
                <div
                  className={`${styles.statNumber} ${styles[card.colorClass]}`}
                  ref={i === 0 ? counterRef : undefined}
                >
                  {card.getValue(stats, puzzles.length)}
                </div>
                <div className={styles.statLabel}>{card.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionDark}`}>
        <div className={styles.container}>
          <h2 className={`${styles.sectionTitleBar} reveal`}>Achievements</h2>
          <div className={styles.achievementsGrid}>
            {achievements.map((a, i) => (
              <div
                key={i}
                className={`${styles.achievement} ${a.unlocked ? styles.achievementUnlocked : styles.achievementLocked} reveal`}
              >
                <span className={styles.achIcon} aria-hidden="true">{a.unlocked ? a.icon : '🔒'}</span>
                <div className={styles.achName}>{a.unlocked ? a.name : '???'}</div>
                <div className={styles.achDesc}>{a.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {recentActivity.length > 0 && (
        <section className={`${styles.section} ${styles.sectionLight}`}>
          <div className={styles.container}>
            <h2 className={`${styles.sectionTitleBar} reveal`}>Recent Activity</h2>
            <ul className={styles.activityList}>
              {recentActivity.map(({ puzzle, progress }) => (
                <li key={puzzle.id} className={`${styles.activityItem} reveal`}>
                  <span className={styles.activityTime}>{formatRelativeDate(progress.lastPlayed)}</span>
                  <span className={styles.activityText}>
                    ✅ Solved <strong>{puzzle.title}</strong> ({puzzle.size}×{puzzle.size}) in {formatTime(progress.elapsedTime)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
