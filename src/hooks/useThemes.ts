import { useState, useEffect, useCallback } from 'react';
import type { ThemeDefinition, ThemeProgress } from '../engine/types';
import { useThemeProvider } from '../providers/useProviders';
import { useProgressProvider } from '../providers/useProviders';

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
    Promise.all([
      themeProvider.getAllThemes(),
      progressProvider.getAllThemeProgress(),
    ]).then(([allThemes, allProgress]) => {
      setThemes(allThemes);
      setThemeProgress(new Map(allProgress.map(p => [p.themeId, p])));
      setLoading(false);
    });
  }, [themeProvider, progressProvider]);

  return { themes, themeProgress, loading, refresh };
}
