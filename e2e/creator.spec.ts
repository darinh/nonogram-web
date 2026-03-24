import { test, expect } from '@playwright/test';

test.describe('Creator Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/create');
  });

  test('page loads with heading, grid, and controls', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Create Puzzle');
    await expect(page.getByText('From Photo')).toBeVisible();
    await expect(page.getByText('Draw Manually')).toBeVisible();
    await expect(page.locator('input[placeholder="My Awesome Puzzle"]')).toBeVisible();
    await expect(page.getByText('5×5')).toBeVisible();
    await expect(page.getByText('10×10')).toBeVisible();
    await expect(page.getByText('15×15')).toBeVisible();
    await expect(page.locator('div[class*="gridPreview"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Puzzle' })).toBeVisible();
  });

  test('can switch to manual tab and paint cells', async ({ page }) => {
    await page.getByText('Draw Manually').click();
    await expect(page.getByText('Draw Your Puzzle')).toBeVisible();

    const cells = page.locator('div[class*="previewCell"]');
    const firstCell = cells.first();

    // Click a cell to fill it
    await firstCell.click();
    await expect(firstCell).toHaveClass(/previewFilled/);

    // Click again to toggle off
    await firstCell.click();
    await expect(firstCell).not.toHaveClass(/previewFilled/);
  });

  test('can set puzzle title', async ({ page }) => {
    const titleInput = page.locator('input[placeholder="My Awesome Puzzle"]');
    await titleInput.fill('Test Puzzle');
    await expect(titleInput).toHaveValue('Test Puzzle');
  });

  test('Create Puzzle button exists and is clickable', async ({ page }) => {
    const createButton = page.getByRole('button', { name: 'Create Puzzle' });
    await expect(createButton).toBeVisible();
    await expect(createButton).toBeEnabled();
  });

  test('grid size selection changes grid cell count', async ({ page }) => {
    // Switch to manual tab so cells are interactive and grid is visible
    await page.getByText('Draw Manually').click();

    // Default is 10×10 = 100 cells
    const cells = page.locator('div[class*="previewCell"]');
    await expect(cells).toHaveCount(100);

    // Switch to 5×5 = 25 cells
    await page.getByText('5×5').click();
    await expect(cells).toHaveCount(25);

    // Switch to 15×15 = 225 cells
    await page.getByText('15×15').click();
    await expect(cells).toHaveCount(225);
  });

  test('photo tab shows upload area and threshold slider', async ({ page }) => {
    // Photo tab is default
    await expect(page.getByText('Click or drag an image here')).toBeVisible();
    await expect(page.locator('input[type="range"]')).toBeVisible();
    await expect(page.getByText('Preview')).toBeVisible();
  });

  test('switching tabs changes preview title', async ({ page }) => {
    await expect(page.getByText('Preview')).toBeVisible();

    await page.getByText('Draw Manually').click();
    await expect(page.getByText('Draw Your Puzzle')).toBeVisible();

    await page.getByText('From Photo').click();
    await expect(page.getByText('Preview')).toBeVisible();
  });

  test('creating puzzle without title shows validation alert', async ({ page }) => {
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('title');
      await dialog.accept();
    });

    await page.getByText('Draw Manually').click();
    await page.getByRole('button', { name: 'Create Puzzle' }).click();
  });
});
