import { test } from '@playwright/test';

const viewports = [
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '390x844', width: 390, height: 844 },
];

test.describe('Baseline UI Audit Screenshots', () => {
  for (const vp of viewports) {
    test(`Capture Landing at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: `tests/e2e/screenshots/audit/landing-${vp.name}.png`,
        fullPage: false,
      });
      await page.screenshot({
        path: `tests/e2e/screenshots/audit/landing-${vp.name}-full.png`,
        fullPage: true,
      });
    });

    test(`Capture Planner at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/planner?demo=1');
      await page.waitForTimeout(1500);
      await page.screenshot({
        path: `tests/e2e/screenshots/audit/planner-${vp.name}.png`,
        fullPage: false,
      });
    });
  }
});
