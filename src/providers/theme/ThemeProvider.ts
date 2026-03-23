import type { ThemeDefinition } from '../../engine/types';

export interface ThemeProvider {
  getAllThemes(): Promise<ThemeDefinition[]>;
  getThemeById(id: string): Promise<ThemeDefinition | null>;
}
