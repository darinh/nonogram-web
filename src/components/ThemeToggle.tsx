import { useEffect, useState } from 'react';

const STORAGE_KEY = 'nonogram-theme-preference';

type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      style={{
        fontFamily: 'var(--font-heading)',
        fontWeight: 700,
        fontSize: '0.875rem',
        color: 'var(--color-dark)',
        padding: '8px 20px',
        borderRadius: 'var(--radius-pill)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        transition: 'background var(--transition), color var(--transition), transform var(--transition)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--color-pink-light)';
        e.currentTarget.style.color = 'var(--color-pink)';
        e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'none';
        e.currentTarget.style.color = 'var(--color-dark)';
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
