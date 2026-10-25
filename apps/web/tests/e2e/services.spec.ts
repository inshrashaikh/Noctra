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
      await page.waitForTimeout(500);

      // Verify no horizontal overflow
      const hasHorizontalScroll = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      expect(hasHorizontalScroll).toBe(false);

      // Verify Header & Subtitle
      await expect(page.getByText('Essential Night Services Finder')).toBeVisible();
      await expect(page.getByText(/Environmental risk proxy \(not crime data\)/i)).toBeVisible();

      // Verify Services are loaded
      await expect(page.getByText(/Government Medical College/i)).toBeVisible();

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
    await page.waitForTimeout(500);

    // Filter by Hospitals category
    const hospitalBtn = page.getByRole('button', { name: 'Hospitals' });
    await hospitalBtn.click();
    await page.waitForTimeout(300);
    await expect(page.getByText(/Government Medical College/i)).toBeVisible();

    // Search filter
    const searchInput = page.getByPlaceholder('Filter services by name...');
    await searchInput.fill('Mayo');
    await page.waitForTimeout(300);
    await expect(page.getByText(/Mayo Hospital/i)).toBeVisible();

    await page.screenshot({
      path: 'tests/e2e/screenshots/step-e-services/services-filtered.png',
    });
  });

  test('Changing time and need changes displayed services and statuses', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/services');
    await page.waitForTimeout(500);

    // 1. Filter by Need 'Food / Dhaba'
    await page.getByRole('button', { name: 'Food / Dhaba' }).click();
    await page.waitForTimeout(300);
    await expect(page.getByText(/Poojari All-Night Highway Dhaba/i)).toBeVisible();

    // 2. Switch to Evening (22:00)
    await page.getByRole('button', { name: 'Evening (22:00)' }).click();
    await page.waitForTimeout(300);
    // Haldiram's is visible at 22:00
    await expect(page.getByText(/Haldiram's Sweets and Restaurant/i)).toBeVisible();

    // 3. Switch to 2:30 AM (Night Shift)
    await page.getByRole('button', { name: '2:30 AM (Night Shift)' }).click();
    await page.waitForTimeout(300);
    // Poojari Dhaba is Open at Arrival until 03:30
    await expect(page.getByText(/Open until 03:30/i)).toBeVisible();

    // 4. Switch to Early Dawn (04:45)
    await page.getByRole('button', { name: 'Early Dawn (04:45)' }).click();
    await page.waitForTimeout(300);
    // Early dawn breakfast stall appears
    await expect(page.getByText(/Shankar Early Morning Chai/i)).toBeVisible();
  });
});
