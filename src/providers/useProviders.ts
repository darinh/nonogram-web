import { useContext } from 'react';
import { PuzzleProviderContext, ProgressProviderContext, ThemeProviderContext, WalletProviderContext, AuthProviderContext, SoundProviderContext } from './ProviderContext';
import type { PuzzleProvider } from './puzzle/PuzzleProvider';
import type { ProgressProvider } from './progress/ProgressProvider';
import type { ThemeProvider } from './theme/ThemeProvider';
import type { WalletProvider } from './wallet/WalletProvider';
import type { AuthProvider } from './auth/AuthProvider';
import type { SoundProvider } from './sound/SoundProvider';

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

export function useAuthProvider(): AuthProvider {
  const ctx = useContext(AuthProviderContext);
  if (!ctx) throw new Error('AuthProvider not found in context');
  return ctx;
}

export function useSoundProvider(): SoundProvider {
  const ctx = useContext(SoundProviderContext);
  if (!ctx) throw new Error('SoundProvider not found in context');
  return ctx;
}
