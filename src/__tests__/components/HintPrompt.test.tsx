import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HintPrompt from '../../components/HintPrompt';

/* ── Helpers ─────────────────────────────────────────── */

interface TestProps {
  axis: 'row' | 'col';
  index: number;
  cost: number;
  currentCoins: number;
  revealableCount: number;
  onConfirm: () => void;
  onCancel: () => void;
  canAfford?: boolean;
}

const baseProps: TestProps = {
  axis: 'row',
  index: 2,
  cost: 8,
  currentCoins: 50,
  revealableCount: 4,
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
};

function renderPrompt(overrides: Partial<TestProps> = {}) {
  const props: TestProps = { ...baseProps, onConfirm: vi.fn(), onCancel: vi.fn(), ...overrides };
  const result = render(<HintPrompt {...props} />);
  return { ...result, props };
}

/* ── Rendering ───────────────────────────────────────── */

describe('HintPrompt', () => {
  describe('rendering', () => {
    it('displays 1-indexed row label', () => {
      renderPrompt({ axis: 'row', index: 2 });
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Reveal Row 3');
    });

    it('displays 1-indexed column label', () => {
      renderPrompt({ axis: 'col', index: 0 });
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Reveal Column 1');
    });

    it('shows revealable cell count', () => {
      renderPrompt({ revealableCount: 7 });
      expect(screen.getByText(/reveals 7 cells/i)).toBeInTheDocument();
    });

    it('uses singular "cell" for count of 1', () => {
      renderPrompt({ revealableCount: 1 });
      expect(screen.getByText(/reveals 1 cell$/i)).toBeInTheDocument();
    });

    it('shows coin cost', () => {
      renderPrompt({ cost: 12 });
      expect(screen.getByText(/12 coins/)).toBeInTheDocument();
    });

    it('shows current balance when currentCoins is provided', () => {
      renderPrompt({ currentCoins: 42 });
      expect(screen.getByText(/your balance:.*42/i)).toBeInTheDocument();
    });

    it('hides balance display when currentCoins is not provided (legacy mode)', () => {
      renderPrompt({ currentCoins: undefined, canAfford: true });
      expect(screen.queryByText(/your balance/i)).not.toBeInTheDocument();
    });
  });

  /* ── Affordability ──────────────────────────────────── */

  describe('affordability', () => {
    it('enables Buy Hint button when user can afford', () => {
      renderPrompt({ cost: 10, currentCoins: 20 });
      expect(screen.getByRole('button', { name: /buy hint/i })).toBeEnabled();
    });

    it('disables Buy Hint and shows warning when user cannot afford', () => {
      renderPrompt({ cost: 100, currentCoins: 5 });
      const buyButton = screen.getByRole('button', { name: /not enough coins/i });
      expect(buyButton).toBeDisabled();
      expect(screen.getByRole('alert')).toHaveTextContent(/not enough coins/i);
    });

    it('enables Buy Hint when cost equals balance exactly', () => {
      renderPrompt({ cost: 8, currentCoins: 8 });
      expect(screen.getByRole('button', { name: /buy hint/i })).toBeEnabled();
    });

    it('supports legacy canAfford prop when currentCoins is omitted', () => {
      renderPrompt({
        currentCoins: undefined,
        canAfford: false,
      });
      const buyButton = screen.getByRole('button', { name: /not enough coins/i });
      expect(buyButton).toBeDisabled();
    });
  });

  /* ── Already-solved state ───────────────────────────── */

  describe('already solved', () => {
    it('shows solved message when revealableCount is 0', () => {
      renderPrompt({ revealableCount: 0 });
      expect(screen.getByText(/this row is already solved/i)).toBeInTheDocument();
    });

    it('disables Buy Hint button when already solved', () => {
      renderPrompt({ revealableCount: 0 });
      const buyButton = screen.getByRole('button', { name: /already solved/i });
      expect(buyButton).toBeDisabled();
    });

    it('does not show cost or cell count when already solved', () => {
      renderPrompt({ revealableCount: 0, cost: 8 });
      expect(screen.queryByText(/8 coins/)).not.toBeInTheDocument();
      expect(screen.queryByText(/reveals/i)).not.toBeInTheDocument();
    });

    it('does not show "not enough coins" warning when already solved', () => {
      renderPrompt({ revealableCount: 0, currentCoins: 0, cost: 10 });
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  /* ── User interactions ──────────────────────────────── */

  describe('interactions', () => {
    it('calls onConfirm when Buy Hint is clicked', async () => {
      const user = userEvent.setup();
      const { props } = renderPrompt();
      await user.click(screen.getByRole('button', { name: /buy hint/i }));
      expect(props.onConfirm).toHaveBeenCalledOnce();
    });

    it('calls onCancel when Cancel is clicked', async () => {
      const user = userEvent.setup();
      const { props } = renderPrompt();
      await user.click(screen.getByRole('button', { name: /cancel/i }));
      expect(props.onCancel).toHaveBeenCalledOnce();
    });

    it('calls onCancel when Escape is pressed', async () => {
      const user = userEvent.setup();
      const { props } = renderPrompt();
      await user.keyboard('{Escape}');
      expect(props.onCancel).toHaveBeenCalledOnce();
    });

    it('calls onCancel when clicking the backdrop', async () => {
      const user = userEvent.setup();
      const { props } = renderPrompt();
      // The backdrop has role="presentation"
      const backdrop = screen.getByRole('presentation');
      await user.click(backdrop);
      expect(props.onCancel).toHaveBeenCalledOnce();
    });

    it('does NOT call onCancel when clicking inside the modal', async () => {
      const user = userEvent.setup();
      const { props } = renderPrompt();
      await user.click(screen.getByRole('dialog'));
      expect(props.onCancel).not.toHaveBeenCalled();
    });
  });

  /* ── Accessibility ──────────────────────────────────── */

  describe('accessibility', () => {
    it('has dialog role with aria-modal', () => {
      renderPrompt();
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('has an accessible label', () => {
      renderPrompt({ axis: 'col', index: 4 });
      expect(screen.getByRole('dialog')).toHaveAttribute(
        'aria-label',
        'Reveal Column 5',
      );
    });

    it('auto-focuses Buy Hint when user can afford', () => {
      renderPrompt({ cost: 5, currentCoins: 100 });
      expect(screen.getByRole('button', { name: /buy hint/i })).toHaveFocus();
    });

    it('auto-focuses Cancel when user cannot afford', () => {
      renderPrompt({ cost: 999, currentCoins: 0 });
      expect(screen.getByRole('button', { name: /cancel/i })).toHaveFocus();
    });

    it('auto-focuses Cancel when already solved', () => {
      renderPrompt({ revealableCount: 0 });
      expect(screen.getByRole('button', { name: /cancel/i })).toHaveFocus();
    });

    it('traps focus within the modal on Tab', async () => {
      const user = userEvent.setup();
      renderPrompt();

      // Buy Hint is focused initially
      const buyHint = screen.getByRole('button', { name: /buy hint/i });
      const cancel = screen.getByRole('button', { name: /cancel/i });
      expect(buyHint).toHaveFocus();

      // Tab backward from first focusable → should wrap to last
      await user.keyboard('{Shift>}{Tab}{/Shift}');
      // Cancel is before Buy Hint in DOM, so wrapping from cancel (first) should go to buy (last)
      // Actually, Cancel is first in DOM order, Buy Hint is second
      // Initial focus is on Buy Hint (last). Shift+Tab from there goes to Cancel (first) - normal
      expect(cancel).toHaveFocus();

      // Tab forward from Cancel → Buy Hint (normal)
      await user.keyboard('{Tab}');
      expect(buyHint).toHaveFocus();

      // Tab forward from Buy Hint (last) → should wrap to Cancel (first)
      await user.keyboard('{Tab}');
      expect(cancel).toHaveFocus();
    });
  });
});
