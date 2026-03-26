import { useEffect, useRef, useCallback } from 'react';
import styles from '../styles/HintPrompt.module.css';

interface HintPromptProps {
  /** Whether this is a row or column hint. */
  axis: 'row' | 'col';
  /** Zero-based index of the row/column. Displayed as 1-indexed. */
  index: number;
  /** Coin cost for this hint (from getHintCost). */
  cost: number;
  /** Called when the user confirms the purchase. */
  onConfirm: () => void;
  /** Called when the user cancels (Escape, backdrop click, or Cancel button). */
  onCancel: () => void;
  /** Current wallet balance. When provided, enables enhanced display with balance and cell count. */
  currentCoins?: number;
  /** How many cells would be revealed. 0 means already solved. */
  revealableCount?: number;
  /**
   * Legacy affordability flag.
   * Ignored when `currentCoins` is provided (derived from `currentCoins >= cost`).
   * @deprecated Pass `currentCoins` instead for the enhanced UI.
   */
  canAfford?: boolean;
}

/**
 * Modal dialog offering to reveal a row/column hint for coins.
 *
 * Uses coins from the dual wallet system (🪙).
 *
 * Handles three states:
 * - **Purchasable**: user can afford → Buy Hint enabled
 * - **Too expensive**: user can't afford → Buy Hint disabled, warning shown
 * - **Already solved**: revealableCount is 0 → informational only
 *
 * Accessibility: focus-trapped, Escape to close, auto-focuses the
 * most relevant action button, restores focus on unmount.
 */
export default function HintPrompt({
  axis,
  index,
  cost,
  onConfirm,
  onCancel,
  currentCoins,
  revealableCount,
  canAfford: canAffordLegacy,
}: HintPromptProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<Element | null>(null);

  // When currentCoins is provided, derive canAfford; otherwise fall back to legacy prop
  const canAfford = currentCoins !== undefined
    ? currentCoins >= cost
    : (canAffordLegacy ?? true);
  const alreadyRevealed = revealableCount !== undefined && revealableCount === 0;
  const isEnhanced = currentCoins !== undefined;
  const displayLabel = axis === 'row' ? `Row ${index + 1}` : `Column ${index + 1}`;
  const axisNoun = axis === 'row' ? 'row' : 'column';

  // ── Focus management ──────────────────────────────────────────────
  useEffect(() => {
    previousFocusRef.current = document.activeElement;

    // Auto-focus: confirm when purchase is possible, otherwise cancel
    if (canAfford && !alreadyRevealed) {
      confirmRef.current?.focus();
    } else {
      cancelRef.current?.focus();
    }

    return () => {
      if (previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus();
      }
    };
    // Intentionally run only on mount/unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Escape to close ───────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  // ── Focus trap ────────────────────────────────────────────────────
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    const modal = modalRef.current;
    if (!modal) return;

    const focusable = modal.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );

    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  // ── Click-outside-to-dismiss ──────────────────────────────────────
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onCancel();
      }
    },
    [onCancel],
  );

  return (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={modalRef}
        className={styles.card}
        role="dialog"
        aria-modal="true"
        aria-label={`Reveal ${displayLabel}`}
        onKeyDown={handleKeyDown}
      >
        <h2 className={styles.title}>Reveal {displayLabel}</h2>

        {alreadyRevealed ? (
          <p className={styles.alreadySolved}>
            This {axisNoun} is already solved!
          </p>
        ) : (
          <>
            {isEnhanced && revealableCount !== undefined && (
              <p className={styles.info}>
                Reveals {revealableCount} {revealableCount === 1 ? 'cell' : 'cells'}
              </p>
            )}
            <p className={styles.costDisplay}>
              <span aria-hidden="true">🪙</span> {cost} coins
            </p>
          </>
        )}

        {isEnhanced && (
          <p className={styles.balance}>
            Your balance: <span aria-hidden="true">🪙</span> {currentCoins}
          </p>
        )}

        {!canAfford && !alreadyRevealed && (
          <p className={styles.warning} role="alert">
            Not enough coins!
          </p>
        )}

        <div className={styles.buttons}>
          <button
            ref={cancelRef}
            className={styles.cancelButton}
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            ref={confirmRef}
            className={styles.buyButton}
            onClick={onConfirm}
            disabled={!canAfford || alreadyRevealed}
            type="button"
          >
            {alreadyRevealed
              ? 'Already solved'
              : canAfford
                ? 'Buy Hint'
                : 'Not enough coins'}
          </button>
        </div>
      </div>
    </div>
  );
}
