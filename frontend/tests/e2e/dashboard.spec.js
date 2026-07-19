import { test, expect } from '@playwright/test';

// Helper: log in before dashboard tests
async function login(page) {
  await page.goto('/login');
  await page.fill('input[type="email"]',    'analyst@fintel.demo');
  await page.fill('input[type="password"]', 'demo1234');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('/', { timeout: 15000 });
}

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('shows Command Center title', async ({ page }) => {
    await expect(page.locator('text=Command Center')).toBeVisible();
  });

  test('renders 4 KPI cards', async ({ page }) => {
    await expect(page.locator('text=Fraud Blocked')).toBeVisible();
    await expect(page.locator('text=Credit Approvals')).toBeVisible();
    await expect(page.locator('text=Compliance Flags')).toBeVisible();
    await expect(page.locator('text=Portfolio Risk')).toBeVisible();
  });

  test('shows Fraud by Category panel', async ({ page }) => {
    await expect(page.locator('text=Fraud by Category')).toBeVisible();
    await expect(page.locator('text=Wire Transfer')).toBeVisible();
  });

  test('shows Trend Lines panel', async ({ page }) => {
    await expect(page.locator('text=Trend Lines')).toBeVisible();
    await expect(page.locator('text=Fraud Volume')).toBeVisible();
    await expect(page.locator('text=Credit Approval Rate')).toBeVisible();
  });

  test('shows Live Alerts panel', async ({ page }) => {
    await expect(page.locator('text=Live Alerts')).toBeVisible();
    await expect(page.locator('text=LIVE')).toBeVisible();
  });

  test('sidebar navigation is visible', async ({ page }) => {
    await expect(page.locator('text=Fintel')).toBeVisible();
    await expect(page.locator('text=Overview')).toBeVisible();
    await expect(page.locator('text=Fraud Intel')).toBeVisible();
    await expect(page.locator('text=Credit Suite')).toBeVisible();
    await expect(page.locator('text=Compliance Hub')).toBeVisible();
  });

  test('topbar shows LIVE indicator and clock', async ({ page }) => {
    await expect(page.locator('text=LIVE').first()).toBeVisible();
    await expect(page.locator('text=All systems operational')).toBeVisible();
  });

  test('navigates to Fraud Intel from sidebar', async ({ page }) => {
    await page.locator('text=Fraud Intel').click();
    await page.waitForURL('/fraud', { timeout: 8000 });
    await expect(page).toHaveURL('/fraud');
  });

  test('navigates to Credit Suite from sidebar', async ({ page }) => {
    await page.locator('text=Credit Suite').click();
    await page.waitForURL('/credit-suite', { timeout: 8000 });
    await expect(page).toHaveURL('/credit-suite');
  });
});
