import { useState, useEffect, useCallback } from 'react';
import type { PuzzleProgress } from '../engine/types';
import { useProgressProvider } from '../providers/ProviderContext';

export function useProgress(puzzleId?: string) {
  const provider = useProgressProvider();
  const [progress, setProgress] = useState<PuzzleProgress | null>(null);
  const [allProgress, setAllProgress] = useState<PuzzleProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (puzzleId) {
        const p = await provider.getProgress(puzzleId);
        setProgress(p);
      }
      const all = await provider.getAllProgress();
      setAllProgress(all);
      setLoading(false);
    }
    load();
  }, [provider, puzzleId]);

  const saveProgress = useCallback(
    async (p: PuzzleProgress) => {
      await provider.saveProgress(p);
      setProgress(p);
    },
    [provider],
  );

  const clearProgress = useCallback(
    async (id: string) => {
      await provider.clearProgress(id);
      setProgress(null);
    },
    [provider],
  );

  return { progress, allProgress, loading, saveProgress, clearProgress };
}
