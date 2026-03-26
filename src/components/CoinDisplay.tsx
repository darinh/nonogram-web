import { useState } from 'react';
import { useSharedWallet } from '../hooks/useSharedWallet';
import styles from '../styles/CoinDisplay.module.css';

/** Format counts for compact display: 150 -> "150", 1200 -> "1.2k", 10000 -> "10k" */
function formatCount(n: number): string {
  if (n < 1000) return n.toString();
  if (n < 10000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return Math.floor(n / 1000) + 'k';
}

/**
 * Dual-currency display showing both tokens and coins.
 * Pill-shaped badges in the app header with animated pulse on changes.
 */
export function CoinDisplay() {
  const { wallet, loading } = useSharedWallet();
  const [prevTokens, setPrevTokens] = useState(wallet.tokens);
  const [prevCoins, setPrevCoins] = useState(wallet.coins);
  const [tokenAnimating, setTokenAnimating] = useState(false);
  const [coinAnimating, setCoinAnimating] = useState(false);

  if (wallet.tokens !== prevTokens) {
    setPrevTokens(wallet.tokens);
    setTokenAnimating(true);
  }

  if (wallet.coins !== prevCoins) {
    setPrevCoins(wallet.coins);
    setCoinAnimating(true);
  }

  if (loading) return null;

  const tokenClass = tokenAnimating
    ? `${styles.pill} ${styles.tokenPill} ${styles.animate}`
    : `${styles.pill} ${styles.tokenPill}`;

  const coinClass = coinAnimating
    ? `${styles.pill} ${styles.coinPill} ${styles.animate}`
    : `${styles.pill} ${styles.coinPill}`;

  return (
    <div className={styles.container}>
      <div
        className={tokenClass}
        role="status"
        aria-label={`${wallet.tokens} tokens`}
        onAnimationEnd={() => setTokenAnimating(false)}
      >
        <span className={styles.icon} aria-hidden="true">{"🎟️"}</span>
        <span className={styles.amount}>{formatCount(wallet.tokens)}</span>
      </div>
      <div
        className={coinClass}
        role="status"
        aria-label={`${wallet.coins} coins`}
        onAnimationEnd={() => setCoinAnimating(false)}
      >
        <span className={styles.icon} aria-hidden="true">{"🪙"}</span>
        <span className={styles.amount}>{formatCount(wallet.coins)}</span>
      </div>
    </div>
  );
}
