import { useState, useCallback } from 'react';
import styles from '../styles/TutorialOverlay.module.css';

interface TutorialOverlayProps {
  onComplete: () => void;
}

const STEPS = [
  {
    emoji: '👋',
    title: 'Welcome to Nonogram!',
    body: "It's a picture logic puzzle. Reveal a hidden image by filling in the right cells on the grid.",
  },
  {
    emoji: '🔢',
    title: 'Reading Clues',
    body: 'Numbers along each row and column tell you how many consecutive cells to fill. Multiple numbers mean separate groups with at least one gap between them.',
  },
  {
    emoji: '✏️',
    title: 'Filling Cells',
    body: 'Click or tap a cell to fill it. Make sure the Fill tool is selected in the toolbar.',
  },
  {
    emoji: '✖️',
    title: 'Marking Empty Cells',
    body: "Switch to the X tool to mark cells you know are empty. This helps you keep track of your logic.",
  },
  {
    emoji: '🎉',
    title: 'Complete the Puzzle!',
    body: 'Fill all the correct cells to reveal the picture. Good luck and have fun!',
  },
];

export default function TutorialOverlay({ onComplete }: TutorialOverlayProps) {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;

  const handleNext = useCallback(() => {
    if (isLast) {
      onComplete();
    } else {
      setStep(s => s + 1);
    }
  }, [isLast, onComplete]);

  const handleBack = useCallback(() => {
    setStep(s => Math.max(0, s - 1));
  }, []);

  const current = STEPS[step];

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Tutorial">
      <div className={styles.card}>
        <div className={styles.emoji} aria-hidden="true">{current.emoji}</div>
        <h2 className={styles.stepTitle}>{current.title}</h2>
        <p className={styles.stepBody}>{current.body}</p>

        <div className={styles.dots}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`${styles.dot} ${i === step ? styles.dotActive : ''}`}
            />
          ))}
        </div>

        <div className={styles.buttons}>
          {step > 0 && (
            <button className={styles.backButton} onClick={handleBack}>
              Back
            </button>
          )}
          <button className={styles.nextButton} onClick={handleNext}>
            {isLast ? 'Start Playing!' : 'Next'}
          </button>
        </div>

        <button className={styles.skipButton} onClick={onComplete}>
          Skip tutorial
        </button>
      </div>
    </div>
  );
}
