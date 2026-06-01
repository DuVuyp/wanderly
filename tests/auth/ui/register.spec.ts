import { test, expect } from '@playwright/test';

test.describe('AUTH - UI Register', () => {
  test('AUTH-038: UI Register - Validate lỗi hiển thị', async ({ page }) => {
    // TD1: Để trống tất cả
    await page.goto('/register');
    await page.getByRole('button', { name: 'Begin My Journey' }).click();
    await expect(page.getByText('Full name is required')).toBeVisible();
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Password is required', { exact: true })).toBeVisible();

    // TD2: Chỉ điền email
    await page.goto('/register');
    await page.getByPlaceholder('Email Address').fill('test@test.com');
    await page.getByRole('button', { name: 'Begin My Journey' }).click();
    await expect(page.getByText('Full name is required')).toBeVisible();
    await expect(page.getByText('Password is required', { exact: true })).toBeVisible();

    // TD3: Chỉ điền password
    await page.goto('/register');
    await page.getByPlaceholder('Password', { exact: true }).fill('Test@1234');
    await page.getByRole('button', { name: 'Begin My Journey' }).click();
    await expect(page.getByText('Full name is required')).toBeVisible();
    await expect(page.getByText('Email is required')).toBeVisible();
  });

  test('AUTH-042: UI Register - Validate realtime', async ({ page }) => {
    await page.goto('/register');
    const emailInput = page.getByPlaceholder('Email Address');
    
    // TD1: Gõ "abc" -> lỗi email
    await emailInput.fill('abc');
    await emailInput.blur();
    await expect(page.getByText('Email must be a valid email address')).toBeVisible();

    // TD2: Gõ "abc@" -> vẫn lỗi
    await emailInput.fill('abc@');
    await emailInput.blur();
    await expect(page.getByText('Email must be a valid email address')).toBeVisible();

    // TD3: Gõ "abc@test.com" -> lỗi biến mất
    await emailInput.fill('abc@test.com');
    await emailInput.blur();
    await expect(page.getByText('Email must be a valid email address')).not.toBeVisible();
  });

  test('AUTH-039: UI Register - Ẩn/Hiện mật khẩu', async ({ page }) => {
    // Note: AUTH-039 is technically for Login but applied here to Register as well
    await page.goto('/register');
    const passwordInput = page.getByPlaceholder('Password', { exact: true });
    
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

    // TD2: click 2 lần (ẩn -> hiện -> ẩn)
    await passwordInput.fill('Test@12345');
    await toggleHidden();
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // TD3: pass siêu dài
    await passwordInput.fill('P@ssw0rdaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    await toggleVisible();
    await expect(passwordInput).toHaveAttribute('type', 'text');
  });
});
