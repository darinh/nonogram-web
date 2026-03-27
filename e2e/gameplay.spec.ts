import { test, expect } from '@playwright/test';

// Heart 5x5 solution (0-indexed): cells that should be filled
const HEART_SOLUTION: [number, number][] = [
  [0, 1], [0, 3],
  [1, 0], [1, 1], [1, 2], [1, 3], [1, 4],
  [2, 0], [2, 1], [2, 2], [2, 3], [2, 4],
  [3, 1], [3, 2], [3, 3],
  [4, 2],
];

async function dismissTutorial(page: import('@playwright/test').Page) {
  const skipBtn = page.getByText('Skip tutorial');
  if (await skipBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await skipBtn.click();
    await expect(skipBtn).not.toBeVisible();
  }
}

test.describe('Gameplay', () => {
  test('puzzle page loads with grid and toolbar', async ({ page }) => {
    await page.goto('/play/heart-5x5');
    await dismissTutorial(page);

    // Puzzle title (hidden until solved)
    await expect(page.locator('h1')).toContainText('Mystery Puzzle');

    // Grid with cells
    const grid = page.locator('[role="grid"][aria-label="Nonogram puzzle grid"]');
    await expect(grid).toBeVisible();
    const cells = grid.locator('[role="gridcell"]');
    await expect(cells).toHaveCount(25); // 5x5

    // Timer visible
    await expect(page.locator('[class*="timer"]')).toBeVisible();
  });

  test('can click cells to fill them', async ({ page }) => {
    await page.goto('/play/heart-5x5');
    await dismissTutorial(page);

    const cell = page.locator('[data-row="0"][data-col="0"]');
    await cell.click();

    // Cell should now be filled (has aria label mentioning "filled")
    await expect(cell).toHaveAttribute('aria-label', /filled/i);
  });

  test('toolbar shows fill and cross tools', async ({ page }) => {
    await page.goto('/play/heart-5x5');
    await dismissTutorial(page);

    // Tools are emoji buttons with title attributes
    await expect(page.locator('[title="Fill tool"]')).toBeVisible();
    await expect(page.locator('[title="X-Mark tool"]')).toBeVisible();
  });

  test('undo and redo buttons exist', async ({ page }) => {
    await page.goto('/play/heart-5x5');
    await dismissTutorial(page);

    await expect(page.locator('[title="Undo (Ctrl+Z)"]')).toBeVisible();
    await expect(page.locator('[title="Redo (Ctrl+Shift+Z)"]')).toBeVisible();
  });

  test('undo reverts a fill action', async ({ page }) => {
    await page.goto('/play/heart-5x5');
    await dismissTutorial(page);

    const cell = page.locator('[data-row="0"][data-col="0"]');
    await cell.click();
    await expect(cell).toHaveAttribute('aria-label', /filled/i);

    await page.locator('[title="Undo (Ctrl+Z)"]').click();
    await expect(cell).toHaveAttribute('aria-label', /empty/i);
  });

  test('cross tool marks cells with X', async ({ page }) => {
    await page.goto('/play/heart-5x5');
    await dismissTutorial(page);

    // Switch to cross tool via title
    await page.locator('[title="X-Mark tool"]').click();
    const cell = page.locator('[data-row="0"][data-col="0"]');
    await cell.click();

    await expect(cell).toHaveAttribute('aria-label', /crossed/i);
  });

  test('navigating away from game works', async ({ page }) => {
    await page.goto('/play/heart-5x5');
    await dismissTutorial(page);

    // Use nav link to go back
    await page.getByRole('link', { name: 'Puzzles' }).click();
    await expect(page).not.toHaveURL(/\/play\//);
  });

  test('timer increments over time', async ({ page }) => {
    await page.goto('/play/heart-5x5');
    await dismissTutorial(page);

    const timer = page.locator('[class*="timer"]');
    const timerText1 = await timer.textContent();
    await page.waitForTimeout(2000);
    const timerText2 = await timer.textContent();

    expect(timerText1).not.toBeNull();
    expect(timerText2).not.toBeNull();
    expect(timerText2).not.toBe(timerText1);
  });

  test('completing heart-5x5 puzzle shows completion overlay', async ({ page }) => {
    await page.goto('/play/heart-5x5');
    await dismissTutorial(page);

    // Fill all solution cells
    for (const [row, col] of HEART_SOLUTION) {
      await page.locator(`[data-row="${row}"][data-col="${col}"]`).click();
    }

    // Completion overlay should appear
    await expect(page.getByText('Puzzle Complete!')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Play Again')).toBeVisible();
  });
});
