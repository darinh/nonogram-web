import type { ReactNode } from 'react';
import styles from '../styles/Layout.module.css';

/* ── SectionTitle ─────────────────────────────────────── */

interface SectionTitleProps {
  children: ReactNode;
}

export function SectionTitle({ children }: SectionTitleProps) {
  return <h2 className={styles.sectionTitle}>{children}</h2>;
}

/* ── PageSection ──────────────────────────────────────── */

interface PageSectionProps {
  children: ReactNode;
  variant?: 'dark' | 'light';
  className?: string;
}

export function PageSection({
  children,
  variant = 'light',
  className = '',
}: PageSectionProps) {
  const variantClass =
    variant === 'dark' ? styles.sectionDark : styles.sectionLight;
  return (
    <section className={`${variantClass} ${className}`.trim()}>
      <div className={styles.container}>{children}</div>
    </section>
  );
}

/* ── Footer ───────────────────────────────────────────── */

const footerLinks = [
  { label: 'Home', href: '/' },
  { label: 'Puzzles', href: '/puzzles' },
  { label: 'Themes', href: '/themes' },
  { label: 'How to Play', href: '/how-to-play' },
  { label: 'Profile', href: '/stats' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Create', href: '/create' },
  { label: 'Daily', href: '/daily' },
];

const socialLinks = [
  { label: 'Twitter', icon: '🐦', href: '#' },
  { label: 'X', icon: '𝕏', href: '#' },
  { label: 'Instagram', icon: '📸', href: '#' },
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <nav className={styles.footerGrid} aria-label="Footer navigation">
        {footerLinks.map((link) => (
          <a key={link.href} href={link.href} className={styles.footerLink}>
            {link.label}
          </a>
        ))}
      </nav>
      <div className={styles.footerSocial}>
        {socialLinks.map((s) => (
          <a key={s.label} href={s.href} aria-label={s.label} className={styles.footerSocialLink}>
            {s.icon}
          </a>
        ))}
      </div>
      <p className={styles.footerCopy}>
        &copy; {new Date().getFullYear()} Nonogram World
      </p>
    </footer>
  );
}

/* ── ContentWrapper ───────────────────────────────────── */

interface ContentWrapperProps {
  children: ReactNode;
  className?: string;
}

export function ContentWrapper({ children, className = '' }: ContentWrapperProps) {
  return (
    <div className={`${styles.contentWrapper} ${className}`.trim()}>
      {children}
    </div>
  );
}
