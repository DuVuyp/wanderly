import { test, expect } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:4000/api';

test.describe.serial('PROFILE UI', () => {
  const testEmail = `profile_ui_${Date.now()}@wanderly.com`;
  const testPassword = 'Test@1234';

  test.beforeAll(async ({ request }) => {
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
    await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/auth/login') && resp.status() === 200),
      page.getByRole('button', { name: 'Sign In' }).click()
    ]);
    
    // Go to profile
    await page.goto('/profile');
    await expect(page.getByRole('heading', { name: 'Basic Information' })).toBeVisible();
  });

  test('PROF-025: UI Profile - Preview avatar', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit Account' }).click();
    
    // Setup file chooser intercept
    const fileChooserPromise = page.waitForEvent('filechooser');
    // Click the avatar camera icon
    // The camera icon is inside a label that is a sibling of the img
    await page.locator('label:has(svg.lucide-camera)').click();
    
    const fileChooser = await fileChooserPromise;
    
    // Create a dummy image file in memory or use a local one.
    // Playwright allows setting buffer as file
    await fileChooser.setFiles({
      name: 'test-avatar.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-content') // This might not display correctly as image, but the URL.createObjectURL will generate a blob URL
    });

    // Verify preview src changes to blob URL
    const img = page.locator('img[alt="Avatar preview"]');
    await expect(img).toHaveAttribute('src', /^blob:/);
  });

  test('PROF-026: UI Change Password - Confirm mismatch', async ({ page }) => {
    // Go to Security tab
    await page.getByRole('button', { name: 'Security' }).click();
    await expect(page.getByRole('heading', { name: 'Change Password' })).toBeVisible();

    await page.locator('input[name="oldPassword"]').fill(testPassword);
    await page.locator('input[name="newPassword"]').fill('NewPass@5678');
    await page.locator('input[name="confirmPassword"]').fill('DifferentPass@123');
    
    await page.getByRole('button', { name: 'Update Password' }).click();
    
    // Expect error message
    await expect(page.getByText("Passwords don't match")).toBeVisible();
  });

  test('PROF-027: Ngoại lệ - Offline mode', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit Account' }).click();
    await page.locator('input[name="full_name"]').fill('Updated Name');
    
    // Intercept profile update to simulate network failure
    await page.route('**/api/profile', route => route.abort('failed'));
    
    await page.getByRole('button', { name: 'Save Changes' }).click();
    
    // React Query / Axios should show a failed toast message
    // Since network error often translates to "Network Error" or "Failed to fetch"
    await expect(page.getByText(/Failed to update profile|Network Error|Network Error/i)).toBeVisible();
  });

  test('PROF-028: Ngoại lệ - Upload error (Cloudinary)', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit Account' }).click();
    
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('label:has(svg.lucide-camera)').click();
    const fileChooser = await fileChooserPromise;
    
    await fileChooser.setFiles({
      name: 'test-avatar.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-content')
    });

    // Mock upload API to return 500
    await page.route('**/api/upload', route => route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Cloudinary upload failed' })
    }));

    await page.getByRole('button', { name: 'Save Changes' }).click();

    // Expect error toast
    await expect(page.getByText('Cloudinary upload failed')).toBeVisible();
  });
});
