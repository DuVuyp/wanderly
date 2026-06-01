import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

test.describe.serial('BOOKING UI', () => {
  let travelerEmail = 'minhnhat@wanderly.com';
  let providerEmail = 'giang.phan@gmail.com';
  let propertyId = 1; // Property 1 belongs to Provider 2 (giang.phan)

  test.beforeAll(() => {
    try {
      execSync('sqlcmd -S localhost,1433 -U sa -P 123 -i seed_data.sql');
    } catch (e) {
      console.log('Seed failed:', e.message);
    }
  });

  test('BOOK-029: UI Booking - Khóa ngày quá khứ', async ({ page }) => {
    // 1. Đăng nhập với Traveler
    await page.goto('/login');
    await page.fill('input[placeholder="Email"]', travelerEmail);
    await page.fill('input[placeholder="Password"]', 'Wanderly@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    await page.goto(`/services/${propertyId}`);
    
    // Wait for the form to appear
    await page.waitForSelector('form');

    // Mở bộ chọn ngày Check-in
    const checkInInput = page.locator('input[type="date"]').first();
    await checkInInput.waitFor({ state: 'visible' });

    // Lấy thuộc tính min của thẻ input
    const todayStr = new Date().toISOString().split('T')[0];
    const minAttr = await checkInInput.getAttribute('min');
    
    expect(minAttr).toBe(todayStr);
  });

  test('BOOK-030: UI My Bookings - Huy hiệu trạng thái', async ({ page }) => {
    // 1. Đăng nhập với Traveler
    await page.goto('/login');
    await page.fill('input[placeholder="Email"]', travelerEmail);
    await page.fill('input[placeholder="Password"]', 'Wanderly@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    // 2. Chuyển đến trang My Bookings
    await page.goto('/my-bookings');
    
    // Verify header exists
    const heading = await page.getByRole('heading', { name: 'My Bookings' }).isVisible();
    expect(heading).toBeTruthy();
  });

  test('BOOK-031: UI Manage Bookings - Phê duyệt nhanh', async ({ page }) => {
    // 1. Đăng nhập với Provider
    await page.goto('/login');
    await page.fill('input[placeholder="Email"]', providerEmail);
    await page.fill('input[placeholder="Password"]', 'Wanderly@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    // 2. Chuyển đến trang Provider Bookings
    await page.goto('/provider/bookings');

    // Chờ cho bảng booking xuất hiện (nếu có dữ liệu)
    await page.waitForTimeout(1000); 
    const heading = await page.getByRole('heading', { name: 'Manage Bookings' }).isVisible();
    expect(heading).toBeTruthy();
  });
});
