import { test, expect } from '@playwright/test';

test('debug JS click', async ({ page }) => {
  await page.goto('/create');
  await page.getByText('Draw Manually').click();
  await page.waitForTimeout(300);

  // Click a cell via JS and check result
  const result = await page.evaluate(() => {
    const grid = document.querySelector('[class*="gridPreview"]');
    if (!grid) return 'NO GRID';
    const cell = grid.children[0] as HTMLElement;
    const before = cell.className;
    cell.click();
    // Need to wait for React re-render
    return { before, afterImmediate: cell.className };
  });
  console.log('Before/after click:', result);
  
  await page.waitForTimeout(200);
  
  // Check again after React re-render
  const afterRerender = await page.evaluate(() => {
    const grid = document.querySelector('[class*="gridPreview"]');
    if (!grid) return 'NO GRID';
    return (grid.children[0] as HTMLElement).className;
  });
  console.log('After re-render:', afterRerender);
  
  // Check if activeGrid changed via another click
  const result2 = await page.evaluate(() => {
    const grid = document.querySelector('[class*="gridPreview"]');
    if (!grid) return 'NO GRID';
    const cell = grid.children[5] as HTMLElement;
    cell.click();
    return cell.className;
  });
  console.log('Cell 5 after click:', result2);
  
  await page.waitForTimeout(200);
  const afterRerender2 = await page.evaluate(() => {
    const grid = document.querySelector('[class*="gridPreview"]');
    if (!grid) return 'NO GRID';
    // Check first few cells
    return Array.from(grid.children).slice(0, 10).map((c: Element) => (c as HTMLElement).className);
  });
  console.log('First 10 cells classes:', afterRerender2);
});
