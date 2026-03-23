import { createContext, useContext } from 'react';
import type { PuzzleProvider } from './puzzle/PuzzleProvider';
import type { ProgressProvider } from './progress/ProgressProvider';
import type { ThemeProvider } from './theme/ThemeProvider';
import type { WalletProvider } from './wallet/WalletProvider';

const PuzzleProviderContext = createContext<PuzzleProvider | null>(null);
const ProgressProviderContext = createContext<ProgressProvider | null>(null);
const ThemeProviderContext = createContext<ThemeProvider | null>(null);
const WalletProviderContext = createContext<WalletProvider | null>(null);

export function usePuzzleProvider(): PuzzleProvider {
  const ctx = useContext(PuzzleProviderContext);
  if (!ctx) throw new Error('PuzzleProvider not found in context');
  return ctx;
}

export function useProgressProvider(): ProgressProvider {
  const ctx = useContext(ProgressProviderContext);
  if (!ctx) throw new Error('ProgressProvider not found in context');
  return ctx;
}

export function useThemeProvider(): ThemeProvider {
  const ctx = useContext(ThemeProviderContext);
  if (!ctx) throw new Error('ThemeProvider not found in context');
  return ctx;
}

export function useWalletProvider(): WalletProvider {
  const ctx = useContext(WalletProviderContext);
  if (!ctx) throw new Error('WalletProvider not found in context');
  return ctx;
}

export { PuzzleProviderContext, ProgressProviderContext, ThemeProviderContext, WalletProviderContext };
