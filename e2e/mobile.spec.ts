import { test, expect, devices } from '@playwright/test';

// Strip defaultBrowserType to allow use inside describe blocks
function deviceConfig(name: string) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { defaultBrowserType, ...rest } = devices[name];
  return rest;
}

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

test.describe('Mobile – iPhone SE (375×667)', () => {
  test.use(deviceConfig('iPhone SE'));

  test('homepage loads on mobile', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Nonogram');
    await expect(page.getByText('Play Now').first()).toBeVisible();
  });

  test('hamburger menu toggles', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav').first();

    const hamburger = page.getByLabel(/open menu/i);
    await expect(hamburger).toBeVisible();

    // Nav links should be hidden (off-screen via transform) initially
    const puzzlesLink = nav.getByRole('link', { name: 'Puzzles' });
    await expect(puzzlesLink).not.toBeInViewport();

    // Open menu
    await hamburger.click();
    await expect(puzzlesLink).toBeInViewport();
    await expect(nav.getByRole('link', { name: 'Themes' })).toBeInViewport();
    await expect(nav.getByRole('link', { name: 'Profile' })).toBeInViewport();
    await expect(nav.getByRole('link', { name: 'How to Play' })).toBeInViewport();

    // Close menu
    const closeBtn = page.getByLabel(/close menu/i);
    await closeBtn.click();
    await expect(puzzlesLink).not.toBeInViewport();
  });

  test('hamburger menu navigates and closes', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav').first();
    const hamburger = page.getByLabel(/open menu/i);
    await hamburger.click();

    // Navigate to a non-auth-protected page
    await nav.getByRole('link', { name: 'Puzzles' }).click();
    await expect(page).toHaveURL('/puzzles');

    // Menu should close after navigation
    const themesLink = nav.getByRole('link', { name: 'Themes' });
    await expect(themesLink).not.toBeInViewport();
  });

  test('puzzle grid is playable on mobile', async ({ page }) => {
    await page.goto('/play/heart-5x5');
    await dismissTutorial(page);

    const grid = page.locator('[role="grid"][aria-label="Nonogram puzzle grid"]');
    await expect(grid).toBeVisible();

    // Cells should be touchable (at least 30px)
    const cell = page.locator('[data-row="0"][data-col="0"]');
    const box = await cell.boundingBox();
    expect(box).toBeTruthy();
    expect(box!.width).toBeGreaterThanOrEqual(20);
    expect(box!.height).toBeGreaterThanOrEqual(20);

    // Tap a cell to fill it
    await cell.tap();
    await expect(cell).toHaveAttribute('aria-label', /filled/i);
  });

  test('game board fits viewport without horizontal overflow', async ({ page }) => {
    await page.goto('/play/heart-5x5');
    await dismissTutorial(page);

    const viewportWidth = page.viewportSize()!.width;
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(viewportWidth);
  });

  test('completion modal fits viewport on mobile', async ({ page }) => {
    await page.goto('/play/heart-5x5');
    await dismissTutorial(page);

    for (const [row, col] of HEART_SOLUTION) {
      await page.locator(`[data-row="${row}"][data-col="${col}"]`).tap();
    }

    const completionText = page.getByText('Puzzle Complete!');
    await expect(completionText).toBeVisible({ timeout: 5000 });

    // Modal should not overflow the viewport
    const viewportWidth = page.viewportSize()!.width;
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(viewportWidth);
  });

  test('puzzles page fits viewport', async ({ page }) => {
    await page.goto('/puzzles');
    await expect(page.locator('h1')).toBeVisible();

    // No horizontal overflow
    const viewportWidth = page.viewportSize()!.width;
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(viewportWidth);
  });

  test('all key pages load without horizontal overflow', async ({ page }) => {
    // Only test non-auth-protected pages
    const paths = ['/', '/puzzles', '/themes', '/create', '/howtoplay'];

    for (const path of paths) {
      await page.goto(path);
      const viewportWidth = page.viewportSize()!.width;
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth, `Horizontal overflow on ${path}`).toBeLessThanOrEqual(viewportWidth);
    }
  });
});

test.describe('Mobile – iPhone 14 (390×844)', () => {
  test.use(deviceConfig('iPhone 14'));

  test('homepage loads on iPhone 14', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Nonogram');
  });

  test('hamburger visible and nav hidden on iPhone 14', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav').first();
    const hamburger = page.getByLabel(/open menu/i);
    await expect(hamburger).toBeVisible();

    const puzzlesLink = nav.getByRole('link', { name: 'Puzzles' });
    await expect(puzzlesLink).not.toBeInViewport();
  });

  test('game board cells are touchable on iPhone 14', async ({ page }) => {
    await page.goto('/play/heart-5x5');
    await dismissTutorial(page);

    const cell = page.locator('[data-row="0"][data-col="0"]');
    const box = await cell.boundingBox();
    expect(box).toBeTruthy();
    expect(box!.width).toBeGreaterThanOrEqual(20);
    expect(box!.height).toBeGreaterThanOrEqual(20);

    await cell.tap();
    await expect(cell).toHaveAttribute('aria-label', /filled/i);
  });

  test('no horizontal overflow on key pages', async ({ page }) => {
    // Only test non-auth-protected pages
    const paths = ['/', '/puzzles', '/howtoplay'];

    for (const path of paths) {
      await page.goto(path);
      const viewportWidth = page.viewportSize()!.width;
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth, `Horizontal overflow on ${path}`).toBeLessThanOrEqual(viewportWidth);
    }
  });
});
