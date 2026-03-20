import { createContext, useContext } from 'react';
import type { PuzzleProvider } from './puzzle/PuzzleProvider';
import type { ProgressProvider } from './progress/ProgressProvider';

const PuzzleProviderContext = createContext<PuzzleProvider | null>(null);
const ProgressProviderContext = createContext<ProgressProvider | null>(null);

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

export { PuzzleProviderContext, ProgressProviderContext };
