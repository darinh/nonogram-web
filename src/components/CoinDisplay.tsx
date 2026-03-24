import { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import styles from '../styles/CoinDisplay.module.css';

/** Format coin counts for compact display: 150 → "150", 1200 → "1.2k", 10000 → "10k" */
function formatCoins(n: number): string {
  if (n < 1000) return n.toString();
  if (n < 10000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return Math.floor(n / 1000) + 'k';
}

/**
 * Compact pill showing the player's current coin balance.
 * Intended for the app header — always visible.
 * Pulses briefly when the coin count changes.
 */
export function CoinDisplay() {
  const { wallet, loading } = useWallet();
  const [prevCoins, setPrevCoins] = useState(wallet.coins);
  const [animating, setAnimating] = useState(false);

  if (wallet.coins !== prevCoins) {
    setPrevCoins(wallet.coins);
    setAnimating(true);
  }

  if (loading) return null;

  const containerClass = animating
    ? `${styles.container} ${styles.animate}`
    : styles.container;

  return (
    <div
      className={containerClass}
      role="status"
      aria-label={`${wallet.coins} coins`}
      onAnimationEnd={() => setAnimating(false)}
    >
      <span className={styles.icon} aria-hidden="true">🪙</span>
      <span className={styles.amount}>{formatCoins(wallet.coins)}</span>
    </div>
  );
}
