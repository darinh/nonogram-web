import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
} from 'firebase/firestore';
import { db as _db } from '../../firebase';
const db = _db!;
import type { ProgressProvider, StreakData } from './ProgressProvider';
import type { PuzzleProgress, ThemeProgress } from '../../engine/types';

/**
 * Firestore-backed implementation of ProgressProvider.
 *
 * Document layout:
 *   users/{uid}/progress/{puzzleId}  — PuzzleProgress
 *   users/{uid}/themes/{themeId}     — ThemeProgress
 *   users/{uid}/data/streak          — StreakData
 */
export class FirestoreProgressProvider implements ProgressProvider {
  private readonly uid: string;

  constructor(uid: string) {
    this.uid = uid;
  }

  async getProgress(puzzleId: string): Promise<PuzzleProgress | null> {
    const ref = doc(db, 'users', this.uid, 'progress', puzzleId);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as PuzzleProgress) : null;
  }

  async saveProgress(progress: PuzzleProgress): Promise<void> {
    const ref = doc(db, 'users', this.uid, 'progress', progress.puzzleId);
    await setDoc(ref, progress);
  }

  async getAllProgress(): Promise<PuzzleProgress[]> {
    const colRef = collection(db, 'users', this.uid, 'progress');
    const snap = await getDocs(colRef);
    return snap.docs.map((d) => d.data() as PuzzleProgress);
  }

  async clearProgress(puzzleId: string): Promise<void> {
    const ref = doc(db, 'users', this.uid, 'progress', puzzleId);
    await deleteDoc(ref);
  }

  async getThemeProgress(themeId: string): Promise<ThemeProgress | null> {
    const ref = doc(db, 'users', this.uid, 'themes', themeId);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as ThemeProgress) : null;
  }

  async saveThemeProgress(progress: ThemeProgress): Promise<void> {
    const ref = doc(db, 'users', this.uid, 'themes', progress.themeId);
    await setDoc(ref, progress);
  }

  async getAllThemeProgress(): Promise<ThemeProgress[]> {
    const colRef = collection(db, 'users', this.uid, 'themes');
    const snap = await getDocs(colRef);
    return snap.docs.map((d) => d.data() as ThemeProgress);
  }

  async getStreak(): Promise<StreakData> {
    const ref = doc(db, 'users', this.uid, 'data', 'streak');
    const snap = await getDoc(ref);
    return snap.exists()
      ? (snap.data() as StreakData)
      : { current: 0, longest: 0, lastDate: '' };
  }

  async recordDailyCompletion(date: string): Promise<void> {
    const streak = await this.getStreak();

    if (streak.lastDate === date) return;

    if (streak.lastDate === getYesterday(date)) {
      streak.current += 1;
    } else {
      streak.current = 1;
    }

    streak.longest = Math.max(streak.longest, streak.current);
    streak.lastDate = date;

    const ref = doc(db, 'users', this.uid, 'data', 'streak');
    await setDoc(ref, streak);
  }
}

function getYesterday(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00Z');
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}
