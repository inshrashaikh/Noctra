import { test, expect } from '@playwright/test';

const viewports = [
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '390x844', width: 390, height: 844 },
];

test.describe('Journey Planner Refinement Pass', () => {
  for (const vp of viewports) {
    test(`Journey Planner at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/planner?demo=1');
      await page.waitForTimeout(1200);

      // Verify no horizontal overflow
      const hasHorizontalScroll = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      expect(hasHorizontalScroll).toBe(false);

      // Verify constraints strip
      await expect(page.getByText('Journey Route Analysis:')).toBeVisible();

      // Verify route candidate list loaded
      await expect(page.getByText(/Evaluated Route Options/i)).toBeVisible({ timeout: 10000 });

      // Verify evidence chips
      await expect(page.getByText('KNOWN').first()).toBeVisible();

      // Screenshot planner
      await page.screenshot({
        path: `tests/e2e/screenshots/step-d-planner/planner-${vp.name}.png`,
        fullPage: false,
      });
    });
  }

  test('Evidence Drawer Interaction on Planner', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/planner?demo=1');
    await page.waitForTimeout(1500);

    // Click on an evidence chip using title attribute
    const chip = page.locator('[title*="via"]').first();
    await expect(chip).toBeVisible({ timeout: 10000 });
    await chip.scrollIntoViewIfNeeded();
    await chip.click();
    await page.waitForTimeout(500);

    // Verify Evidence Drawer opened
    await expect(page.getByText('Evidence Provenance & Decay Audit')).toBeVisible();

    await page.screenshot({
      path: 'tests/e2e/screenshots/step-d-planner/planner-evidence-drawer.png',
    });
  });
});
