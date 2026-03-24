import { useState, useEffect } from 'react';
import { useProgressProvider } from '../providers/useProviders';
import type { StreakData } from '../providers/progress/ProgressProvider';

export function useStreak() {
  const progressProvider = useProgressProvider();
  const [streak, setStreak] = useState<StreakData>({ current: 0, longest: 0, lastDate: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    progressProvider.getStreak().then(data => {
      setStreak(data);
    }).catch(() => {
      // Silently fall back to defaults on error
    }).finally(() => {
      setLoading(false);
    });
  }, [progressProvider]);

  const recordCompletion = async (date: string) => {
    try {
      await progressProvider.recordDailyCompletion(date);
      const updated = await progressProvider.getStreak();
      setStreak(updated);
    } catch {
      // Silently ignore — streak display is non-critical
    }
  };

  return { streak, loading, recordCompletion };
}
