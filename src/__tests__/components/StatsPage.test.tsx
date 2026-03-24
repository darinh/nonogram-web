import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { PuzzleProviderContext, ProgressProviderContext } from '../../providers/ProviderContext';
import type { PuzzleDefinition, PuzzleProgress } from '../../engine/types';
import type { PuzzleProvider } from '../../providers/puzzle/PuzzleProvider';
import type { ProgressProvider } from '../../providers/progress/ProgressProvider';
import StatsPage from '../../components/StatsPage';

/* ── Test data ──────────────────────────────────────── */

const PUZZLES: PuzzleDefinition[] = [
  {
    id: 'p1', title: 'Heart', size: 5, solution: [], rowClues: [], colClues: [],
    difficulty: 'blue', source: 'bundled',
  },
  {
    id: 'p2', title: 'Star', size: 5, solution: [], rowClues: [], colClues: [],
    difficulty: 'green', source: 'bundled',
  },
  {
    id: 'p3', title: 'Tree', size: 10, solution: [], rowClues: [], colClues: [],
    difficulty: 'yellow', source: 'bundled',
  },
  {
    id: 'p4', title: 'Castle', size: 15, solution: [], rowClues: [], colClues: [],
    difficulty: 'orange', source: 'bundled',
  },
];

const PROGRESS: PuzzleProgress[] = [
  {
    puzzleId: 'p1', grid: [], completed: true, elapsedTime: 120,
    lastPlayed: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    puzzleId: 'p2', grid: [], completed: true, elapsedTime: 300,
    lastPlayed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    puzzleId: 'p3', grid: [], completed: false, elapsedTime: 45,
    lastPlayed: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

/* ── Helpers ────────────────────────────────────────── */

function makePuzzleProvider(puzzles: PuzzleDefinition[]): PuzzleProvider {
  return {
    getAllPuzzles: vi.fn().mockResolvedValue(puzzles),
    getPuzzleById: vi.fn().mockImplementation(async (id: string) =>
      puzzles.find(p => p.id === id) ?? null,
    ),
  };
}

function makeProgressProvider(progress: PuzzleProgress[]): ProgressProvider {
  return {
    getAllProgress: vi.fn().mockResolvedValue(progress),
    getProgress: vi.fn().mockImplementation(async (id: string) =>
      progress.find(p => p.puzzleId === id) ?? null,
    ),
    saveProgress: vi.fn(),
    clearProgress: vi.fn(),
    getThemeProgress: vi.fn().mockResolvedValue(null),
    saveThemeProgress: vi.fn(),
    getAllThemeProgress: vi.fn().mockResolvedValue([]),
    getStreak: vi.fn().mockResolvedValue({ current: 0, longest: 0, lastDate: '' }),
    recordDailyCompletion: vi.fn(),
  };
}

function renderStatsPage(
  puzzles: PuzzleDefinition[] = PUZZLES,
  progress: PuzzleProgress[] = PROGRESS,
) {
  return render(
    <MemoryRouter initialEntries={['/stats']}>
      <PuzzleProviderContext.Provider value={makePuzzleProvider(puzzles)}>
        <ProgressProviderContext.Provider value={makeProgressProvider(progress)}>
          <StatsPage />
        </ProgressProviderContext.Provider>
      </PuzzleProviderContext.Provider>
    </MemoryRouter>,
  );
}

/* ── Tests ──────────────────────────────────────────── */

describe('StatsPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('shows loading state initially', () => {
    renderStatsPage();
    expect(screen.getByRole('status')).toHaveTextContent('Loading stats');
  });

  it('displays overview cards with correct stats', async () => {
    renderStatsPage();

    // Wait for data to load
    const overview = await screen.findByRole('list', { name: /statistics overview/i });
    const items = within(overview).getAllByRole('listitem');

    expect(items).toHaveLength(4);

    // Completed count: 2 (p1 and p2)
    expect(items[0]).toHaveTextContent('2');
    expect(items[0]).toHaveTextContent('Completed');

    // Total time: 120 + 300 + 45 = 465s → 0h 7m
    expect(items[1]).toHaveTextContent('0h 7m');
    expect(items[1]).toHaveTextContent('Total Time');

    // Average: (120 + 300) / 2 = 210s → 3:30
    expect(items[2]).toHaveTextContent('3:30');
    expect(items[2]).toHaveTextContent('Avg. Time');

    // Best time: min(120, 300) = 120s → 2:00
    expect(items[3]).toHaveTextContent('2:00');
    expect(items[3]).toHaveTextContent('Best Time');
  });

  it('renders completion by size progress bars', async () => {
    renderStatsPage();

    await screen.findByText('Completion by Size');

    // 5×5: 2 puzzles, 2 completed (p1, p2 both completed, both 5×5)
    const fiveBar = screen.getByRole('progressbar', { name: /5×5/i });
    expect(fiveBar).toHaveAttribute('aria-valuenow', '2');
    expect(fiveBar).toHaveAttribute('aria-valuemax', '2');

    // 10×10: 1 puzzle, 0 completed (p3 not completed)
    const tenBar = screen.getByRole('progressbar', { name: /10×10/i });
    expect(tenBar).toHaveAttribute('aria-valuenow', '0');
    expect(tenBar).toHaveAttribute('aria-valuemax', '1');
  });

  it('renders completion by difficulty when puzzles have difficulty', async () => {
    renderStatsPage();

    await screen.findByText('Completion by Difficulty');

    // Blue difficulty: p1 is completed
    const blueBar = screen.getByRole('progressbar', { name: /blue/i });
    expect(blueBar).toHaveAttribute('aria-valuenow', '1');
    expect(blueBar).toHaveAttribute('aria-valuemax', '1');
  });

  it('renders recent activity with completed puzzles', async () => {
    renderStatsPage();

    await screen.findByText('Recent Activity');

    // Should show completed puzzles (Heart and Star), not incomplete ones
    expect(screen.getByText('Heart')).toBeInTheDocument();
    expect(screen.getByText('Star')).toBeInTheDocument();
  });

  it('toggles puzzle details table', async () => {
    const user = userEvent.setup();
    renderStatsPage();

    const toggle = await screen.findByRole('button', { name: /all puzzles/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('table')).toBeInTheDocument();

    // All 4 puzzles should appear in the table
    const rows = screen.getAllByRole('row');
    // Header row + 4 data rows
    expect(rows).toHaveLength(5);
  });

  it('shows empty state when no progress exists', async () => {
    renderStatsPage(PUZZLES, []);

    await screen.findByText('No stats yet');
    expect(screen.getByText('Start solving puzzles and your stats will show up here!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /browse puzzles/i })).toBeInTheDocument();
  });

  it('sets the page title', async () => {
    renderStatsPage();
    await screen.findByRole('list', { name: /statistics overview/i });
    expect(document.title).toBe('Stats — Nonogram');
  });
});
