import { useEffect } from 'react';

/**
 * Sets document.title on mount and restores the default on unmount.
 *
 * TODO: Add `usePageTitle(`${puzzle.title} — Nonogram`)` to GamePage
 * when it is next modified, to set a dynamic title per puzzle.
 */
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title;
    return () => {
      document.title = 'Nonogram — Puzzle Game';
    };
  }, [title]);
}
