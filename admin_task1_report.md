# 📋 Báo Cáo Hoàn Thành Task 1 - Thành Viên 4 (Admin)

Báo cáo chi tiết các công việc đã thực hiện trong **Task 1: Backend API Users (Admin)** của Phân hệ Quản trị hệ thống (Admin Panel) dự án **Wanderly**.

---

## 1. Kết Quả Triển Khai Backend

Các file đã chỉnh sửa và tạo mới trên Backend (`server/`):
*   **Service:** `server/src/services/userService.js`
*   **Controller:** `server/src/controllers/userController.js`
*   **Routes:** `server/src/routes/userRoutes.js`
*   **Validation:** `server/src/validations/userValidation.js`
*   **Main Entry:** `server/src/index.js` (Đã đăng ký route `/api/users`)

---

## 2. Chi Tiết Các API Đã Viết

Tất cả các API dưới đây đều được bảo vệ nghiêm ngặt bằng Middleware xác thực, yêu cầu quyền **Admin** (`auth(USER_ROLES.ADMIN)`).

### 2.1. GET `/api/users` (Lấy danh sách người dùng)
*   **Mô tả:** Lấy danh sách toàn bộ người dùng trong hệ thống (đã lọc các user bị xóa mềm).
*   **Tính năng bổ sung:**
    *   **Phân trang:** Nhận query params `page` (mặc định: `1`) và `limit` (mặc định: `10`).
    *   **Lọc theo vai trò:** Query param `role` (`traveler` / `provider` / `admin`).
    *   **Tìm kiếm:** Query param `search` (tìm kiếm không phân biệt chữ hoa thường theo `email` hoặc `full_name`).
    *   **Hỗ trợ Legacy Data:** Truy vấn lọc theo `{ is_deleted: { not: true } }` để đảm bảo lấy được cả các user cũ có giá trị `is_deleted = NULL` (không bị ẩn mất dữ liệu).
*   **Bảo mật:** Dữ liệu trả về đi qua hàm `sanitizeUser` để loại bỏ `password_hash`.

### 2.2. GET `/api/users/:id` (Xem chi tiết một người dùng)
*   **Mô tả:** Xem chi tiết một user theo ID.
*   **Logic xóa mềm:** Nếu user có `is_deleted = true`, API sẽ trả về lỗi `404 Not Found` (như thể user không tồn tại).

### 2.3. PUT `/api/users/:id/role` (Thay đổi vai trò người dùng)
*   **Mô tả:** Thay đổi vai trò của người dùng (giữa `traveler`, `provider`, `admin`).
*   **Validation:** Áp dụng Joi Schema (`updateUserRoleSchema`) để validate đầu vào:
    *   Giá trị `role` truyền lên bắt buộc phải nằm trong hằng số `USER_ROLES`.
    *   Tránh được việc truyền sai case (ví dụ: chữ hoa `"Provider"`) dẫn đến lỗi vi phạm check constraint của cơ sở dữ liệu.
*   **Logic xóa mềm:** Chặn không cho phép sửa đổi vai trò của user đã bị xóa mềm (trả về `404 Not Found`).

### 2.4. DELETE `/api/users/:id` (Xóa người dùng)
*   **Mô tả:** Thực hiện **Xóa mềm (Soft Delete)** người dùng ra khỏi hệ thống.
*   **Logic triển khai:** 
    *   Thay vì dùng `prisma.users.delete` (xóa cứng vật lý), hệ thống sử dụng `prisma.users.update` để thiết lập cột `is_deleted: true`.
    *   Ngăn chặn việc xóa lặp lại (nếu user đã bị xóa mềm, trả về `404 Not Found`).

---

## 3. Thay Đổi Cấu Trúc Cơ Sở Dữ Liệu (Database Schema)

Để phục vụ tính năng Xóa mềm, cấu trúc bảng đã được cập nhật:
*   **Prisma schema (`server/prisma/schema.prisma`):**
    Thêm trường `is_deleted` kiểu `Boolean?` mặc định là `false` vào model `Users`.
*   **SQL initialization file (`wanderly.sql`):**
    Cập nhật câu lệnh khởi tạo bảng `Users`, bổ sung cột:
    ```sql
    is_deleted BIT DEFAULT 0
    ```

---

## 4. Hướng Dẫn Quy Trình Kiểm Thử (Testing Guide)

Quy trình test 4 API theo thứ tự kịch bản chuẩn trên Postman:

1.  **Đăng nhập Admin để lấy Token:** 
    *   Gửi request `POST /api/auth/login`. Copy `accessToken` nhận được và dán vào tab **Authorization** -> **Bearer Token** cho các request tiếp theo.
