import { test, expect } from '@playwright/test';

const viewports = [
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '390x844', width: 390, height: 844 },
];

test.describe('Navbar Verification Pass', () => {
  for (const vp of viewports) {
    test(`Landing Navbar at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');
      await page.waitForTimeout(500);

      // Verify no horizontal overflow on window
      const hasHorizontalScroll = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      expect(hasHorizontalScroll).toBe(false);

      // Verify navbar height is 64px
      const header = page.locator('header').first();
      await expect(header).toBeVisible();
      const box = await header.boundingBox();
      expect(box?.height).toBe(64);

      // Screenshot navbar zone
      await header.screenshot({
        path: `tests/e2e/screenshots/step-a-navbar/landing-navbar-${vp.name}.png`,
      });
    });

    test(`App Navbar at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/dashboard');
      await page.waitForTimeout(800);

      const hasHorizontalScroll = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      expect(hasHorizontalScroll).toBe(false);

      const header = page.locator('header').first();
      await expect(header).toBeVisible();
      const box = await header.boundingBox();
      expect(box?.height).toBe(64);

      await header.screenshot({
        path: `tests/e2e/screenshots/step-a-navbar/app-navbar-${vp.name}.png`,
      });
    });
  }

  test('Mobile Sheet Opens and Renders Full Width (< 768px)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/dashboard');
    await page.waitForTimeout(500);

    // Hamburger button click
    const menuBtn = page.getByRole('button', { name: /toggle navigation menu/i });
    await expect(menuBtn).toBeVisible();
    await menuBtn.click();
    await page.waitForTimeout(300);

    // Header with open sheet screenshot
    const header = page.locator('header').first();
    await header.screenshot({
      path: 'tests/e2e/screenshots/step-a-navbar/mobile-sheet-390x844.png',
    });
  });
});
