import { test, expect } from '@playwright/test';

test.describe('Noctra Night-Shift Journey & Visual Validation', () => {
  test('Landing Page renders with 2:30 AM problem and screenshots', async ({ page }, testInfo) => {
    await page.goto('/');

    // Check key elements
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('02:15 AM');
    await expect(page.getByRole('link', { name: /Open Dashboard/i }).first()).toBeVisible();

    // Verify SIMULATED badge on landing preview
    await expect(page.getByText('SIMULATED').locator('visible=true').first()).toBeVisible();

    // Verify sections
    await expect(page.getByText('01 / The Problem Statement')).toBeVisible();
    await expect(page.getByText('04 / Complete Honesty')).toBeVisible();

    // Take section screenshots on desktop
    const projectName = testInfo.project.name;
    if (projectName === 'desktop') {
      const problemSection = page.locator('section#problem');
      if (await problemSection.isVisible()) {
        await problemSection.screenshot({
          path: 'tests/e2e/screenshots/landing-problem.png',
        });
      }
      const honestySection = page.locator('section#verification');
      if (await honestySection.isVisible()) {
        await honestySection.screenshot({
          path: 'tests/e2e/screenshots/landing-honesty.png',
        });
      }
    }

    await page.screenshot({
      path: `tests/e2e/screenshots/landing-${projectName}.png`,
      fullPage: true,
    });
  });

  test('Planner Dashboard loads mock plan, shows Night Ribbon and takes screenshots', async ({ page }, testInfo) => {
    await page.goto('/planner?demo=1');

    // Wait for the route candidate list to load
    await expect(page.getByText(/Evaluated Route Options/i)).toBeVisible({ timeout: 15000 });

    // Check candidates
    await expect(page.getByText('Auto').first()).toBeVisible();

    // Check evidence chips
    await expect(page.getByText('KNOWN').first()).toBeVisible();

    // Check SIMULATED badge presence
    await expect(page.getByText('SIMULATED').locator('visible=true').first()).toBeVisible();

    // Take screenshot
    const projectName = testInfo.project.name;
    await page.screenshot({
      path: `tests/e2e/screenshots/planner-${projectName}.png`,
      fullPage: true,
    });
  });

  test('Full User Journey: Road Closure Injection & Replan', async ({ page }) => {
    await page.goto('/planner?demo=1');

    await expect(page.getByText(/Evaluated Route Options/i)).toBeVisible({ timeout: 15000 });

    // Click Inject Closure button in demo panel
    const closureBtn = page.getByRole('button', { name: /Inject Closure/i });
    await expect(closureBtn).toBeVisible({ timeout: 5000 });
    await closureBtn.click();

    // Expect closure alert to trigger and appear in AlertCenter
    await expect(page.getByText('Road Closure Detected')).toBeVisible({ timeout: 5000 });
  });
});
