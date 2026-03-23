import { useState, useEffect, useCallback } from 'react';
import type { ThemeDefinition, ThemeProgress } from '../engine/types';
import { useThemeProvider } from '../providers/ProviderContext';
import { useProgressProvider } from '../providers/ProviderContext';

export function useThemes() {
  const themeProvider = useThemeProvider();
  const progressProvider = useProgressProvider();
  const [themes, setThemes] = useState<ThemeDefinition[]>([]);
  const [themeProgress, setThemeProgress] = useState<Map<string, ThemeProgress>>(new Map());
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [allThemes, allProgress] = await Promise.all([
      themeProvider.getAllThemes(),
      progressProvider.getAllThemeProgress(),
    ]);
    setThemes(allThemes);
    setThemeProgress(new Map(allProgress.map(p => [p.themeId, p])));
    setLoading(false);
  }, [themeProvider, progressProvider]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { themes, themeProgress, loading, refresh };
}
