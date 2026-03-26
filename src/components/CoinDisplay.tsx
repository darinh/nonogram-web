import { useState } from 'react';
import { useSharedWallet } from '../hooks/useSharedWallet';
import styles from '../styles/CoinDisplay.module.css';

/** Format currency counts for compact display */
function formatAmount(n: number): string {
  if (n < 1000) return n.toString();
  if (n < 10000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return Math.floor(n / 1000) + 'k';
}

/**
 * Compact pill showing the player's current token and coin balances.
 * Intended for the app header — always visible.
 * Pulses briefly when a balance changes.
 */
export function CoinDisplay() {
  const { wallet, loading } = useSharedWallet();
  const [prevCoins, setPrevCoins] = useState(wallet.coins);
  const [prevTokens, setPrevTokens] = useState(wallet.tokens);
  const [animatingCoins, setAnimatingCoins] = useState(false);
  const [animatingTokens, setAnimatingTokens] = useState(false);

  if (wallet.coins !== prevCoins) {
    setPrevCoins(wallet.coins);
    setAnimatingCoins(true);
  }

  if (wallet.tokens !== prevTokens) {
    setPrevTokens(wallet.tokens);
    setAnimatingTokens(true);
  }

  if (loading) return null;

  const coinClass = animatingCoins
    ? `${styles.container} ${styles.animate}`
    : styles.container;

  const tokenClass = animatingTokens
    ? `${styles.container} ${styles.animate}`
    : styles.container;

  return (
    <div className={styles.wrapper}>
      <div
        className={tokenClass}
        role="status"
        aria-label={`${wallet.tokens} tokens`}
        onAnimationEnd={() => setAnimatingTokens(false)}
      >
        <span className={styles.icon} aria-hidden="true">🎟️</span>
        <span className={styles.amount}>{formatAmount(wallet.tokens)}</span>
      </div>
      <div
        className={coinClass}
        role="status"
        aria-label={`${wallet.coins} coins`}
        onAnimationEnd={() => setAnimatingCoins(false)}
      >
        <span className={styles.icon} aria-hidden="true">🪙</span>
        <span className={styles.amount}>{formatAmount(wallet.coins)}</span>
      </div>
    </div>
  );
}
