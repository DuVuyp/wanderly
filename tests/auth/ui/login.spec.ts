import { test, expect } from '@playwright/test';

test.describe('AUTH - UI Login', () => {
  const getTimestamp = () => Date.now().toString();
  let travelerEmail = '';
  let providerEmail = '';

  test.beforeAll(async ({ request }) => {
    const ts = getTimestamp();
    travelerEmail = `ui_traveler_${ts}@wanderly.com`;
    providerEmail = `ui_provider_${ts}@wanderly.com`;

    try {
      await request.post('http://127.0.0.1:4000/api/auth/register', {
        data: { full_name: 'UI Traveler', email: travelerEmail, password: 'Test@1234', role: 'traveler' }
      });
      await request.post('http://127.0.0.1:4000/api/auth/register', {
        data: { full_name: 'UI Provider', email: providerEmail, password: 'Test@1234', role: 'provider' }
      });
    } catch (e) {
      console.log('Setup register failed');
    }
  });

  test('AUTH-039: UI Login - Ẩn/Hiện mật khẩu', async ({ page }) => {
    await page.goto('/login');
    const passwordInput = page.getByPlaceholder('Password');

    const toggleVisible = async () => {
      const btn = page.locator('button:has(.material-symbols-outlined:has-text("visibility"))').nth(0);
      if (await btn.isVisible()) await btn.click();
    };
    const toggleHidden = async () => {
      const btn = page.locator('button:has(.material-symbols-outlined:has-text("visibility_off"))').nth(0);
      if (await btn.isVisible()) await btn.click();
    };

    // TD1: click 1 lần
    await passwordInput.fill('Test@1234');
    await toggleVisible();
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // TD2: click 2 lần
    await passwordInput.fill('Abcd@5678');
    await toggleHidden();
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // TD3: pass siêu dài
    await passwordInput.fill('P@ssw0rdaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    await toggleVisible();
    await expect(passwordInput).toHaveAttribute('type', 'text');
  });

  test('AUTH-040: UI Login - Lưu Token & điều hướng', async ({ page }) => {
    // TD1: Traveler -> redirect /
    await page.goto('/login');
    await page.getByPlaceholder('Email').fill(travelerEmail);
    await page.getByPlaceholder('Password').fill('Test@1234');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).not.toHaveURL(/\/login/);
    let token = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(token).toBeTruthy();

    // Logout to prepare for TD2
    await page.evaluate(() => localStorage.clear());

    // TD2: Provider -> redirect /
    await page.goto('/login');
    await page.getByPlaceholder('Email').fill(providerEmail);
    await page.getByPlaceholder('Password').fill('Test@1234');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).not.toHaveURL(/\/login/);
    token = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(token).toBeTruthy();

    // Logout to prepare for TD3
    await page.evaluate(() => localStorage.clear());

    // TD3: Traveler (simulate redirect back)
    await page.goto('/login');
    await page.getByPlaceholder('Email').fill(travelerEmail);
    await page.getByPlaceholder('Password').fill('Test@1234');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('AUTH-041: UI Logout - Xóa Storage', async ({ page }) => {
    // TD1: Logout from Home
    await page.goto('/login');
    await page.getByPlaceholder('Email').fill(travelerEmail);
    await page.getByPlaceholder('Password').fill('Test@1234');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Wait for the login signal to complete (button changes to user profile)
    await expect(page.getByRole('button', { name: /UI Traveler|Log out/i }).first()).toBeVisible();
    
    await page.getByRole('button', { name: /UI Traveler/i }).first().click();
    await page.getByRole('button', { name: /Log out/i }).click();
    await expect(page).toHaveURL(/\/login/);
    let token = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(token).toBeNull();

    // TD2: Logout from Profile
    await page.goto('/login');
    await page.getByPlaceholder('Email').fill(travelerEmail);
    await page.getByPlaceholder('Password').fill('Test@1234');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Wait for login
    await expect(page.getByRole('button', { name: /UI Traveler|Log out/i }).first()).toBeVisible();
    await page.goto('/profile');
    // Ensure profile is loaded by looking for an element
    await expect(page.getByRole('heading', { name: /Basic Information/i })).toBeVisible();

    await page.getByRole('button', { name: /Log Out/i }).first().click();
    await expect(page).toHaveURL(/\/login/);
    token = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(token).toBeNull();

    // TD3: Another logout simulation
    await page.goto('/login');
    await page.getByPlaceholder('Email').fill(providerEmail);
    await page.getByPlaceholder('Password').fill('Test@1234');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Wait for login
    await expect(page.getByRole('button', { name: /UI Provider|Log out/i }).first()).toBeVisible();
    await page.getByRole('button', { name: /UI Provider/i }).first().click();
    await page.getByRole('button', { name: /Log out/i }).click();
    await expect(page).toHaveURL(/\/login/);
    token = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(token).toBeNull();
  });
});
