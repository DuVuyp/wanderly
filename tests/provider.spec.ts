import { test, expect } from '@playwright/test';

test.describe('Provider Accommodation Management', () => {
  const providerEmail = 'giang.phan@gmail.com';
  const providerPassword = 'Wanderly@123';
  const dynamicSuffix = Date.now();
  const testPropertyName = `Playwright Beach Resort ${dynamicSuffix}`;
  const updatedPropertyName = `Playwright Ocean Villa ${dynamicSuffix}`;

  test.beforeEach(async ({ page }) => {
    // 1. Đăng nhập với tài khoản Provider
    await page.goto('/login');
    await page.locator('input[placeholder="Email"]').fill(providerEmail);
    await page.locator('input[placeholder="Password"]').fill(providerPassword);
    
    // Nhấp nút Sign In và đợi chuyển hướng đến /provider
    await Promise.all([
      page.waitForURL('**/provider'),
      page.locator('button[type="submit"]:has-text("Sign In")').click(),
    ]);

    // Đợi giao diện dashboard hiển thị
    await expect(page.locator('h1:has-text("Provider Dashboard")')).toBeVisible();
  });

  test('01. Hiển thị Dashboard và thống kê thành công', async ({ page }) => {
    // Kiểm tra các thẻ thống kê tổng quan
    await expect(page.locator('p:has-text("Total Properties")')).toBeVisible();
    await expect(page.locator('p:has-text("Room Categories")').first()).toBeVisible();
    await expect(page.locator('p:has-text("Available Rooms")')).toBeVisible();
  });

  test('02. Validation form Thêm cơ sở lưu trú thất bại', async ({ page }) => {
    await page.goto('/provider/properties/new');
    await expect(page.locator('h1:has-text("Add New Property")')).toBeVisible();

    // 1. Bỏ trống các trường và nhấp Save -> Kiểm tra báo lỗi bắt buộc
    await page.locator('button[type="submit"]:has-text("Save Property")').click();
    await expect(page.locator('text=Property name is required')).toBeVisible();
    await expect(page.locator('text=Address is required')).toBeVisible();

    // 2. Nhập tên quá 100 ký tự
    const longName = 'a'.repeat(101);
    await page.locator('input[name="name"]').fill(longName);
    await page.locator('button[type="submit"]:has-text("Save Property")').click();
    await expect(page.locator('text=Property name cannot exceed 100 characters')).toBeVisible();

    // 3. Nhập Latitude và Longitude sai phạm vi
    await page.locator('input[name="latitude"]').fill('95');
    await page.locator('input[name="longitude"]').fill('-190');
    await page.locator('button[type="submit"]:has-text("Save Property")').click();
    await expect(page.locator('text=Latitude must be between -90 and 90')).toBeVisible();
    await expect(page.locator('text=Longitude must be between -180 and 180')).toBeVisible();
  });

  test('03. Thêm mới, Cập nhật và Xóa cơ sở lưu trú thành công', async ({ page }) => {
    // ---- PHẦN A: THÊM MỚI PROPERTY ----
    await page.goto('/provider/properties/new');
    
    // Điền thông tin hợp lệ
    await page.locator('input[name="name"]').fill(testPropertyName);
    await page.locator('select[name="property_type"]').selectOption('resort');
    await page.locator('textarea[name="address"]').fill('123 Vo Nguyen Giap, Da Nang');
    await page.locator('input[name="latitude"]').fill('16.06');
    await page.locator('input[name="longitude"]').fill('108.24');
    await page.locator('input[name="check_in_time"]').fill('14:00');
    await page.locator('input[name="check_out_time"]').fill('12:00');

    // Lưu Property và đợi điều hướng về dashboard
    await Promise.all([
      page.waitForURL('**/provider'),
      page.locator('button[type="submit"]:has-text("Save Property")').click(),
    ]);

    // Kiểm tra Property mới đã xuất hiện trên dashboard
    const newPropertyCard = page.locator(`h2:has-text("${testPropertyName}")`);
    await expect(newPropertyCard).toBeVisible();

    // Nhấp vào nút Edit của Property vừa tạo
    const editButton = page.locator(`div:has(h2:has-text("${testPropertyName}")) >> xpath=ancestor::div[contains(@class, "rounded")] >> a[title="Edit property details"]`);
    await editButton.click();

    // Đợi form Edit load thành công
    await expect(page.locator('h1:has-text("Edit Property")')).toBeVisible();
    
    // Thay đổi tên và loại cơ sở lưu trú
    await page.locator('input[name="name"]').fill(updatedPropertyName);
    await page.locator('select[name="property_type"]').selectOption('villa');

    // Lưu thông tin cập nhật
    await Promise.all([
      page.waitForURL('**/provider'),
      page.locator('button[type="submit"]:has-text("Save Property")').click(),
    ]);

    // Kiểm tra thông tin cập nhật đã hiển thị trên dashboard
    const updatedPropertyCard = page.locator(`h2:has-text("${updatedPropertyName}")`);
    await expect(updatedPropertyCard).toBeVisible();

    // ---- PHẦN C: XÓA PROPERTY ----
    // Nhấp nút Delete trên dashboard
    const deleteButton = page.locator(`div:has(h2:has-text("${updatedPropertyName}")) >> xpath=ancestor::div[contains(@class, "rounded")] >> button[title="Delete property"]`);
    
    // Lắng nghe hộp thoại confirm và đồng ý xóa
    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Are you sure you want to delete');
      await dialog.accept();
    });

    await deleteButton.click();
    
    // Đợi Property bị xóa biến mất khỏi danh sách
    await expect(updatedPropertyCard).not.toBeVisible();
  });

  test('04. Quản lý Loại phòng & Phòng vật lý thành công', async ({ page }) => {
    // 1. Tạo một Property tạm thời để thực hiện test loại phòng
    const helperPropertyName = `Helper Test Hotel ${dynamicSuffix}`;
    await page.goto('/provider/properties/new');
    await page.locator('input[name="name"]').fill(helperPropertyName);
    await page.locator('textarea[name="address"]').fill('123 Tran Phu, Nha Trang');
    await page.locator('input[name="latitude"]').fill('12.25');
    await page.locator('input[name="longitude"]').fill('109.19');
    await page.locator('button[type="submit"]:has-text("Save Property")').click();

    // Nhấp vào "Manage Rooms" để chuyển đến trang chi tiết
    const manageRoomsLink = page.locator(`div:has(h2:has-text("${helperPropertyName}")) >> xpath=ancestor::div[contains(@class, "rounded")] >> a:has-text("Manage Rooms")`);
    await manageRoomsLink.click();
    await page.waitForURL(/\/provider\/properties\/\d+/);
    await expect(page.locator('h2:has-text("Room Inventory")')).toBeVisible();

    // 2. Validation form Thêm loại phòng thất bại
    await page.locator('button:has-text("Add Room Type")').click();
    await page.locator('button[type="submit"]:has-text("Save Room Type")').click();
    await expect(page.locator('text=Name is required')).toBeVisible();
    await expect(page.locator('text=Base price must be greater than 0')).toBeVisible();

    // 3. Tạo Loại phòng Deluxe Suite hợp lệ
    await page.locator('input[placeholder="e.g. Deluxe Double Room"]').fill('Deluxe Suite');
    await page.locator('input[type="number"][min="1"]').fill('4'); // Max guests
    await page.locator('input[placeholder="e.g. 500000"]').fill('1500000'); // Base price
    await page.locator('input[placeholder="Wifi, AC, Bath, Mini-bar"]').fill('Wifi, Air Conditioning, Private Pool');
    
    await page.locator('button[type="submit"]:has-text("Save Room Type")').click();
    await expect(page.locator('h3:has-text("Deluxe Suite")')).toBeVisible();

    // 4. Thêm Phòng vật lý thất bại (Validation số phòng)
    await page.getByRole('button', { name: 'Add Room', exact: true }).click();
    
    // Nhập số phòng chứa chữ cái
    await page.locator('input[placeholder="Room Number (e.g. 101, 102)"]').fill('10A');
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await expect(page.locator('text=Room number must be digits only and maximum 3 characters')).toBeVisible();

    // 5. Thêm Phòng vật lý thành công (Phòng 101)
    await page.locator('input[placeholder="Room Number (e.g. 101, 102)"]').fill('101');
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await expect(page.locator('p:has-text("101")')).toBeVisible();

    // 6. Thay đổi trạng thái phòng vật lý (Available -> Maintenance)
    const statusButton = page.locator('button:has-text("Available")');
    await statusButton.click();
    await expect(page.locator('span:has-text("Maintenance")')).toBeVisible();

    // 7. Xóa phòng vật lý thành công
    const roomCard = page.locator('div.group').filter({ hasText: '101' }).first();
    
    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Are you sure you want to delete room');
      await dialog.accept();
    });

    // Hover để nút delete phòng xuất hiện và click
    await roomCard.hover();
    await roomCard.locator('button[title="Delete room"]').click();

    // Kiểm tra phòng đã bị xóa
    await expect(page.locator('p:has-text("101")')).not.toBeVisible();

    // ---- DỌN DẸP: XÓA PROPERTY TẠM THỜI SAU KHI TEST ----
    await page.goto('/provider');
    const helperPropertyDeleteBtn = page.locator(`div:has(h2:has-text("${helperPropertyName}")) >> xpath=ancestor::div[contains(@class, "rounded")] >> button[title="Delete property"]`);
    
    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });

    await helperPropertyDeleteBtn.click();
    await expect(page.locator(`h2:has-text("${helperPropertyName}")`)).not.toBeVisible();
  });
});
