import { useCallback, useEffect, useRef, useState } from 'react';
import { EDGE_REVEAL_COST, BOMB_COST } from '../engine/constants';
import styles from '../styles/PowerUpToolbar.module.css';

/** Auto-dismiss confirmation after this many milliseconds. */
const CONFIRM_TIMEOUT_MS = 5_000;

interface PowerUpToolbarProps {
  /** Has edge reveal already been used in this puzzle? */
  edgeRevealUsed: boolean;
  /** Has bomb already been used in this puzzle? */
  bombUsed: boolean;
  /** Current wallet balance */
  currentCoins: number;
  /** Called when user confirms edge reveal purchase */
  onEdgeReveal: () => void;
  /** Called when user confirms bomb purchase */
  onBomb: () => void;
  /** When true, disables all power-ups with a sign-in message */
  isAnonymous?: boolean;
}

type ConfirmTarget = 'edge' | 'bomb';

export default function PowerUpToolbar({
  edgeRevealUsed,
  bombUsed,
  currentCoins,
  onEdgeReveal,
  onBomb,
  isAnonymous = false,
}: PowerUpToolbarProps) {
  const [confirming, setConfirming] = useState<ConfirmTarget | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const canAffordEdge = currentCoins >= EDGE_REVEAL_COST;
  const canAffordBomb = currentCoins >= BOMB_COST;

  const edgeDisabled = isAnonymous || edgeRevealUsed || !canAffordEdge;
  const bombDisabled = isAnonymous || bombUsed || !canAffordBomb;

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Auto-dismiss confirmation after timeout
  useEffect(() => {
    if (confirming === null) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setConfirming(null), CONFIRM_TIMEOUT_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [confirming]);

  // Dismiss confirmation on outside click
  useEffect(() => {
    if (confirming === null) return;
    function handleClick(e: MouseEvent) {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setConfirming(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [confirming]);

  const handleConfirm = useCallback(
    (target: ConfirmTarget) => {
      setConfirming(null);
      if (target === 'edge') onEdgeReveal();
      else onBomb();
    },
    [onEdgeReveal, onBomb],
  );

  const handleCancel = useCallback(() => setConfirming(null), []);

  return (
    <div
      className={styles.toolbar}
      ref={toolbarRef}
      role="toolbar"
      aria-label="Power-ups"
    >
      {/* ── Edge Reveal ──────────────────────────────── */}
      {confirming === 'edge' ? (
        <div className={styles.confirm} role="alert">
          <span>Reveal all edge cells?</span>
          <button
            className={styles.confirmYes}
            onClick={() => handleConfirm('edge')}
            type="button"
          >
            Yes
          </button>
          <button
            className={styles.confirmNo}
            onClick={handleCancel}
            type="button"
          >
            No
          </button>
        </div>
      ) : (
        <button
          className={`${styles.powerUpButton} ${edgeRevealUsed ? styles.used : ''}`}
          onClick={() => setConfirming('edge')}
          disabled={edgeDisabled}
          title={
            isAnonymous
              ? 'Sign in to use power-ups'
              : edgeRevealUsed
                ? 'Edge reveal already used'
                : canAffordEdge
                  ? `Reveal edge cells (${EDGE_REVEAL_COST} coins)`
                  : 'Not enough coins'
          }
          type="button"
        >
          {edgeRevealUsed ? (
            <>
              <span className={styles.icon} aria-hidden="true">✓</span>
              Used
            </>
          ) : (
            <>
              <span className={styles.icon} aria-hidden="true">🔲</span>
              Edge Reveal
              <span className={styles.cost} aria-label={`costs ${EDGE_REVEAL_COST} coins`}>
                🪙&thinsp;{EDGE_REVEAL_COST}
              </span>
            </>
          )}
        </button>
      )}

      {/* ── Bomb ─────────────────────────────────────── */}
      {confirming === 'bomb' ? (
        <div className={styles.confirm} role="alert">
          <span>Blast random cells?</span>
          <button
            className={styles.confirmYes}
            onClick={() => handleConfirm('bomb')}
            type="button"
          >
            Yes
          </button>
          <button
            className={styles.confirmNo}
            onClick={handleCancel}
            type="button"
          >
            No
          </button>
        </div>
      ) : (
        <button
          className={`${styles.powerUpButton} ${bombUsed ? styles.used : ''}`}
          onClick={() => setConfirming('bomb')}
          disabled={bombDisabled}
          title={
            isAnonymous
              ? 'Sign in to use power-ups'
              : bombUsed
                ? 'Bomb already used'
                : canAffordBomb
                  ? `Random reveal (${BOMB_COST} coins)`
                  : 'Not enough coins'
          }
          type="button"
        >
          {bombUsed ? (
            <>
              <span className={styles.icon} aria-hidden="true">✓</span>
              Used
            </>
          ) : (
            <>
              <span className={styles.icon} aria-hidden="true">💣</span>
              Bomb
              <span className={styles.cost} aria-label={`costs ${BOMB_COST} coins`}>
                🪙&thinsp;{BOMB_COST}
              </span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
