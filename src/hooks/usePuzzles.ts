import { useState, useEffect, useCallback } from 'react';
import type { PuzzleDefinition } from '../engine/types';
import { usePuzzleProvider } from '../providers/ProviderContext';

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
    refresh();
  }, [refresh]);

  return { puzzles, loading, refresh };
}
