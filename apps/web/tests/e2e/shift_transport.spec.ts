import { test, expect } from '@playwright/test';

test.describe('Shift-Aware Transport Availability (Time-Dependent Options)', () => {
  test('changing shift time changes displayed transport options and feasibility', async ({ page }) => {
    await page.goto('/planner?demo=1');
    await page.waitForTimeout(1000);

    // 1. Initial State: 02:15 AM
    // Transit should be INFEASIBLE (Metro ended at 22:15)
    await expect(page.getByText(/service ended|Last service was/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('UNKNOWN availability').first()).toBeVisible();

    // 2. Switch to Evening Shift Preset (22:00)
    const eveningPreset = page.getByRole('button', { name: /Evening/i }).first();
    await eveningPreset.scrollIntoViewIfNeeded();
    await eveningPreset.click();
    await page.waitForTimeout(800);

    // Metro transit is now RUNNING!
    // Should show "Runs until 22:15"
    await expect(page.getByText(/Runs until 22:15/i).first()).toBeVisible({ timeout: 10000 });

    // 3. Switch to Early Morning Preset (04:30)
    const earlyPreset = page.getByRole('button', { name: /4:30 AM/i }).first();
    await earlyPreset.scrollIntoViewIfNeeded();
    await earlyPreset.click();
    await page.waitForTimeout(800);

    // Should indicate transit not started yet (Starts at 06:00)
    await expect(page.getByText(/Starts at 06:00/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('dashboard reflects dynamic shift presets and computed telemetry counts', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(1000);

    // Initial 02:15 state on dashboard
    await expect(page.getByText('02:15').first()).toBeVisible();
    await expect(page.getByText('Wardha Road Corridor').first()).toBeVisible();

    // Click 22:00 preset on dashboard
    const eveningPreset = page.getByRole('button', { name: '22:00' }).first();
    await eveningPreset.scrollIntoViewIfNeeded();
    await eveningPreset.click();
    await page.waitForTimeout(800);

    // Dashboard should update to 22:00 and recommend Metro
    await expect(page.getByText('22:00').first()).toBeVisible();
    await expect(page.getByText(/Nagpur Metro Orange Line/i).first()).toBeVisible({ timeout: 10000 });
  });
});
