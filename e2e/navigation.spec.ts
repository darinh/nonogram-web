import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('homepage loads with title and actions', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Nonogram');
    await expect(page.getByText('Play Now').first()).toBeVisible();
  });

  test('nav links navigate correctly', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav');
    
    // Navigate to Puzzles
    await nav.getByRole('link', { name: 'Puzzles' }).click();
    await expect(page).toHaveURL('/puzzles');
    
    // Navigate to Themes
    await nav.getByRole('link', { name: 'Themes' }).click();
    await expect(page).toHaveURL('/themes');
    
    // Navigate to Create
    await nav.getByRole('link', { name: 'Create' }).click();
    await expect(page).toHaveURL('/create');
    
    // Navigate home via logo
    await nav.getByRole('link', { name: 'Nonogram' }).click();
    await expect(page).toHaveURL('/');
  });

  test('puzzle browser shows puzzle cards', async ({ page }) => {
    await page.goto('/puzzles');
    // Puzzle names are hidden until solved — shows "Mystery Puzzle"
    await expect(page.getByRole('heading', { name: 'Mystery Puzzle' }).first()).toBeVisible();
  });

  test('theme browser shows theme cards', async ({ page }) => {
    await page.goto('/themes');
    await expect(page.getByRole('heading', { name: 'Nature' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Space' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ocean' })).toBeVisible();
  });

  test('stats page redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/stats');
    await expect(page).toHaveURL('/login');
    await expect(page.locator('h1')).toContainText('Welcome');
  });

  test('create page loads', async ({ page }) => {
    await page.goto('/create');
    await expect(page.getByRole('heading', { name: /Create Puzzle/ })).toBeVisible();
  });
});
