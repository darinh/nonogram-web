import type { ThemeDefinition } from '../../engine/types';
import type { ThemeProvider } from './ThemeProvider';
import { bundledThemes } from '../../data/themes';

export class StaticThemeProvider implements ThemeProvider {
  async getAllThemes(): Promise<ThemeDefinition[]> {
    return bundledThemes;
  }

  async getThemeById(id: string): Promise<ThemeDefinition | null> {
    return bundledThemes.find(t => t.id === id) ?? null;
  }
}
