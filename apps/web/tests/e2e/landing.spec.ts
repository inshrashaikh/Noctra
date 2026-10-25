import { test, expect } from '@playwright/test';

const viewports = [
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '390x844', width: 390, height: 844 },
];

test.describe('Landing Page Refinement Pass', () => {
  for (const vp of viewports) {
    test(`Landing Page at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');
      await page.waitForTimeout(1000);

      // Verify no horizontal overflow
      const hasHorizontalScroll = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      expect(hasHorizontalScroll).toBe(false);

      // Verify Hero content
      await expect(
        page.getByText('At 2:30 AM, the bus may or may not be running. Noctra tells you which.')
      ).toBeVisible();
      await expect(page.getByText('Ends 2:15 AM').first()).toBeVisible();
      await expect(page.getByText('Home by 3:00 AM').first()).toBeVisible();

      // Verify Landing Sections
      await expect(page.getByText('A city built for the daytime.')).toBeVisible();
      await expect(page.getByText('Every fact carries its age.')).toBeVisible();
      await expect(page.getByText('Three tiers of degraded.')).toBeVisible();
      await expect(page.getByText('What is real, and what is not.')).toBeVisible();
      await expect(page.getByText('Know your way home before you leave.')).toBeVisible();

      // Verify Footer attribution
      await expect(page.getByText(/CASCADE '26, IIIT Nagpur/i).first()).toBeVisible();
      await expect(page.getByText(/© OpenStreetMap contributors/i).first()).toBeVisible();

      // Screenshot above the fold
      await page.screenshot({
        path: `tests/e2e/screenshots/step-c-landing/landing-${vp.name}.png`,
        fullPage: false,
      });

      // Full page screenshot
      await page.screenshot({
        path: `tests/e2e/screenshots/step-c-landing/landing-${vp.name}-full.png`,
        fullPage: true,
      });
    });
  }
});
