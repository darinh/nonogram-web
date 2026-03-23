import { describe, it, expect } from 'vitest';
import { StaticThemeProvider } from '../../providers/theme/StaticThemeProvider';

describe('StaticThemeProvider', () => {
  const provider = new StaticThemeProvider();

  it('returns bundled themes', async () => {
    const themes = await provider.getAllThemes();
    expect(themes.length).toBeGreaterThan(0);
    expect(themes[0].id).toBe('nature');
  });

  it('returns null for unknown theme id', async () => {
    const theme = await provider.getThemeById('nonexistent');
    expect(theme).toBeNull();
  });
});
