import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { SectionTitle, PageSection, Footer } from './Layout';
import styles from '../styles/HomePage.module.css';

/* ── 5×5 heart grid pattern ──────────────────────────── */
const HEART_GRID: ('pink' | 'cyan' | 'green' | null)[] = [
  null,    'pink', null,    'pink', null,
  'pink',  'cyan', 'pink',  'cyan', 'pink',
  'pink',  'pink', 'pink',  'pink', 'pink',
  null,    'pink', 'green', 'pink', null,
  null,    null,   'pink',  null,   null,
];

const CELL_CLASS: Record<string, string> = {
  pink: styles.filledPink,
  cyan: styles.filledCyan,
  green: styles.filledGreen,
};

/* ── Gallery puzzle data ─────────────────────────────── */
interface GalleryPuzzle {
  name: string;
  difficulty: number;
  size: string;
  color: string;
  pattern: string;
}

const GALLERY_PUZZLES: GalleryPuzzle[] = [
  { name: 'Heart',  difficulty: 3, size: '8×8', color: 'var(--pink)',   pattern: '0011011001111111011111110111111100111110000111000000100000000000' },
  { name: 'Star',   difficulty: 4, size: '8×8', color: 'var(--gold)',   pattern: '0001000000010000011111000011100001010100010001001000001000000000' },
  { name: 'Rocket', difficulty: 5, size: '8×8', color: 'var(--cyan)',   pattern: '0001000000111000001110000111110001111100001110000101010001000100' },
  { name: 'Tree',   difficulty: 2, size: '8×8', color: 'var(--green)',  pattern: '0001000000111000011111000011100001111100111111100001000000111000' },
  { name: 'Skull',  difficulty: 4, size: '8×8', color: 'var(--purple)', pattern: '0011110001111110010110100111111001111110001001000011110000000000' },
  { name: 'Wave',   difficulty: 3, size: '8×8', color: 'var(--teal)',   pattern: '0000000000100010010101011000100000000000001000100101010110001000' },
];

/* ── CTA deco grid pattern ───────────────────────────── */
const CTA_DECO = [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0];

/* ── Feature cards data ──────────────────────────────── */
const FEATURES = [
  { icon: '🎯', title: 'Daily Puzzles',  description: 'A new challenge every day. Fresh puzzles at midnight.' },
  { icon: '🎨', title: 'Puzzle Creator', description: 'Design your own nonograms. Share with the world.' },
  { icon: '🏆', title: 'Achievements',   description: 'Unlock badges. Track your mastery. Climb the ranks.' },
];

/* ── Step data ───────────────────────────────────────── */
const STEPS = [
  { num: 1, title: 'Read the Clues',      description: 'Numbers on rows and columns tell you which cells to fill.' },
  { num: 2, title: 'Fill the Grid',       description: 'Use logic to determine which cells are filled or empty.' },
  { num: 3, title: 'Reveal the Picture',  description: 'Complete the puzzle to reveal hidden pixel art.' },
];

export default function HomePage() {
  usePageTitle('Nonogram — Fill the Grid. Reveal the Art.');
  useScrollReveal();

  return (
    <>
      {/* ══════ HERO ══════ */}
      <section className={`${styles.hero} grid-bg`}>
        <div className={`${styles.floater} ${styles.floater1}`} />
        <div className={`${styles.floater} ${styles.floater2}`} />
        <div className={`${styles.floater} ${styles.floater3}`} />
        <div className={`${styles.floater} ${styles.floater4}`} />
        <div className={`${styles.floater} ${styles.floater5}`} />
        <div className={`${styles.floater} ${styles.floater6}`} />
        <div className={`${styles.floater} ${styles.floater7}`} />

        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Nonogram</h1>
          <p className={styles.heroSubtitle}>Fill the grid. Reveal the art.</p>

          <div className={styles.heroGridWrapper}>
            <div className={styles.heroGrid} aria-hidden="true">
              {HEART_GRID.map((color, i) => (
                <div
                  key={i}
                  className={`${styles.cell} ${color ? CELL_CLASS[color] : ''}`}
                />
              ))}
            </div>
          </div>

          <Link to="/puzzles" className={styles.ctaButton}>Play Now</Link>
        </div>
      </section>

      {/* ══════ FEATURES ══════ */}
      <PageSection variant="light">
        <div className="reveal">
          <SectionTitle>Features</SectionTitle>
        </div>
        <div className={styles.featuresGrid}>
          {FEATURES.map((f) => (
            <div key={f.title} className={`${styles.featureCard} reveal`}>
              <span className={styles.featureIcon}>{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.description}</p>
            </div>
          ))}
        </div>
      </PageSection>

      {/* ══════ HOW IT WORKS ══════ */}
      <PageSection variant="dark">
        <div className="reveal" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          <SectionTitle>How It Works</SectionTitle>
        </div>
        <div className={styles.steps}>
          {STEPS.map((s, i) => (
            <div key={s.num}>
              {i > 0 && (
                <div className={styles.stepConnector} aria-hidden="true" />
              )}
              <div className={`${styles.step} reveal`}>
                <div className={styles.stepNumber}>{s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </PageSection>

      {/* ══════ GALLERY ══════ */}
      <PageSection variant="light">
        <div className="reveal">
          <SectionTitle>Gallery</SectionTitle>
        </div>
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
        <div className={`${styles.galleryScroll} reveal`} tabIndex={0} role="region" aria-label="Featured puzzles">
          {GALLERY_PUZZLES.map((p) => (
            <div key={p.name} className={styles.galleryCard}>
              <div className={styles.miniGrid}>
                {p.pattern.split('').map((bit, i) => (
                  <div
                    key={i}
                    className={styles.miniCell}
                    style={{
                      background: bit === '1' ? p.color : 'rgba(0,0,0,0.06)',
                    }}
                  />
                ))}
              </div>
              <h4>{p.name}</h4>
              <div className={styles.galleryMeta}>
                <span className={styles.galleryStars}>
                  {'★'.repeat(p.difficulty)}{'☆'.repeat(5 - p.difficulty)}
                </span>
                <span className={styles.gallerySize}>{p.size}</span>
              </div>
            </div>
          ))}
        </div>
      </PageSection>

      {/* ══════ CTA ══════ */}
      <PageSection variant="dark" className={styles.ctaSection}>
        <div className={`${styles.ctaDeco} ${styles.ctaDecoLeft}`} aria-hidden="true">
          {CTA_DECO.map((v, i) => (
            <div key={i} className={v ? styles.ctaDecoCell : undefined} />
          ))}
        </div>
        <div className={`${styles.ctaDeco} ${styles.ctaDecoRight}`} aria-hidden="true">
          {CTA_DECO.map((v, i) => (
            <div key={i} className={v ? styles.ctaDecoCell : undefined} />
          ))}
        </div>
        <div className={`${styles.ctaCenter} reveal`}>
          <h2>Ready to solve?</h2>
          <Link to="/puzzles" className={styles.ctaButton}>Start Playing</Link>
        </div>
      </PageSection>

      {/* ══════ FOOTER ══════ */}
      <Footer />
    </>
  );
}
