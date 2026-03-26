import { usePageTitle } from '../hooks/usePageTitle';
import { useScrollReveal } from '../hooks/useScrollReveal';
import styles from '../styles/HowToPlayPage.module.css';

/* ── Mini-grid data for tutorial steps ────────────────── */

const HEART_UNSOLVED = Array(25).fill(0);
const HEART_SOLVED = [
  0, 1, 0, 1, 0,
  1, 1, 1, 1, 1,
  1, 1, 1, 1, 1,
  0, 1, 1, 1, 0,
  0, 0, 1, 0, 0,
];

const STEP1_GRID = Array(25).fill(0);
const STEP1_ROW_CLUES = [[1, 1], [5], [5], [3], [1]];
const STEP1_COL_CLUES = [[2], [4], [1, 1], [4], [2]];

const STEP2_GRID = [
  0, 0, 0, 0, 0,
  1, 1, 1, 1, 1,
  1, 1, 1, 1, 1,
  0, 0, 0, 0, 0,
  0, 0, 0, 0, 0,
];

const STEP3_GRID = [
  0, 1, 2, 1, 0,
  1, 1, 1, 1, 1,
  1, 1, 1, 1, 1,
  2, 1, 1, 1, 2,
  2, 2, 1, 2, 2,
];

const STEP4_GRID = [
  2, 1, 2, 1, 2,
  1, 1, 1, 1, 1,
  1, 1, 1, 1, 1,
  2, 1, 1, 1, 2,
  2, 2, 1, 2, 2,
];

const TIPS = [
  { icon: '🎯', title: 'Start Big', text: 'Always solve the longest clues first. They constrain the most cells and give you the biggest head start.' },
  { icon: '✕', title: 'Mark Empties', text: "Use X marks to track cells you've eliminated. Knowing what's empty is just as important as knowing what's filled." },
  { icon: '🔄', title: 'Switch Focus', text: 'Alternate between rows and columns. New information in one direction often unlocks progress in the other.' },
  { icon: '💾', title: 'Save Progress', text: "Your progress auto-saves so you can return anytime. Don't worry about losing your work!" },
];

function MiniGrid({ cells, highlight }: { cells: number[]; highlight?: number }) {
  return (
    <div className={styles.nonoGrid} aria-hidden="true">
      {cells.map((c, i) => (
        <div
          key={i}
          className={`${styles.nonoCell} ${c === 1 ? styles.nonoCellFilled : ''} ${c === 2 ? styles.nonoCellX : ''} ${i === highlight ? styles.nonoCellHighlight : ''}`}
        >
          {c === 2 && '✕'}
        </div>
      ))}
    </div>
  );
}

