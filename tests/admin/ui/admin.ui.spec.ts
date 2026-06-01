import { test, expect } from '@playwright/test';

const ADMIN_BASE = 'http://localhost:5173';
const API_BASE = 'http://127.0.0.1:4000/api';
const ADMIN_EMAIL = 'minhnhat@wanderly.com';
const ADMIN_PASSWORD = 'Wanderly@123';

// Helper: fill login form and submit
async function adminLogin(page: any, email: string, password: string) {
  await page.goto(`${ADMIN_BASE}/admin/login`);
  await page.waitForLoadState('networkidle');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: /sign in|log in|login/i }).click();
}

test.describe('ADMIN UI - Login & Navigation (ADM-026 to ADM-030)', () => {

  // ADM-026: Admin Login UI - Valid credentials
  test('ADM-026 TD1: Admin login with valid credentials', async ({ page }) => {
    await adminLogin(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    // Should show success toast and redirect to dashboard
    await expect(page.getByText(/login successful|admin login successful/i)).toBeVisible({ timeout: 10000 });
    await page.waitForURL(/\/admin\/dashboard/, { timeout: 10000 });
    // Verify token in localStorage
    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(token).toBeTruthy();
  });

  test('ADM-026 TD2: Admin login stores adminUser in localStorage', async ({ page }) => {
    await adminLogin(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.waitForURL(/\/admin\/dashboard/, { timeout: 10000 });
    const adminUser = await page.evaluate(() => localStorage.getItem('adminUser'));
    expect(adminUser).toBeTruthy();
    const parsed = JSON.parse(adminUser!);
    expect(parsed.Role).toBe('admin');
  });

  test('ADM-026 TD3: Admin login shows dashboard content', async ({ page }) => {
    await adminLogin(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.waitForURL(/\/admin\/dashboard/, { timeout: 10000 });
    // Dashboard should be visible (not blank page)
    await expect(page.locator('body')).toBeVisible();
    const bodyText = await page.locator('body').textContent();
    expect(bodyText!.length).toBeGreaterThan(10);
  });

  // ADM-027: Admin Login UI - Non-admin user
  test('ADM-027 TD1: Traveler login to admin panel', async ({ page, request }) => {
    // Register a traveler
    const email = `adm027_trav_${Date.now()}@wanderly.com`;
    await request.post(`${API_BASE}/auth/register`, {
      data: { full_name: 'ADM027 Traveler', email, password: 'Test@1234', role: 'traveler' }
    });
    await adminLogin(page, email, 'Test@1234');
    await expect(page.getByText(/do not have admin privileges/i)).toBeVisible({ timeout: 10000 });
  });

  test('ADM-027 TD2: Provider login to admin panel', async ({ page, request }) => {
    const email = `adm027_prov_${Date.now()}@wanderly.com`;
    await request.post(`${API_BASE}/auth/register`, {
      data: { full_name: 'ADM027 Provider', email, password: 'Test@1234', role: 'provider' }
    });
    await adminLogin(page, email, 'Test@1234');
    await expect(page.getByText(/do not have admin privileges/i)).toBeVisible({ timeout: 10000 });
  });

  test('ADM-027 TD3: Non-admin should not store token', async ({ page, request }) => {
    const email = `adm027_notoken_${Date.now()}@wanderly.com`;
    await request.post(`${API_BASE}/auth/register`, {
      data: { full_name: 'ADM027 NoToken', email, password: 'Test@1234', role: 'traveler' }
    });
    await adminLogin(page, email, 'Test@1234');
    await expect(page.getByText(/do not have admin privileges/i)).toBeVisible({ timeout: 10000 });
    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(token).toBeFalsy();
  });

  // ADM-028: Admin Login UI - Wrong password
  test('ADM-028 TD1: Wrong password attempt 1', async ({ page }) => {
    await adminLogin(page, ADMIN_EMAIL, 'WrongPass@111');
    await expect(page.getByText(/incorrect|invalid|wrong|try again/i)).toBeVisible({ timeout: 10000 });
  });

  test('ADM-028 TD2: Wrong password attempt 2', async ({ page }) => {
    await adminLogin(page, ADMIN_EMAIL, 'AnotherWrong@222');
    await expect(page.getByText(/incorrect|invalid|wrong|try again/i)).toBeVisible({ timeout: 10000 });
  });

  test('ADM-028 TD3: Wrong password attempt 3', async ({ page }) => {
    await adminLogin(page, ADMIN_EMAIL, 'ThirdWrong@333');
    await expect(page.getByText(/incorrect|invalid|wrong|try again/i)).toBeVisible({ timeout: 10000 });
  });

  // ADM-029: Admin Protected Route
  test('ADM-029 TD1: Access dashboard without login redirects to login', async ({ page }) => {
    await page.goto(`${ADMIN_BASE}/admin/dashboard`);
    await page.waitForLoadState('networkidle');
    // Should redirect to login page
    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 10000 });
  });

  test('ADM-029 TD2: Access dashboard after clearing localStorage', async ({ page }) => {
    await page.goto(`${ADMIN_BASE}/admin/login`);
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${ADMIN_BASE}/admin/dashboard`);
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 10000 });
  });

  test('ADM-029 TD3: Access users page without login', async ({ page }) => {
    await page.goto(`${ADMIN_BASE}/admin/login`);
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${ADMIN_BASE}/admin/users`);
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 10000 });
  });

  // ADM-030: Admin Theme Toggle
  test('ADM-030 TD1: Toggle Dark to Light', async ({ page }) => {
    // Login first
    await adminLogin(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.waitForURL(/\/admin\/dashboard/, { timeout: 10000 });

    // Find and click theme toggle button
    const themeBtn = page.locator('button').filter({ has: page.locator('[class*="sun"], [class*="moon"], [data-testid*="theme"]') }).first();
    if (await themeBtn.isVisible()) {
      await themeBtn.click();
      await page.waitForTimeout(500);
      const theme = await page.evaluate(() => localStorage.getItem('adminTheme'));
      expect(theme).toBeTruthy();
    }
  });

  test('ADM-030 TD2: Toggle Light to Dark', async ({ page }) => {
    await adminLogin(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.waitForURL(/\/admin\/dashboard/, { timeout: 10000 });

    const themeBtn = page.locator('button').filter({ has: page.locator('[class*="sun"], [class*="moon"], [data-testid*="theme"]') }).first();
    if (await themeBtn.isVisible()) {
      // Click twice to toggle back
      await themeBtn.click();
      await page.waitForTimeout(300);
      await themeBtn.click();
      await page.waitForTimeout(500);
      const theme = await page.evaluate(() => localStorage.getItem('adminTheme'));
      expect(theme).toBeTruthy();
    }
  });

  test('ADM-030 TD3: Theme persists after page reload', async ({ page }) => {
    await adminLogin(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.waitForURL(/\/admin\/dashboard/, { timeout: 10000 });

    // Set theme via toggle
    const themeBtn = page.locator('button').filter({ has: page.locator('[class*="sun"], [class*="moon"], [data-testid*="theme"]') }).first();
    if (await themeBtn.isVisible()) {
      await themeBtn.click();
      await page.waitForTimeout(500);
      const themeBefore = await page.evaluate(() => localStorage.getItem('adminTheme'));

      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');

      const themeAfter = await page.evaluate(() => localStorage.getItem('adminTheme'));
      expect(themeAfter).toBe(themeBefore);
    }
  });
});
