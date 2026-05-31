# Quy trình tạo test cho từng module (mẫu chung)

Tài liệu này hướng dẫn từng bước để tạo test cho bất kỳ module nào trong dự án, từ việc đặt tên thư mục, viết file test, chạy test, đến cách debug. Bạn chỉ cần đổi tên module và thông tin tùy chỉnh theo nhu cầu.

## 1) Chuẩn bị môi trường

1. Mở terminal tại thư mục root dự án (nơi có `playwright.config.ts`).
2. Cài đặt dependency (chỉ cần làm 1 lần):
   - `npm i` (ở root wanderly/)
3. Đảm bảo ứng dụng cần test đang chạy (client/server tùy theo loại test):
  - UI test: cần chạy giao diện (client).

## 2) Xác định module và loại test

### 2.1 Chọn module

Module là nhóm chức năng/feature. Ví dụ:
- `auth`: đăng nhập, đăng ký
- `booking`: đặt phòng, xem đặt phòng
- `property`: tạo/sửa danh sách chỗ ở
- `room`: phòng, loại phòng
- `profile`: thông tin cá nhân

### 2.2 Chọn loại test

- `ui`: test giao diện với Playwright (page, click, expect)
- `integration`: test API backend với Jest và Supertest (gửi request, kiểm tra response)

## 3) Cấu trúc thư mục (bắt buộc)

Dùng chung một cấu trúc cho tất cả module:

```
tests/
  <module>/
    ui/
    integration/
```

Ví dụ nếu tạo test cho module `auth`:

```
tests/
  auth/
    ui/
    integration/
```

## 4) Đặt tên file test

Quy ước đặt tên:
- UI test: `<ten-tinh-nang>.spec.ts` (ví dụ: `tests/auth/ui/login.spec.ts`)
- API test: `<ten-api>.test.js` hoặc `<ten-api>.test.ts` (ví dụ: `tests/auth/integration/login.test.js`)
- Tên tính năng viết thường, có gạch ngang nếu cần.

## 5) Tạo file và viết code (mẫu chung)

### 5.1 Mẫu file UI test (bắt buộc có)

Tạo file: `tests/<module>/ui/<feature>.spec.ts`

```ts
import { test, expect } from '@playwright/test';

test.describe('<MODULE> - <FEATURE>', () => {
  test('Mở màn hình thành công', async ({ page }) => {
    await page.goto('/<route>');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Hành vi chính', async ({ page }) => {
    await page.goto('/<route>');

    // 1) Nhập dữ liệu
    await page.getByLabel('<LABEL>').fill('<VALUE>');

    // 2) Hành động
    await page.getByRole('button', { name: '<BUTTON_TEXT>' }).click();

    // 3) Kiểm tra kết quả
    await expect(page.getByText('<EXPECTED_TEXT>')).toBeVisible();
  });
});
```

Ghi chú:
- `<route>` là route tương ứng (ví dụ: `/login`).
- Ưu tiên `getByRole`, `getByLabel`, `getByText` để test ổn định.

### 5.2 Mẫu file API test (Integration test)

Tạo file: `tests/<module>/integration/<feature>.test.js`

```javascript
const request = require('supertest');
const app = require('../../../server/src/index'); // Đảm bảo server export 'app'

describe('<MODULE> API - <FEATURE>', () => {
  it('Nên trả về 200 khi gọi thành công', async () => {
    const response = await request(app)
      .post('/api/<route>')
      .send({ key: 'value' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });
});
```

Ghi chú:
- API test được chạy bằng Jest, gọi HTTP request trực tiếp vào backend qua Supertest.

## 6) Quy trình tạo test cho module mới (từng bước)

Ví dụ module `booking` (UI test):

1. Tạo thư mục:
   - `tests/booking/ui/`
2. Tạo file:
   - `tests/booking/ui/create-booking.spec.ts`
3. Viết test theo mẫu:
   - Mở `/booking`
   - Nhập form đặt phòng
   - Bấm nút đặt phòng
   - Kiểm tra thông báo thành công
4. Chạy test (ở root):
   - `npx playwright test tests/booking/ui/create-booking.spec.ts --headed`
5. Nếu fail, đọc log, thêm `console.log`, hoặc chạy `--debug`.

## 7) Chạy test (lệnh thông dụng)

### UI Test (Playwright)
Chạy 1 file:
- `npx playwright test tests/<module>/ui/<feature>.spec.ts --headed`

Chạy 1 thư mục:
- `npx playwright test tests/<module>/ui`

Chạy tất cả UI test:
- `npx playwright test`

Đổi base URL (nếu cần):
- Windows PowerShell: `$env:BASE_URL="http://localhost:5173"; npx playwright test ...`
- Bash: `BASE_URL=http://localhost:5173 npx playwright test ...`

### API Test (Jest)
Mở terminal ở thư mục `server/`:
- `cd server`

Chạy tất cả API test:
- `npm run test` (hoặc `npx jest`)

Chạy 1 file API test cụ thể:
- `npx jest ../tests/<module>/integration/<feature>.test.js`

## 8) Quy ước dữ liệu test

- Mỗi test tự tạo dữ liệu riêng (không phụ thuộc test khác).
- Dữ liệu có thể dùng timestamp để tránh trùng:
  - Email ví dụ: `user+<timestamp>@example.com`
- Nếu có API xóa, xóa dữ liệu sau khi test xong (cleanup).

## 9) Debug nhanh

- `--headed`: xem trình duyệt chạy
- `--debug`: tạm dừng từng bước
- `--trace on`: ghi trace để xem lại

Ví dụ:
- `npx playwright test tests/auth/ui/login.spec.ts --headed --debug`

## 10) Checklist trước khi hoàn thành

- Đã đúng thư mục: `tests/<module>/ui/`
- File có đuôi `.spec.ts`
- Test độc lập, không phụ thuộc test khác
- Đã chạy được 1 lần và pass
- Có xác nhận kết quả bằng `expect(...)`

## 11) Ví dụ có sẵn trong dự án

- `tests/auth/ui/setup.spec.ts`

Bạn có thể copy file này và đổi route/selector để tạo test mới nhanh.
