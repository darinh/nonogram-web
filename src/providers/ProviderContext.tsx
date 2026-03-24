import { createContext } from 'react';
import type { PuzzleProvider } from './puzzle/PuzzleProvider';
import type { ProgressProvider } from './progress/ProgressProvider';
import type { ThemeProvider } from './theme/ThemeProvider';
import type { WalletProvider } from './wallet/WalletProvider';
import type { AuthProvider } from './auth/AuthProvider';
import type { SoundProvider } from './sound/SoundProvider';

export const PuzzleProviderContext = createContext<PuzzleProvider | null>(null);
export const ProgressProviderContext = createContext<ProgressProvider | null>(null);
export const ThemeProviderContext = createContext<ThemeProvider | null>(null);
export const WalletProviderContext = createContext<WalletProvider | null>(null);
export const AuthProviderContext = createContext<AuthProvider | null>(null);
export const SoundProviderContext = createContext<SoundProvider | null>(null);

