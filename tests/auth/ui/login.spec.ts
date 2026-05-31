import { test, expect } from '@playwright/test';

test.describe('AUTH - UI Login', () => {
  // Common test user for login (create during test or rely on existing)
  const testEmail = `login_test_${Date.now()}@wanderly.com`;
  const testPassword = 'Test@1234';

  // We need an account to test login
  test.beforeAll(async ({ request }) => {
    // Make sure API server is on 4000
    try {
      await request.post('http://127.0.0.1:4000/api/auth/register', {
        data: {
          full_name: 'Login Test User',
          email: testEmail,
          password: testPassword,
          role: 'traveler'
        }
      });
    } catch (e) {
      // Ignore if user already exists or port 4000/8000 mismatch
      console.log('Setup register failed, might already exist', e);
    }
  });

  test('Mở màn hình thành công', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h2', { hasText: 'Welcome Back' })).toBeVisible();
    await expect(page.locator('p', { hasText: 'Sign in to continue your adventure' })).toBeVisible();
  });

  test('AUTH-039: UI Login - Ẩn/Hiện mật khẩu', async ({ page }) => {
    await page.goto('/login');

    const passwordInput = page.getByPlaceholder('Password');
    
    // Type password
    await passwordInput.fill('Test@1234');
    
    // Initially should be password type
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click the toggle button
    const toggleButton = page.locator('button:has(.material-symbols-outlined:has-text("visibility"))');
    await toggleButton.click();

    // Should change to text type
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // Click again
    const toggleOffButton = page.locator('button:has(.material-symbols-outlined:has-text("visibility_off"))');
    await toggleOffButton.click();

    // Should change back to password type
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('AUTH-019/020: Login - Sai thông tin', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('Email').fill('wrong@email.com');
    await page.getByPlaceholder('Password').fill('WrongPass@123');
    
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByText('Invalid email or password')).toBeVisible();
  });

  test('AUTH-018/040: Login - Thành công và lưu Token', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('Email').fill(testEmail);
    await page.getByPlaceholder('Password').fill(testPassword);
    
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByText('Login successful')).toBeVisible();
    await expect(page).toHaveURL(/.*\/home|.*\//); // Assuming it redirects to /home or /

    // Check localStorage (AUTH-040)
    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(token).toBeTruthy();
  });

  test('AUTH-041: UI Logout - Xóa Storage', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('Email').fill(testEmail);
    await page.getByPlaceholder('Password').fill(testPassword);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/.*\/home|.*\//);

    await page.getByRole('button', { name: /Login Test User/i }).first().click();
    await page.getByRole('button', { name: /Log out/i }).click();

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);

    // Check localStorage (AUTH-041)
    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(token).toBeNull();
  });
});
