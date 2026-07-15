import { test, expect } from '@playwright/test';

const DEMO_EMAIL    = 'analyst@vaultiq.demo';
const DEMO_PASSWORD = 'demo1234';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('renders VaultIQ branding', async ({ page }) => {
    await expect(page.locator('text=VaultIQ')).toBeVisible();
    await expect(page.locator('text=AI Banking Intelligence')).toBeVisible();
  });

  test('shows email and password fields', async ({ page }) => {
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('shows demo role pills', async ({ page }) => {
    await expect(page.locator('text=Analyst')).toBeVisible();
    await expect(page.locator('text=Manager')).toBeVisible();
    await expect(page.locator('text=Auditor')).toBeVisible();
  });

  test('demo pill fills in email field', async ({ page }) => {
    await page.locator('text=Analyst').click();
    const emailValue = await page.locator('input[type="email"]').inputValue();
    expect(emailValue).toBe('analyst@vaultiq.demo');
  });

  test('shows validation error on empty submit', async ({ page }) => {
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('text=Please enter your email and password')).toBeVisible();
  });

  test('shows error on wrong credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'wrong@email.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.locator('button[type="submit"]').click();
    // Supabase returns an error — any error message should appear
    await expect(page.locator('[style*="F87171"], [style*="DC2626"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('toggles password visibility', async ({ page }) => {
    await page.fill('input[type="password"]', 'testpassword');
    const eyeBtn = page.locator('button[type="button"]').first();
    await eyeBtn.click();
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await eyeBtn.click();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('shows security compliance badges', async ({ page }) => {
    await expect(page.locator('text=256-bit')).toBeVisible();
    await expect(page.locator('text=SOC 2')).toBeVisible();
    await expect(page.locator('text=FFIEC')).toBeVisible();
  });
});
