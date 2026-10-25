import { test, expect } from '@playwright/test';

const viewports = [
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '390x844', width: 390, height: 844 },
];

test.describe('Dashboard Refinement Pass', () => {
  for (const vp of viewports) {
    test(`Dashboard at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);

      // Verify no horizontal overflow
      const hasHorizontalScroll = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      expect(hasHorizontalScroll).toBe(false);

      // Check Left Sidebar (240px, 5 items)
      await expect(page.getByLabel('Sidebar Navigation').getByRole('link', { name: 'Plan journey' })).toBeVisible();

      // Check Row 1 header strip
      await expect(page.getByText('Good evening, Priya')).toBeVisible();
      await expect(page.getByText(/Shift ends 2:15 AM, home by 3:00 AM/i)).toBeVisible();
      await expect(page.getByText('Tier 0, live data (simulated)')).toBeVisible();

      // Check Row 2 Night Ribbon & Recommended Card
      await expect(page.getByText('Night Ribbon Timeline')).toBeVisible();
      await expect(page.getByText('Recommended route')).toBeVisible();
      const openRouteBtn = page.getByRole('link', { name: /Open route/i });
      await expect(openRouteBtn).toBeVisible();

      // Check Row 3 Evidence Chips
      await expect(page.getByText(/Telemetry confidence:/i)).toBeVisible();

      // Check Row 4 Map & Tabs
      await expect(page.getByRole('button', { name: /^routes$/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /^services$/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /^alerts$/i })).toBeVisible();

      // Screenshot entire dashboard
      await page.screenshot({
        path: `tests/e2e/screenshots/step-b-dashboard/dashboard-${vp.name}.png`,
        fullPage: false,
      });
    });
  }

  test('Dashboard Tab Switching and Drawer Interaction', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/dashboard');
    await page.waitForTimeout(1000);

    // Switch to Services tab
    const servicesTab = page.getByRole('button', { name: /^services$/i });
    await servicesTab.click();
    await expect(page.getByText('View all services →')).toBeVisible();

    // Switch to Alerts tab
    const alertsTab = page.getByRole('button', { name: /^alerts$/i });
    await alertsTab.click();
    await expect(page.getByText(/View all alerts/i)).toBeVisible();

    // Click View all alerts to trigger AlertsDrawer
    const viewAllAlerts = page.getByRole('button', { name: /View all alerts/i });
    await viewAllAlerts.click();
    await page.waitForTimeout(300);

    // Check Drawer opened
    await expect(page.getByRole('heading', { name: 'Situational Alerts' }).first()).toBeVisible();
    await page.screenshot({
      path: 'tests/e2e/screenshots/step-b-dashboard/dashboard-alerts-drawer.png',
    });
  });
});