function GridWithClues({ cells, rowClues, colClues }: {
  cells: number[];
  rowClues: number[][];
  colClues: number[][];
}) {
  return (
    <div className={styles.gridWithClues} aria-hidden="true">
      <div className={styles.clueCorner} />
      {colClues.map((clue, i) => (
        <div key={`cc-${i}`} className={styles.clueCol}>
          {clue.map((n, j) => <span key={j}>{n}</span>)}
        </div>
      ))}
      {Array.from({ length: 5 }).map((_, row) => (
        <div key={`row-${row}`} className={styles.gridRow}>
          <div className={styles.clueRow}>
            {rowClues[row].map((n, j) => <span key={j}>{n}</span>)}
          </div>
          {Array.from({ length: 5 }).map((_, col) => {
            const cell = cells[row * 5 + col];
            return (
              <div
                key={`cell-${row}-${col}`}
                className={`${styles.nonoCell} ${cell === 1 ? styles.nonoCellFilled : ''} ${cell === 2 ? styles.nonoCellX : ''}`}
              >
                {cell === 2 && '✕'}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default function HowToPlayPage() {
  usePageTitle('How to Play — Nonogram');
  useScrollReveal();

  return (
    <div className={styles.page}>
      {/* Hero */}
      <header className={`${styles.hero} ${styles.sectionDark}`}>
        <div className={styles.container}>
          <h1 className={`${styles.heroTitle} reveal`}>HOW TO PLAY</h1>
          <p className={`${styles.heroSubtitle} reveal`}>Master the art of logic puzzles</p>
        </div>
      </header>

      {/* What is a Nonogram? */}
      <section className={`${styles.section} ${styles.sectionLight}`}>
        <div className={styles.container}>
          <h2 className={`${styles.sectionTitle} reveal`}>What is a Nonogram?</h2>
          <div className={styles.introGrid}>
            <div className={`${styles.card} reveal`}>
              <p>
                <strong>Nonograms</strong> (also called <em>Picross</em>, <em>Griddlers</em>, or <em>Paint by Numbers</em>)
                are logic puzzles where you fill in cells on a grid to reveal a hidden picture.
                The numbers on each row and column tell you how many consecutive cells to fill.
              </p>
            </div>
            <div className={`${styles.gridDemoContainer} reveal`}>
              <div>
                <div className={styles.gridDemoLabel}>Unsolved</div>
                <MiniGrid cells={HEART_UNSOLVED} />
              </div>
              <div className={styles.arrowBetween} aria-hidden="true">→</div>
              <div>
                <div className={styles.gridDemoLabel}>Solved</div>
                <MiniGrid cells={HEART_SOLVED} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Step 1 */}
      <section className={`${styles.section} ${styles.sectionLight}`}>
        <div className={styles.container}>
          <div className={`${styles.stepContent} reveal`}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepText}>
              <h3>Read the Clues</h3>
              <p>Each row and column has a set of numbers. These numbers tell you how many groups of consecutive filled cells are in that line, and how large each group is.</p>
              <div className={styles.callout}>
                <strong>Example:</strong> The clue <strong className={styles.pinkText}>&ldquo;2 3&rdquo;</strong> means there&rsquo;s a group of 2 filled cells, then a gap of at least 1 empty cell, then a group of 3 filled cells.
              </div>
            </div>
            <div className={styles.stepVisual}>
              <GridWithClues cells={STEP1_GRID} rowClues={STEP1_ROW_CLUES} colClues={STEP1_COL_CLUES} />
            </div>
          </div>
        </div>
      </section>

      {/* Step 2 */}
      <section className={`${styles.section} ${styles.sectionDark}`}>
        <div className={styles.container}>
          <div className={`${styles.stepContent} reveal`}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepText}>
              <h3>Start with the Obvious</h3>
              <p>Look for clues that fill most or all of a line. A clue of <strong className={styles.pinkText}>&ldquo;5&rdquo;</strong> on a 5-cell row means every cell is filled!</p>
              <div className={styles.calloutGold}>
                💡 <strong>Pro Tip:</strong> Start with the largest numbers first — they give you the most information.
              </div>
            </div>
            <div className={styles.stepVisual}>
              <MiniGrid cells={STEP2_GRID} />
            </div>
          </div>
        </div>
      </section>

      {/* Step 3 */}
      <section className={`${styles.section} ${styles.sectionLight}`}>
        <div className={styles.container}>
          <div className={`${styles.stepContent} reveal`}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepText}>
              <h3>Use Elimination</h3>
              <p>Mark cells you know are empty with an ✕. This helps you see the remaining possibilities.</p>
              <div className={styles.callout}>
                <strong>Technique:</strong> If a row&rsquo;s clue is <strong className={styles.pinkText}>&ldquo;1&rdquo;</strong> and one cell is already filled, all other cells in that row must be empty.
              </div>
            </div>
            <div className={styles.stepVisual}>
              <MiniGrid cells={STEP3_GRID} />
            </div>
          </div>
        </div>
      </section>

      {/* Step 4 */}
      <section className={`${styles.section} ${styles.sectionDark}`}>
        <div className={styles.container}>
          <div className={`${styles.stepContent} reveal`}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepText}>
              <h3>Cross-Reference</h3>
              <p>The magic happens when you combine row and column information. A cell that must be filled according to <strong className={styles.pinkText}>BOTH</strong> its row AND column clue is guaranteed correct.</p>
            </div>
            <div className={styles.stepVisual}>
              <MiniGrid cells={STEP4_GRID} highlight={6} />
            </div>
          </div>
        </div>
      </section>

      {/* Step 5 */}
      <section className={`${styles.section} ${styles.sectionLight}`}>
        <div className={styles.container}>
          <div className={`${styles.stepContent} reveal`}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepText}>
              <h3>Reveal the Picture!</h3>
              <p>🎉 The filled cells form a picture! That&rsquo;s the reward for your logical thinking. Every nonogram hides a unique image waiting to be discovered.</p>
            </div>
            <div className={styles.stepVisual}>
              <div>
                <MiniGrid cells={HEART_SOLVED} />
                <p className={styles.revealCaption}>It&rsquo;s a heart! ❤️</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tips & Tricks */}
      <section className={`${styles.section} ${styles.sectionLight}`} style={{ paddingTop: '2rem' }}>
        <div className={styles.container}>
          <h2 className={`${styles.sectionTitle} reveal`}>Tips &amp; Tricks</h2>
          <div className={styles.tipsGrid}>
            {TIPS.map((tip, i) => (
              <div key={i} className={`${styles.tipCard} reveal`}>
                <span className={styles.tipIcon} aria-hidden="true">{tip.icon}</span>
                <strong>{tip.title}</strong>
                <p>{tip.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Placeholder */}
      <section className={`${styles.section} ${styles.sectionDark}`}>
        <div className={`${styles.container} reveal`}>
          <h2 className={styles.sectionTitle}>Video Tutorial</h2>
          <div className={styles.videoWrap} role="img" aria-label="Video tutorial placeholder">
            <div className={styles.playBtn} aria-hidden="true">▶</div>
            <span className={styles.videoCaption}>Watch our 3-minute tutorial</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={`${styles.section} ${styles.sectionDark} ${styles.ctaSection}`}>
        <div className={`${styles.container} reveal`}>
          <h2 className={styles.ctaTitle}>Ready to try?</h2>
          <a href="/puzzles" className={styles.ctaButton}>Play Your First Puzzle</a>
        </div>
      </section>
    </div>
  );
}
