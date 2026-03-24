import { useState, useEffect } from 'react';
import { useProgressProvider } from '../providers/ProviderContext';
import type { StreakData } from '../providers/progress/ProgressProvider';

export function useStreak() {
  const progressProvider = useProgressProvider();
  const [streak, setStreak] = useState<StreakData>({ current: 0, longest: 0, lastDate: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    progressProvider.getStreak().then(data => {
      setStreak(data);
      setLoading(false);
    });
  }, [progressProvider]);

  const recordCompletion = async (date: string) => {
    await progressProvider.recordDailyCompletion(date);
    const updated = await progressProvider.getStreak();
    setStreak(updated);
  };

  return { streak, loading, recordCompletion };
}
