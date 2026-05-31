import { test, expect } from '@playwright/test';

test('Trang login load thành công', async ({ page }) => {
  await page.goto('/login');
  await expect(page.locator('body')).toBeVisible();
  console.log('✅ BaseURL & Playwright hoạt động bình thường');
});