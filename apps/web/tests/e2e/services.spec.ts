import { test, expect } from '@playwright/test';

const viewports = [
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '390x844', width: 390, height: 844 },
];

test.describe('Essential Services Refinement Pass', () => {
  for (const vp of viewports) {
    test(`Services Page at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/services');
      await page.waitForTimeout(1000);

      // Verify no horizontal overflow
      const hasHorizontalScroll = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      expect(hasHorizontalScroll).toBe(false);

      // Verify Header & Subtitle
      await expect(page.getByText('Essential Night Services')).toBeVisible();
      await expect(page.getByText(/Environmental risk proxy \(not crime data\)/i)).toBeVisible();

      // Verify Services are loaded
      await expect(page.getByText('Government Medical College & Hospital')).toBeVisible();

      // Screenshot services page
      await page.screenshot({
        path: `tests/e2e/screenshots/step-e-services/services-${vp.name}.png`,
        fullPage: false,
      });
    });
  }

  test('Filter and Search on Services Page', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/services');
    await page.waitForTimeout(1000);

    // Filter by Hospitals
    const hospitalBtn = page.getByRole('button', { name: 'Hospitals' });
    await hospitalBtn.click();
    await page.waitForTimeout(300);
    await expect(page.getByText('Government Medical College & Hospital')).toBeVisible();

    // Search filter
    const searchInput = page.getByPlaceholder('Filter services by name...');
    await searchInput.fill('Mayo');
    await page.waitForTimeout(300);
    await expect(page.getByText('Mayo Hospital (Indira Gandhi Government)')).toBeVisible();

    await page.screenshot({
      path: 'tests/e2e/screenshots/step-e-services/services-filtered.png',
    });
  });
});
