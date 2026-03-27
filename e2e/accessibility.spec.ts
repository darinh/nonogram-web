import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Helper to run axe on a page and assert no violations
async function expectNoA11yViolations(page: import('@playwright/test').Page, disableRules?: string[]) {
  const builder = new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']);
  
  if (disableRules?.length) {
    builder.disableRules(disableRules);
  }
  
  const results = await builder.analyze();
  
  // Format violations for readable output
  const violations = results.violations.map(v => ({
    id: v.id,
    impact: v.impact,
    description: v.description,
    nodes: v.nodes.length,
    help: v.helpUrl,
  }));
  
  expect(violations, `Accessibility violations found:\n${JSON.stringify(violations, null, 2)}`).toEqual([]);
}

test.describe('Accessibility — axe-core audit', () => {
  // Color contrast needs a dedicated design pass across the full theme.
  // Exclude for now to avoid blocking other a11y improvements.
  // TODO: Remove this exclusion after completing the contrast audit.
  const knownExclusions: string[] = ['color-contrast'];

  test('homepage has no a11y violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expectNoA11yViolations(page, knownExclusions);
  });

  test('puzzle browser has no a11y violations', async ({ page }) => {
    await page.goto('/puzzles');
    await page.waitForLoadState('networkidle');
    await expectNoA11yViolations(page, knownExclusions);
  });

  test('theme browser has no a11y violations', async ({ page }) => {
    await page.goto('/themes');
    await page.waitForLoadState('networkidle');
    await expectNoA11yViolations(page, knownExclusions);
  });

  test('how to play has no a11y violations', async ({ page }) => {
    await page.goto('/howtoplay');
    await page.waitForLoadState('networkidle');
    await expectNoA11yViolations(page, knownExclusions);
  });

  test('create page has no a11y violations', async ({ page }) => {
    await page.goto('/create');
    await page.waitForLoadState('networkidle');
    await expectNoA11yViolations(page, knownExclusions);
  });

  test('daily puzzle page has no a11y violations', async ({ page }) => {
    await page.goto('/daily');
    await page.waitForLoadState('networkidle');
    await expectNoA11yViolations(page, knownExclusions);
  });

  test('login page has no a11y violations', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await expectNoA11yViolations(page, knownExclusions);
  });

  test('game page has no a11y violations', async ({ page }) => {
    await page.goto('/play/heart-5x5');
    await page.waitForLoadState('networkidle');
    // Dismiss tutorial if present
    const skipBtn = page.getByText('Skip tutorial');
    if (await skipBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await skipBtn.click();
    }
    await expectNoA11yViolations(page, knownExclusions);
  });

  test('privacy page has no a11y violations', async ({ page }) => {
    await page.goto('/privacy');
    await page.waitForLoadState('networkidle');
    await expectNoA11yViolations(page, knownExclusions);
  });

  test('terms page has no a11y violations', async ({ page }) => {
    await page.goto('/terms');
    await page.waitForLoadState('networkidle');
    await expectNoA11yViolations(page, knownExclusions);
  });
});

test.describe('Accessibility — keyboard navigation', () => {
  test('skip-nav link is functional', async ({ page }) => {
    await page.goto('/');
    
    // Tab to the skip-nav link
    await page.keyboard.press('Tab');
    
    // The skip-nav link should be focused
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeFocused();
    
    // Pressing Enter should move focus to main content
    await page.keyboard.press('Enter');
    
    // Verify we can see the main content area
    const main = page.locator('#main-content');
    await expect(main).toBeVisible();
  });
});
