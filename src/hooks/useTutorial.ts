import { useState, useCallback } from 'react';

const STORAGE_KEY = 'nonogram_tutorial_seen';

export function useTutorial() {
  const [tutorialSeen, setTutorialSeen] = useState(
    () => localStorage.getItem(STORAGE_KEY) === 'true',
  );

  const markTutorialSeen = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setTutorialSeen(true);
  }, []);

  const resetTutorial = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setTutorialSeen(false);
  }, []);

  return { tutorialSeen, markTutorialSeen, resetTutorial };
}
