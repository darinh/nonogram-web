import { Link, useNavigate } from 'react-router-dom';
import { useThemes } from '../hooks/useThemes';
import { usePageTitle } from '../hooks/usePageTitle';
import type { ThemeDefinition, ThemeProgress } from '../engine/types';
import styles from '../styles/ThemeBrowserPage.module.css';

/** Total puzzles per theme (10×10 grid). */
const PUZZLES_PER_THEME = 100;

interface ThemeCardProps {
  theme: ThemeDefinition;
  progress: ThemeProgress | undefined;
  onClick: () => void;
}

function ThemeCard({ theme, progress, onClick }: ThemeCardProps) {
  const completed = progress?.completedPuzzles.length ?? 0;
  const percent = Math.round((completed / PUZZLES_PER_THEME) * 100);

  return (
    <div
      className={styles.card}
      role="button"
      tabIndex={0}
      aria-label={`${theme.title} — ${completed} of ${PUZZLES_PER_THEME} puzzles completed`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className={styles.cardPreview}>
        {theme.backgroundImage && (
          <img
            className={styles.cardPreviewImage}
            src={theme.backgroundImage}
            alt=""
            loading="lazy"
          />
        )}
      </div>

      <div className={styles.cardBody}>
        <h2 className={styles.cardTitle}>{theme.title}</h2>
        <p className={styles.cardDescription}>{theme.description}</p>

        <div className={styles.progressSection}>
          <div
            className={styles.progressTrack}
            role="progressbar"
            aria-valuenow={completed}
            aria-valuemin={0}
            aria-valuemax={PUZZLES_PER_THEME}
            aria-label={`${completed} of ${PUZZLES_PER_THEME} puzzles completed`}
          >
            <div
              className={styles.progressFill}
              style={{ width: `${percent}%` }}
            />
          </div>
          {completed > 0 ? (
            <span className={styles.progressLabel}>
              {completed}/{PUZZLES_PER_THEME} completed
            </span>
          ) : (
            <span className={styles.progressNew}>New!</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ThemeBrowserPage() {
  usePageTitle('Themes — Nonogram');
  const navigate = useNavigate();
  const { themes, themeProgress, loading } = useThemes();

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading themes…</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <Link to="/" className={styles.backLink}>
          ← Home
        </Link>
        <h1 className={styles.pageTitle}>★ Themes ★</h1>
      </div>

      {themes.length === 0 ? (
        <div className={styles.emptyState}>No themes available yet.</div>
      ) : (
        <div className={styles.grid}>
          {themes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              progress={themeProgress.get(theme.id)}
              onClick={() => navigate(`/themes/${theme.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
