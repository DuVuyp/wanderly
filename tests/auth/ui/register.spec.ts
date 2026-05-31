import { test, expect } from '@playwright/test';

test.describe('AUTH - UI Register', () => {
  test('Mở màn hình thành công', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('h1', { hasText: 'Discover the World' })).toBeVisible();
    await expect(page.locator('h2', { hasText: 'Create Your Account' })).toBeVisible();
  });

  test('AUTH-038: UI Register - Validate lỗi hiển thị', async ({ page }) => {
    await page.goto('/register');

    // Submit form empty
    await page.getByRole('button', { name: 'Begin My Journey' }).click();

    // Check validation messages
    await expect(page.getByText('Full name is required')).toBeVisible();
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Password is required', { exact: true })).toBeVisible();
  });

  test('AUTH-042: UI Register - Validate realtime', async ({ page }) => {
    await page.goto('/register');

    const emailInput = page.getByPlaceholder('Email Address');
    
    // Type invalid email
    await emailInput.fill('abc');
    await emailInput.blur();
    await expect(page.getByText('Email must be a valid email address')).toBeVisible();

    // Type valid email
    await emailInput.fill('abc@test.com');
    await expect(page.getByText('Email must be a valid email address')).not.toBeVisible();
  });

  test('AUTH-039: UI Register - Ẩn/Hiện mật khẩu', async ({ page }) => {
    await page.goto('/register');

    const passwordInput = page.getByPlaceholder('Password', { exact: true });
    
    // Type password
    await passwordInput.fill('Test@1234');
    
    // Initially should be password type
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click the toggle button (first button in the relative container)
    // Using nth(0) for password, nth(1) for confirm password
    const toggleButtons = page.locator('button:has(.material-symbols-outlined:has-text("visibility"))');
    await toggleButtons.nth(0).click();

    // Should change to text type
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // Click again
    const toggleOffButtons = page.locator('button:has(.material-symbols-outlined:has-text("visibility_off"))');
    await toggleOffButtons.nth(0).click();

    // Should change back to password type
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('AUTH-001: Register - Valid (Traveler)', async ({ page }) => {
    await page.goto('/register');

    const uniqueEmail = `testuser_${Date.now()}@wanderly.com`;

    await page.getByPlaceholder('Full Name').fill('Nguyen Van A');
    await page.getByPlaceholder('Email Address').fill(uniqueEmail);
    await page.getByPlaceholder('Password', { exact: true }).fill('Test@1234');
    await page.getByPlaceholder('Confirm Password').fill('Test@1234');
    
    // Check Terms
    await page.locator('input[type="checkbox"]').check();

    // Submit
    await page.getByRole('button', { name: 'Begin My Journey' }).click();

    // Check success toast and redirect
    await expect(page.getByText(/User registered successfully|Registration successful/)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });
});
