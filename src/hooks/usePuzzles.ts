import { useState, useEffect, useCallback } from 'react';
import type { PuzzleDefinition } from '../engine/types';
import { usePuzzleProvider } from '../providers/useProviders';

export function usePuzzles() {
  const provider = usePuzzleProvider();
  const [puzzles, setPuzzles] = useState<PuzzleDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const all = await provider.getAllPuzzles();
    setPuzzles(all);
    setLoading(false);
  }, [provider]);

  useEffect(() => {
    provider.getAllPuzzles().then(all => {
      setPuzzles(all);
      setLoading(false);
    });
  }, [provider]);

  return { puzzles, loading, refresh };
}
