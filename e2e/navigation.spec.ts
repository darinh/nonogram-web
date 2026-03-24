import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('homepage loads with title and actions', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Nonogram');
    await expect(page.getByText('Browse Puzzles')).toBeVisible();
  });

  test('nav links navigate correctly', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to Puzzles
    await page.getByRole('link', { name: 'Puzzles' }).click();
    await expect(page).toHaveURL('/puzzles');
    
    // Navigate to Themes
    await page.getByRole('link', { name: 'Themes' }).click();
    await expect(page).toHaveURL('/themes');
    
    // Navigate to Create
    await page.getByRole('link', { name: 'Create' }).click();
    await expect(page).toHaveURL('/create');
    
    // Navigate to Stats
    await page.getByRole('link', { name: /Stats/ }).click();
    await expect(page).toHaveURL('/stats');
    
    // Navigate home via logo
    await page.getByRole('link', { name: 'Nonogram' }).first().click();
    await expect(page).toHaveURL('/');
  });

  test('puzzle browser shows puzzle cards', async ({ page }) => {
    await page.goto('/puzzles');
    await expect(page.getByRole('heading', { name: 'Heart' })).toBeVisible();
  });

  test('theme browser shows theme cards', async ({ page }) => {
    await page.goto('/themes');
    await expect(page.getByRole('heading', { name: 'Nature' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Space' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ocean' })).toBeVisible();
  });

  test('stats page shows empty state', async ({ page }) => {
    await page.goto('/stats');
    await expect(page.locator('h1')).toContainText('Stats');
    await expect(page.getByText('No stats yet')).toBeVisible();
  });

  test('create page loads', async ({ page }) => {
    await page.goto('/create');
    await expect(page.getByRole('heading', { name: /Create Puzzle/ })).toBeVisible();
  });
});
