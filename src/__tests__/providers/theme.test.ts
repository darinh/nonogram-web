import { describe, it, expect } from 'vitest';
import { StaticThemeProvider } from '../../providers/theme/StaticThemeProvider';

describe('StaticThemeProvider', () => {
  const provider = new StaticThemeProvider();

  it('returns empty array when no themes are bundled', async () => {
    const themes = await provider.getAllThemes();
    expect(themes).toEqual([]);
  });

  it('returns null for unknown theme id', async () => {
    const theme = await provider.getThemeById('nonexistent');
    expect(theme).toBeNull();
  });
});