2.  **Lấy danh sách ban đầu:**
    *   Gửi request `GET /api/users`.
    *   *Kỳ vọng:* Trả về danh sách gồm các user hiện tại (kể cả data cũ có `is_deleted = NULL` và data mới có `is_deleted = false`).
3.  **Thay đổi Role của một User:**
    *   Gửi request `PUT /api/users/<id>/role` với body: `{ "role": "provider" }`.
    *   *Kỳ vọng:* Cập nhật thành công (Status 200).
    *   *Test lỗi:* Thử gửi `{ "role": "invalid_role" }` -> Hệ thống trả về `400 Bad Request`.
4.  **Xóa mềm User:**
    *   Gửi request `DELETE /api/users/<id>`.
    *   *Kỳ vọng:* Xóa thành công (Status 200). Trường `is_deleted` của user đó trong Database chuyển sang `1` (true).
5.  **Xác nhận hiệu quả Xóa mềm:**
    *   Gọi lại `GET /api/users/<id>` -> Trả về `404 Not Found`.
    *   Gọi lại `PUT /api/users/<id>/role` -> Trả về `404 Not Found`.
    *   Gọi lại `DELETE /api/users/<id>` -> Trả về `404 Not Found`.
    *   Gọi lại `GET /api/users` -> Kiểm tra danh sách tổng, user đó đã biến mất hoàn toàn.

---

## 5. Kết Quả Triển Khai Frontend Admin (Đồng bộ & Tối ưu UI/UX)

Các cải tiến và sửa lỗi trên giao diện Admin (`admin/`):

### 5.1. Đồng bộ hóa API & Sửa lỗi Đăng nhập
*   **Sửa Endpoint Đăng nhập:** Thay đổi endpoint gọi API từ `/api/auths/admin/login` (không tồn tại) về đúng `/api/auth/login` của Backend.
*   **Mapping Dữ liệu:** Định cấu hình lại parser để đọc đúng cấu trúc phản hồi `{ user, tokens }` từ `res.data.data`. Áp dụng thuộc tính `full_name`, `email`, và `role` để lưu trữ thông tin phiên đăng nhập một cách chính xác.
*   **Phân quyền chặt chẽ:** Chỉ cho phép tài khoản có `role: 'admin'` truy cập vào trang quản trị.

### 5.2. Giải quyết lỗi Vòng lặp Định tuyến (Redirect Loop)
*   **Tệp tin:** `admin/src/components/ProtectedRoute.jsx`
*   **Chi tiết sửa:** Thay đổi đường dẫn điều hướng fallback khi không có token từ `/login` thành `/admin/login` để tránh xung đột với các router bên phía client, loại bỏ hiện tượng crash màn hình trắng (White Screen of Death).

### 5.3. Tái thiết kế Giao diện Đăng nhập (Admin Login UI/UX)
*   **Cấu trúc 2 cột hiện đại:** Học hỏi từ giao diện đăng nhập của User, chia màn hình làm 2 cột:
    *   *Cột Trái (Hình ảnh thương hiệu):* Hiển thị hình ảnh du lịch cao cấp được mix màu gradient thương hiệu (`Xanh Mint #7FFFD4` và `Hồng #FF6B6B`) cùng khẩu hiệu "Wanderly Workspace".
    *   *Cột Phải (Form đăng nhập):* Đặt form đăng nhập dạng Card kính mờ (Glassmorphism) vô cùng sang trọng.
*   **Khắc phục lỗi chói mắt ở Light Mode:**
    *   Thay thế nền xám/trắng phẳng bằng dải màu gradient cực nhẹ (`from-[#7FFFD4]/10 via-gray-50 to-[#FF6B6B]/10`) giúp làm dịu mắt người dùng.
    *   Thêm các bóng đèn màu (blobs) mờ ở góc để lấp đầy khoảng trống trải của màn hình Light Mode.
*   **Đường viền Gradient nổi bật:** Bao quanh Card đăng nhập và vạch phân tách cột bằng đường viền gradient chuyển màu từ Mint sang Pink mềm mại để tăng nhận diện thương hiệu.

### 5.4. Đồng bộ màu sắc giao diện Dashboard
*   **Tệp tin:** `admin/src/pages/Dashboard/AdminDashboard.jsx`
*   **Cải tiến:**
    *   Chuyển đổi toàn bộ màu nhấn mặc định (Xanh dương, Xanh lá cây) sang dải màu gradient `Mint (#7FFFD4)` - `Pink (#FF6B6B)` trên các thẻ thống kê và nút hành động (ví dụ: nút "Manage Users").
    *   Áp dụng hiệu ứng kính mờ `bg-white/80 dark:bg-gray-800/90 backdrop-blur-md` lên toàn bộ Card Dashboard để tạo tính đồng nhất thẩm mỹ với trang Login.
