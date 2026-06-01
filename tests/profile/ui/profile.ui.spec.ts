import { test, expect } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:4000/api';

test.describe.serial('PROFILE UI', () => {
  const getTimestamp = () => Date.now().toString();
  let testEmail = '';
  const testPassword = 'Test@1234';

  test.beforeAll(async ({ request }) => {
    const ts = getTimestamp();
    testEmail = `profile_ui_${ts}@wanderly.com`;
    // Register user for UI tests
    await request.post(`${API_BASE}/auth/register`, {
      data: { full_name: 'UI Test Profile', email: testEmail, password: testPassword, role: 'traveler' }
    });
  });

  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.getByPlaceholder('Email').fill(testEmail);
    await page.getByPlaceholder('Password').fill(testPassword);
    
    // We expect successful login
    await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/auth/login') && resp.status() === 200),
      page.getByRole('button', { name: 'Sign In' }).click()
    ]);
    
    // Ensure login finishes
    await expect(page).not.toHaveURL(/\/login/);
    await page.goto('/profile');
    await expect(page.getByRole('heading', { name: 'Basic Information' })).toBeVisible();
  });

  test('PROF-025: UI Profile - Preview avatar', async ({ page }) => {
    const testData = [
      { name: 'test1.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake-img-1') },
      { name: 'test2.png', mimeType: 'image/png', buffer: Buffer.from('fake-img-2') },
      { name: 'test3.webp', mimeType: 'image/webp', buffer: Buffer.from('fake-img-3') }
    ];

    for (const td of testData) {
      // Refresh page to reset preview
      await page.reload();
      await expect(page.getByRole('heading', { name: 'Basic Information' })).toBeVisible();
      await page.getByRole('button', { name: 'Edit Account' }).click();
      
      const fileChooserPromise = page.waitForEvent('filechooser');
      await page.locator('label:has(svg.lucide-camera)').click();
      const fileChooser = await fileChooserPromise;
      
      await fileChooser.setFiles(td);

      // Verify preview src changes to blob URL
      const img = page.locator('img[alt="Avatar preview"]');
      await expect(img).toHaveAttribute('src', /^blob:/);
    }
  });

  test('PROF-026: UI Change Password - Confirm mismatch', async ({ page }) => {
    const testData = [
      { old: testPassword, new: 'NewPass@5678', confirm: 'DifferentPass@123' },
      { old: testPassword, new: 'Abcd@5678', confirm: 'Abcd@5679' },
      { old: testPassword, new: 'Xyz@1234', confirm: 'xyz@1234' }
    ];

    await page.getByRole('button', { name: 'Security' }).click();
    await expect(page.getByRole('heading', { name: 'Change Password' })).toBeVisible();

    for (const td of testData) {
      await page.locator('input[name="oldPassword"]').fill(td.old);
      await page.locator('input[name="newPassword"]').fill(td.new);
      await page.locator('input[name="confirmPassword"]').fill(td.confirm);
      
      await page.getByRole('button', { name: 'Update Password' }).click();
      
      // Expect error message
      await expect(page.getByText("Passwords don't match")).toBeVisible();
      
      // Clear inputs for next iteration
      await page.locator('input[name="oldPassword"]').clear();
      await page.locator('input[name="newPassword"]').clear();
      await page.locator('input[name="confirmPassword"]').clear();
    }
  });

  test('PROF-027: Ngoại lệ - Offline mode', async ({ page }) => {
    const testData = [
      { full_name: 'Update 1' },
      { full_name: 'Update 2' },
      { full_name: 'Update 3' }
    ];

    for (const td of testData) {
      await page.reload();
      await expect(page.getByRole('heading', { name: 'Basic Information' })).toBeVisible();
      await page.getByRole('button', { name: 'Edit Account' }).click();
      await page.locator('input[name="full_name"]').fill(td.full_name);
      
      // Intercept profile update to simulate network failure
      await page.route('**/api/profile', route => route.abort('failed'));
      
      await page.getByRole('button', { name: 'Save Changes' }).click();
      
      await expect(page.getByText(/Failed to update profile|Network Error|Network Error/i)).toBeVisible();
      await page.unroute('**/api/profile');
    }
  });

  test('PROF-028: Ngoại lệ - Upload error (Cloudinary)', async ({ page }) => {
    const testData = [
      { name: 'fail1.jpg', mimeType: 'image/jpeg' },
      { name: 'fail2.png', mimeType: 'image/png' },
      { name: 'fail3.webp', mimeType: 'image/webp' }
    ];

    for (const td of testData) {
      await page.reload();
      await expect(page.getByRole('heading', { name: 'Basic Information' })).toBeVisible();
      await page.getByRole('button', { name: 'Edit Account' }).click();
      
      const fileChooserPromise = page.waitForEvent('filechooser');
      await page.locator('label:has(svg.lucide-camera)').click();
      const fileChooser = await fileChooserPromise;
      
      await fileChooser.setFiles({
        ...td,
        buffer: Buffer.from('fake-image-content')
      });

      // Mock upload API to return 500
      await page.route('**/api/upload', route => route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Cloudinary upload failed' })
      }));

      await page.getByRole('button', { name: 'Save Changes' }).click();
      await expect(page.getByText('Cloudinary upload failed')).toBeVisible();
      await page.unroute('**/api/upload');
    }
  });
});
