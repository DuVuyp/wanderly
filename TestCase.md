# 📋 Wanderly - Test Case Document

---

## Module 1: Authentication

**Project Name:** Wanderly | **Module Name:** Module_Authentication | **API Base URL:** `http://localhost:4000`

### Pre-condition
- Server đang chạy tại `http://localhost:4000`, Client tại `http://localhost:3000`
- Database đã được khởi tạo với Prisma schema
- Không có user nào đăng ký với email `testuser@wanderly.com`
- Đã có sẵn 1 tài khoản hợp lệ: `existing@wanderly.com` / `Test@1234`
- Đã có 1 tài khoản bị xóa mềm: `deleted@wanderly.com` / `Test@1234` (is_deleted=true)

---

| Test Case# | Test Title/Scenario | Test Summary | Test Steps | Test Data | Expected Result | Post-condition | Actual Result | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|
| AUTH-001 | Register - Valid (Traveler) | Đăng ký traveler thành công | 1. POST `/api/auth/register` | **TD1:** `{"full_name":"Nguyen Van A","email":"testuser@wanderly.com","password":"Test@1234","role":"traveler"}` **TD2:** `{"full_name":"Le Thi B","email":"user2@wanderly.com","password":"Abcd@5678","role":"traveler"}` **TD3:** `{"full_name":"Tran Van C","email":"user3@wanderly.com","password":"Pass#9012","role":"traveler"}` | Status 201, `success: true`, user không chứa `password_hash` | Tài khoản mới trong DB | | | |
| AUTH-002 | Register - Valid (Provider) | Đăng ký provider thành công | 1. POST `/api/auth/register` với role provider | **TD1:** `{"full_name":"Provider A","email":"prov1@wanderly.com","password":"Test@1234","role":"provider"}` **TD2:** `{"full_name":"Hotel Owner","email":"prov2@wanderly.com","password":"Secure@999","role":"provider"}` **TD3:** `{"full_name":"Resort Mgr","email":"prov3@wanderly.com","password":"MyPass#1a","role":"provider"}` | Status 201, user.role="provider" | Tài khoản provider mới | | | |
| AUTH-003 | Register - Duplicate email | Email đã tồn tại | 1. POST `/api/auth/register` | **TD1:** `{"full_name":"Dup","email":"existing@wanderly.com","password":"Test@1234"}` **TD2:** `{"full_name":"Dup2","email":"EXISTING@wanderly.com","password":"Test@1234"}` **TD3:** `{"full_name":"Dup3","email":"Existing@Wanderly.com","password":"Test@1234"}` | Status 409, "Email already exists" | Không tạo | | | |
| AUTH-004 | Register - Missing full_name | Thiếu full_name | 1. POST `/api/auth/register` | **TD1:** `{"email":"a@w.com","password":"Test@1234"}` **TD2:** `{"full_name":"","email":"b@w.com","password":"Test@1234"}` **TD3:** `{"full_name":null,"email":"c@w.com","password":"Test@1234"}` | Status 400, "Full name is required" | Không tạo | | | |
| AUTH-005 | Register - full_name quá ngắn | full_name < 2 ký tự | 1. POST `/api/auth/register` | **TD1:** `{"full_name":"A","email":"a@w.com","password":"Test@1234"}` **TD2:** `{"full_name":"X","email":"b@w.com","password":"Test@1234"}` **TD3:** `{"full_name":"1","email":"c@w.com","password":"Test@1234"}` | Status 400, "Full name must be at least 2 characters" | Không tạo | | | |
| AUTH-006 | Register - full_name quá dài | full_name > 100 ký tự | 1. POST `/api/auth/register` | **TD1-TD3:** full_name lần lượt 101, 150, 200 ký tự | Status 400, "Full name must be at most 100 characters" | Không tạo | | | |
| AUTH-007 | Register - Missing email | Thiếu email | 1. POST `/api/auth/register` | **TD1:** `{"full_name":"Test","password":"Test@1234"}` **TD2:** `{"full_name":"Test","email":"","password":"Test@1234"}` **TD3:** `{"full_name":"Test","email":null,"password":"Test@1234"}` | Status 400, "Email is required" | Không tạo | | | |
| AUTH-008 | Register - Invalid email | Email sai format | 1. POST `/api/auth/register` | **TD1:** email="not-an-email" **TD2:** email="user@" **TD3:** email="@domain.com" | Status 400, "Email must be a valid email address" | Không tạo | | | |
| AUTH-009 | Register - Missing password | Thiếu password | 1. POST `/api/auth/register` | **TD1:** `{"full_name":"T","email":"a@w.com"}` **TD2:** password="" **TD3:** password=null | Status 400, "Password is required" | Không tạo | | | |
| AUTH-010 | Register - Password < 8 chars | Password quá ngắn | 1. POST `/api/auth/register` | **TD1:** password="Ab1@" **TD2:** password="A1@bcde" **TD3:** password="X9#" | Status 400, "Password must be at least 8 characters" | Không tạo | | | |
| AUTH-011 | Register - Password no uppercase | Thiếu chữ hoa | 1. POST `/api/auth/register` | **TD1:** password="test@1234" **TD2:** password="abcdef@1" **TD3:** password="hello#99" | Status 400, "Password must include uppercase, lowercase, number, and special character" | Không tạo | | | |
| AUTH-012 | Register - Password no lowercase | Thiếu chữ thường | 1. POST `/api/auth/register` | **TD1:** password="TEST@1234" **TD2:** password="ABCDEF@1" **TD3:** password="HELLO#99" | Status 400, validation error | Không tạo | | | |
| AUTH-013 | Register - Password no number | Thiếu số | 1. POST `/api/auth/register` | **TD1:** password="Test@abcd" **TD2:** password="Hello@World" **TD3:** password="Abcd#efgh" | Status 400, validation error | Không tạo | | | |
| AUTH-014 | Register - Password no special char | Thiếu ký tự đặc biệt | 1. POST `/api/auth/register` | **TD1:** password="Test1234a" **TD2:** password="Abcdef12" **TD3:** password="Hello999W" | Status 400, validation error | Không tạo | | | |
| AUTH-015 | Register - Invalid role | Role không hợp lệ | 1. POST `/api/auth/register` | **TD1:** role="superadmin" **TD2:** role="manager" **TD3:** role="Admin" (sai case) | Status 400, "Role is invalid" | Không tạo | | | |
| AUTH-016 | Register - Default role | Không truyền role → traveler | 1. POST `/api/auth/register` không có field role | **TD1:** `{"full_name":"AA","email":"d1@w.com","password":"Test@1234"}` **TD2:** `{"full_name":"BB","email":"d2@w.com","password":"Abcd@5678"}` **TD3:** `{"full_name":"CC","email":"d3@w.com","password":"Pass#9012"}` | Status 201, user.role="traveler" | Tài khoản role traveler | | | |
| AUTH-017 | Register - Empty body | Body rỗng | 1. POST `/api/auth/register` | **TD1:** `{}` **TD2:** `null` **TD3:** body trống | Status 400, validation errors | Không tạo | | | |
| AUTH-018 | Login - Valid credentials | Đăng nhập thành công | 1. POST `/api/auth/login` | **TD1:** `{"email":"existing@wanderly.com","password":"Test@1234"}` **TD2:** `{"email":"testuser@wanderly.com","password":"Test@1234"}` **TD3:** `{"email":"provider@wanderly.com","password":"Test@1234"}` | Status 200, trả về `{user, tokens}`, tokens.access.token & tokens.refresh.token | Token được cấp | | | |
| AUTH-019 | Login - Wrong password | Sai mật khẩu | 1. POST `/api/auth/login` | **TD1:** password="WrongPass@1" **TD2:** password="test@1234" (sai case) **TD3:** password="Test@12345" (thừa ký tự) | Status 401, "Invalid email or password" | Không cấp token | | | |
| AUTH-020 | Login - Non-existent email | Email không tồn tại | 1. POST `/api/auth/login` | **TD1:** email="nonexist@w.com" **TD2:** email="fake@test.com" **TD3:** email="random@x.org" | Status 401, "Invalid email or password" | Không cấp token | | | |
| AUTH-021 | Login - Missing email | Thiếu email | 1. POST `/api/auth/login` | **TD1:** `{"password":"Test@1234"}` **TD2:** email="" **TD3:** email=null | Status 400, "Email is required" | Không cấp token | | | |
| AUTH-022 | Login - Missing password | Thiếu password | 1. POST `/api/auth/login` | **TD1:** `{"email":"existing@w.com"}` **TD2:** password="" **TD3:** password=null | Status 400, "Password is required" | Không cấp token | | | |
| AUTH-023 | Login - Invalid email format | Email sai format | 1. POST `/api/auth/login` | **TD1:** email="invalid" **TD2:** email="user@" **TD3:** email="@domain" | Status 400, "Email must be a valid email address" | Không cấp token | | | |
| AUTH-024 | Login - Soft-deleted user | Tài khoản đã xóa mềm | 1. POST `/api/auth/login` | **TD1:** `{"email":"deleted@wanderly.com","password":"Test@1234"}` **TD2:** email khác đã xóa mềm **TD3:** email thứ 3 đã xóa mềm | Status 401, "Invalid email or password" | Không cấp token | | | |
| AUTH-025 | Get Me - Valid token | Lấy thông tin user | 1. Đăng nhập 2. GET `/api/auth/me` | **TD1:** Bearer token traveler **TD2:** Bearer token provider **TD3:** Bearer token admin | Status 200, user info không chứa password_hash | | | | |
| AUTH-026 | Get Me - No token | Không có token | 1. GET `/api/auth/me` | **TD1:** Không header **TD2:** Header rỗng **TD3:** `Authorization: ` (trống) | Status 401, "Access token is required" | | | | |
| AUTH-027 | Get Me - Invalid token | Token sai | 1. GET `/api/auth/me` | **TD1:** Bearer "invalidtoken123" **TD2:** Bearer "abc.def.ghi" **TD3:** Bearer "eyJhb...(cắt xén)" | Status 401, "Invalid access token" | | | | |
| AUTH-028 | Get Me - Expired token | Token hết hạn | 1. GET `/api/auth/me` | **TD1-TD3:** 3 token expired khác nhau (tạo với exp trong quá khứ) | Status 401, "Access token has expired" | | | | |
| AUTH-029 | Refresh Token - Valid | Làm mới token | 1. POST `/api/auth/refresh-token` | **TD1:** refreshToken traveler **TD2:** refreshToken provider **TD3:** refreshToken admin | Status 200, tokens mới (access + refresh) | Token mới hợp lệ | | | |
| AUTH-030 | Refresh Token - Missing | Thiếu refreshToken | 1. POST `/api/auth/refresh-token` | **TD1:** `{}` **TD2:** `{"refreshToken":""}` **TD3:** `{"refreshToken":null}` | Status 400, "Refresh token is required" | | | | |
| AUTH-031 | Refresh Token - Invalid | Token sai | 1. POST `/api/auth/refresh-token` | **TD1:** "invalidtoken" **TD2:** "abc.xyz.123" **TD3:** access token thay vì refresh token | Status 401, "Invalid token" | | | | |
| AUTH-032 | Logout - Valid | Đăng xuất | 1. POST `/api/auth/logout` | **TD1:** Bearer token traveler **TD2:** Bearer token provider **TD3:** Bearer token admin | Status 200, "Logged out successfully" | Client xóa token | | | |
| AUTH-033 | Logout - No token | Không có token | 1. POST `/api/auth/logout` | **TD1:** Không header **TD2:** Header rỗng **TD3:** Bearer "" | Status 401, "Access token is required" | | | | |
| AUTH-034 | Register - Email case-insensitive | Email hoa/thường trùng lặp | 1. Đăng ký TestUser@wanderly.com khi testuser@wanderly.com đã tồn tại | **TD1:** "TestUser@wanderly.com" **TD2:** "TESTUSER@WANDERLY.COM" **TD3:** "testUser@Wanderly.Com" | Status 409, "Email already exists" (server lowercase trước khi lưu) | Không tạo tài khoản trùng | | | |
| AUTH-035 | Register - Password with spaces | Mật khẩu chứa khoảng trắng | 1. POST `/api/auth/register` | **TD1:** password="Test @1234 " **TD2:** password=" Test@1234" **TD3:** password="Test 1234@" | Hệ thống trim hoặc xử lý khoảng trắng nhất quán | Tùy policy: trim hoặc reject | | | |
| AUTH-036 | Login - SQL Injection / XSS | Payload độc hại | 1. POST `/api/auth/login` | **TD1:** email=`' OR 1=1 --` **TD2:** email=`<script>alert(1)</script>` **TD3:** password=`"; DROP TABLE users;--` | Payload bị chặn, hệ thống an toàn, trả về 400/401 | DB không bị ảnh hưởng | | | |
| AUTH-037 | Refresh Token - Replay Attack | Dùng lại token cũ | 1. Refresh lấy token mới 2. Dùng lại refreshToken cũ | **TD1:** refreshToken đã dùng 1 lần **TD2:** refreshToken đã dùng 2 lần **TD3:** refreshToken đã dùng 5 phút trước | Status 401/403 (stateless JWT vẫn valid nếu chưa hết hạn — ghi nhận risk) | | | | Lưu ý: Stateless JWT không revoke được token cũ |
| AUTH-038 | UI Register - Validate lỗi hiển thị | Hiển thị cảnh báo lỗi trên form | 1. Mở trang Register 2. Bấm Sign Up khi để trống tất cả | **TD1:** Để trống tất cả **TD2:** Chỉ điền email **TD3:** Chỉ điền password | Khung viền đỏ, hiển thị lỗi dưới mỗi ô input trống | | | | |
| AUTH-039 | UI Login - Ẩn/Hiện mật khẩu | Toggle visibility password | 1. Mở Login 2. Nhập password 3. Click icon mắt | **TD1:** password="Test@1234" → click 1 lần **TD2:** click 2 lần (ẩn→hiện→ẩn) **TD3:** password dài 50 ký tự | Click icon mắt: text chuyển giữa type=password ↔ type=text | | | | |
| AUTH-040 | UI Login - Lưu Token & điều hướng | Lưu token vào LocalStorage và redirect | 1. Đăng nhập thành công 2. Kiểm tra LocalStorage 3. Kiểm tra URL | **TD1:** Traveler → redirect / **TD2:** Provider → redirect / **TD3:** Từ trang booking cần auth → redirect lại booking | accessToken & user lưu trong LocalStorage, chuyển hướng đúng trang | | | | |
| AUTH-041 | UI Logout - Xóa Storage | Bấm Logout xóa storage | 1. Đăng nhập 2. Bấm nút Logout | **TD1:** Logout từ trang Home **TD2:** Logout từ trang Profile **TD3:** Logout từ trang Booking | LocalStorage bị xóa (accessToken, refreshToken, user), chuyển về trang Login | | | | |
| AUTH-042 | UI Register/Login - Validate realtime | Validate ngay khi đang gõ | 1. Mở Register 2. Gõ từng ký tự vào ô Email | **TD1:** Gõ "abc" → lỗi email **TD2:** Gõ "abc@" → vẫn lỗi **TD3:** Gõ "abc@test.com" → lỗi biến mất | Hiển thị/ẩn lỗi ngay dưới ô input theo thời gian thực | | | | |
| AUTH-043 | Login - Rate limit (brute force) | Nhập sai password nhiều lần | 1. POST `/api/auth/login` sai 10 lần liên tiếp | **TD1:** Sai 5 lần **TD2:** Sai 10 lần **TD3:** Sai 20 lần | Hệ thống block tạm thời hoặc tăng delay (nếu có rate-limit middleware) | | | | Ghi nhận nếu chưa implement |

---

## Module 2: Profile

**Module Name:** Module_Profile

### Pre-condition
- User đã đăng nhập thành công và có `accessToken` hợp lệ
- User hiện tại: `full_name: "Test User"`, `phone_number: null`, `avatar: null`
- Mật khẩu hiện tại: `Test@1234`

---

| Test Case# | Test Title/Scenario | Test Summary | Test Steps | Test Data | Expected Result | Post-condition | Actual Result | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|
| PROF-001 | Get Profile - Valid | Lấy profile thành công | 1. GET `/api/profile` | **TD1:** Bearer traveler **TD2:** Bearer provider **TD3:** Bearer admin | Status 200, user info không chứa password_hash, verify_token, reset_pass_token | | | | |
| PROF-002 | Get Profile - No token | Không có token | 1. GET `/api/profile` | **TD1:** Không header **TD2:** Header rỗng **TD3:** `Authorization: Bearer` (trống) | Status 401, "Access token is required" | | | | |
| PROF-003 | Get Profile - Invalid token | Token sai | 1. GET `/api/profile` | **TD1:** Bearer "faketoken" **TD2:** Bearer "abc.def" **TD3:** Bearer expired_token | Status 401 | | | | |
| PROF-004 | Update Profile - full_name | Cập nhật tên | 1. PUT `/api/profile` | **TD1:** `{"full_name":"Nguyen Van B"}` **TD2:** `{"full_name":"Le Thi C Hoang"}` **TD3:** `{"full_name":"AB"}` (2 chars - min) | Status 200, data.full_name cập nhật đúng | DB cập nhật | | | |
| PROF-005 | Update Profile - phone_number | Cập nhật SĐT | 1. PUT `/api/profile` | **TD1:** `{"phone_number":"0912345678"}` **TD2:** `{"phone_number":"0387654321"}` **TD3:** `{"phone_number":"+84912345678"}` | Status 200, data.phone_number cập nhật | DB cập nhật | | | |
| PROF-006 | Update Profile - avatar URL | Cập nhật avatar | 1. PUT `/api/profile` | **TD1:** `{"avatar":"https://example.com/avatar.jpg"}` **TD2:** `{"avatar":"https://res.cloudinary.com/img/a.png"}` **TD3:** `{"avatar":"https://cdn.wanderly.com/user/photo.webp"}` | Status 200, data.avatar = URL | DB cập nhật | | | |
| PROF-007 | Update Profile - full_name quá dài | full_name > 255 chars | 1. PUT `/api/profile` | **TD1:** 256 chars **TD2:** 300 chars **TD3:** 500 chars | Status 400, validation error | Profile không đổi | | | |
| PROF-008 | Update Profile - phone quá dài | phone > 20 chars | 1. PUT `/api/profile` | **TD1:** 21 số **TD2:** 25 số **TD3:** 30 số | Status 400, validation error | Profile không đổi | | | |
| PROF-009 | Update Profile - avatar not URI | avatar sai format | 1. PUT `/api/profile` | **TD1:** "not-a-url" **TD2:** "ftp://file.txt" **TD3:** "/local/path/img.jpg" | Status 400, validation error | Profile không đổi | | | |
| PROF-010 | Update Profile - Clear phone | Xóa SĐT | 1. PUT `/api/profile` | **TD1:** `{"phone_number":null}` **TD2:** `{"phone_number":""}` **TD3:** cả 2 field null | Status 200, phone_number = null hoặc "" | DB cập nhật | | | |
| PROF-011 | Update Profile - Clear avatar | Xóa avatar | 1. PUT `/api/profile` | **TD1:** `{"avatar":""}` **TD2:** `{"avatar":null}` **TD3:** `{"avatar":"","phone_number":null}` | Status 200 | DB cập nhật | | | |
| PROF-012 | Update Profile - Multiple fields | Nhiều trường cùng lúc | 1. PUT `/api/profile` | **TD1:** `{"full_name":"New","phone_number":"0987654321","avatar":"https://img.com/a.png"}` **TD2:** `{"full_name":"AB","phone_number":"0111222333"}` **TD3:** `{"full_name":"CD EF","avatar":"https://cdn.com/b.jpg"}` | Status 200, tất cả cập nhật | | | | |
| PROF-013 | Update Profile - Empty body | Body rỗng | 1. PUT `/api/profile` `{}` | **TD1:** `{}` **TD2:** body trống **TD3:** `{"unknown_field":"val"}` | Status 200, profile giữ nguyên | Không đổi | | | |
| PROF-014 | Update Profile - No token | Không token | 1. PUT `/api/profile` | **TD1:** `{"full_name":"Hack"}` ko Bearer **TD2:** Bearer invalid **TD3:** Bearer expired | Status 401 | Profile không đổi | | | |
| PROF-015 | Change Password - Valid | Đổi mật khẩu thành công | 1. PUT `/api/profile/change-password` | **TD1:** `{"oldPassword":"Test@1234","newPassword":"NewPass@5678"}` **TD2:** `{"oldPassword":"Test@1234","newPassword":"Abcd#9012"}` **TD3:** `{"oldPassword":"Test@1234","newPassword":"Xyz!4567a"}` | Status 200, "Password changed successfully" | Đăng nhập lại bằng password mới | | | |
| PROF-016 | Change Password - Wrong old | Sai mật khẩu cũ | 1. PUT `/api/profile/change-password` | **TD1:** oldPassword="WrongOld@1" **TD2:** oldPassword="test@1234" (sai case) **TD3:** oldPassword="" | Status 400, "Incorrect old password" | Password không đổi | | | |
| PROF-017 | Change Password - Missing old | Thiếu oldPassword | 1. PUT `/api/profile/change-password` | **TD1:** `{"newPassword":"New@5678"}` **TD2:** oldPassword="" **TD3:** oldPassword=null | Status 400, validation error | Password không đổi | | | |
| PROF-018 | Change Password - Missing new | Thiếu newPassword | 1. PUT `/api/profile/change-password` | **TD1:** `{"oldPassword":"Test@1234"}` **TD2:** newPassword="" **TD3:** newPassword=null | Status 400, "New password is required" | Password không đổi | | | |
| PROF-019 | Change Password - New too short | Mới < 8 chars | 1. PUT `/api/profile/change-password` | **TD1:** newPassword="Ab1@" **TD2:** newPassword="X9#" **TD3:** newPassword="Aa1@567" (7 chars) | Status 400, "Password must be at least 8 characters" | Password không đổi | | | |
| PROF-020 | Change Password - New weak | Mật khẩu mới yếu | 1. PUT `/api/profile/change-password` | **TD1:** newPassword="testtest" (no upper/num/special) **TD2:** newPassword="12345678" **TD3:** newPassword="ABCDEFGH" | Status 400, "Password must include uppercase, lowercase, number, and special character" | Password không đổi | | | |
| PROF-021 | Change Password - No token | Không token | 1. PUT `/api/profile/change-password` | **TD1-TD3:** Body hợp lệ nhưng không/sai/hết hạn Bearer | Status 401 | Password không đổi | | | |
| PROF-022 | Change Password - Same as old | Mật khẩu mới trùng cũ | 1. PUT `/api/profile/change-password` | **TD1:** `{"oldPassword":"Test@1234","newPassword":"Test@1234"}` **TD2:** old=new="Abcd@5678" **TD3:** old=new="Pass#9012" | Status 400, "New password cannot be the same as the old password" (hoặc hệ thống cho phép — ghi nhận) | | | | Ghi nhận nếu chưa implement |
| PROF-023 | Update Profile - full_name min length | Tên < 2 ký tự | 1. PUT `/api/profile` | **TD1:** `{"full_name":""}` **TD2:** `{"full_name":"A"}` **TD3:** `{"full_name":" "}` (chỉ space) | Status 400, validation error | Profile không đổi | | | |
| PROF-024 | Update Profile - Duplicate phone | SĐT trùng user khác | 1. PUT `/api/profile` | **TD1:** phone của user B **TD2:** phone của user C **TD3:** phone đã dùng bởi admin | Status 400/409 hoặc cho phép (ghi nhận) | | | | Ghi nhận nếu DB không có unique constraint |
| PROF-025 | UI Profile - Preview avatar | Xem trước avatar | 1. Mở Profile 2. Chọn ảnh mới 3. Xem preview | **TD1:** File .jpg 200KB **TD2:** File .png 1MB **TD3:** File .webp 500KB | Hiển thị ảnh xem trước trên giao diện trước khi upload | | | | |
| PROF-026 | UI Change Password - Confirm mismatch | Mật khẩu xác nhận không khớp | 1. Mở đổi mật khẩu 2. Nhập newPassword ≠ confirmPassword | **TD1:** new="Test@5678" confirm="Test@5679" **TD2:** new="Abcd@1234" confirm="" **TD3:** new="Pass#1a2b" confirm="pass#1a2b" | Báo lỗi "Passwords do not match" ngay dưới ô input | | | | |
| PROF-027 | Ngoại lệ - Offline mode | Mất kết nối khi lưu | 1. Mở Profile 2. Sửa full_name 3. Ngắt mạng 4. Bấm Save | **TD1:** Ngắt WiFi **TD2:** Server shutdown **TD3:** Timeout 30s | Giao diện hiển thị thông báo lỗi thân thiện, không crash | | | | |
| PROF-028 | Ngoại lệ - Upload error (Cloudinary) | API upload ảnh lỗi | 1. Upload avatar 2. Cloudinary trả 500 | **TD1:** Server Cloudinary 500 **TD2:** Timeout **TD3:** File quá lớn (>10MB) | Backend xử lý an toàn, UI báo "Cannot upload image at this time" | | | | |

---

## Module 3: Provider Management

**Module Name:** Module_ProviderManagement

### Pre-condition
- User đã đăng nhập với role `provider` và có `accessToken` hợp lệ
- Đã có sẵn 1 property thuộc provider hiện tại (ID=1) với tên "Sunrise Hotel"
- Đã có sẵn 1 room_type (ID=1) thuộc property ID=1, base_price=500000, max_guests=2
- Có 5 phòng vật lý (Rooms) thuộc room_type ID=1, status = "available"
- Tài khoản provider khác (provider2) sở hữu property riêng (ID=2)

---

| Test Case# | Test Title/Scenario | Test Summary | Test Steps | Test Data | Expected Result | Post-condition | Actual Result | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|
| PROV-001 | Create Property - Valid resort | Tạo property resort thành công | 1. POST `/api/properties` với Bearer provider | **TD1:** `{"name":"A","property_type":"resort","address":"Add1","latitude":10,"longitude":106,"check_in_time":"14:00","check_out_time":"12:00"}` **TD2:** resort tên "B", tọa độ khác **TD3:** resort tên "C" | Status 201, message: "Property created successfully" | Property mới trong DB | | | |
| PROV-002 | Create Property - Valid hotel | Tạo property hotel | 1. POST `/api/properties` | **TD1:** hotel "H1" **TD2:** hotel "H2" **TD3:** hotel "H3" | Status 201, data.property_type = "hotel" | | | | |
| PROV-003 | Create Property - Valid homestay | Tạo homestay | 1. POST `/api/properties` | **TD1:** homestay "HS1" **TD2:** homestay "HS2" **TD3:** homestay "HS3" | Status 201 | | | | |
| PROV-004 | Create Property - Valid villa | Tạo villa | 1. POST `/api/properties` | **TD1:** villa "V1" **TD2:** villa "V2" **TD3:** villa "V3" | Status 201 | | | | |
| PROV-005 | Create Property - Missing name | Thiếu tên | 1. POST `/api/properties` | **TD1:** name=null **TD2:** name="" **TD3:** không truyền trường name | Status 400, "Property name is required" | Không tạo | | | |
| PROV-006 | Create Property - Name > 100 chars | Tên quá dài | 1. POST `/api/properties` | **TD1:** name=101 ký tự **TD2:** 150 ký tự **TD3:** 200 ký tự | Status 400, "Property name cannot exceed 100 characters" | Không tạo | | | |
| PROV-007 | Create Property - Invalid type | property_type sai | 1. POST `/api/properties` | **TD1:** "apartment" **TD2:** "motel" **TD3:** "hostel" | Status 400, "Property type must be one of: hotel, homestay, resort, villa" | Không tạo | | | |
| PROV-008 | Create Property - Missing address | Thiếu địa chỉ | 1. POST `/api/properties` | **TD1:** address=null **TD2:** address="" **TD3:** không truyền field address | Status 400, "Address is required" | Không tạo | | | |
| PROV-009 | Create Property - Latitude out of range | Vĩ độ ngoài phạm vi | 1. POST `/api/properties` | **TD1:** latitude=91 **TD2:** latitude=-91 **TD3:** latitude=100 | Status 400, "Latitude must be between -90 and 90" | Không tạo | | | |
| PROV-010 | Create Property - Longitude out of range | Kinh độ ngoài phạm vi | 1. POST `/api/properties` | **TD1:** longitude=181 **TD2:** longitude=-181 **TD3:** longitude=200 | Status 400, "Longitude must be between -180 and 180" | Không tạo | | | |
| PROV-011 | Create Property - Invalid time format | Sai format giờ check-in | 1. POST `/api/properties` | **TD1:** check_in_time="2PM" **TD2:** "14-00" **TD3:** "25:00" | Status 400, "Check-in time must be in HH:MM format (24h)" | Không tạo | | | |
| PROV-012 | Create Property - Traveler role | Traveler cố tạo | 1. POST `/api/properties` với Bearer traveler | **TD1:** Bearer traveler1 **TD2:** Bearer traveler2 **TD3:** Bearer admin | Status 403, "You do not have permission" | Không tạo | | | |
| PROV-013 | Get Properties - Public | Danh sách public | 1. GET `/api/properties` (no auth) | **TD1:** Lần 1 **TD2:** Lần 2 **TD3:** Lần 3 | Status 200, `{ properties, pagination }` | | | | |
| PROV-014 | Get Properties - Filter type | Lọc theo loại | 1. GET `/api/properties?property_type=...` | **TD1:** type=hotel **TD2:** type=resort **TD3:** type=villa | Status 200, trả về items theo type | | | | |
| PROV-015 | Get Properties - Search keyword | Tìm theo tên | 1. GET `/api/properties?keyword=...` | **TD1:** keyword="Sunrise" **TD2:** keyword="Beach" **TD3:** keyword="Resort" | Status 200, kết quả có chứa keyword | | | | |
| PROV-016 | Get Properties - Search location | Tìm theo địa chỉ | 1. GET `/api/properties?location=...` | **TD1:** location="HCM" **TD2:** location="Da Nang" **TD3:** location="Nha Trang" | Status 200, kết quả chứa địa chỉ | | | | |
| PROV-017 | Get Properties - Pagination | Phân trang | 1. GET `/api/properties?page=X&limit=Y` | **TD1:** page=1, limit=5 **TD2:** page=2, limit=10 **TD3:** page=3, limit=20 | Status 200, max Y items, pagination đầy đủ | | | | |
| PROV-018 | Get Properties - Provider view | Provider xem DS của mình | 1. GET `/api/properties` với Bearer provider | **TD1:** Bearer provider1 **TD2:** Bearer provider2 **TD3:** Bearer provider3 | Status 200, mảng properties của provider đó | | | | |
| PROV-019 | Get Property Detail - Valid | Xem chi tiết | 1. GET `/api/properties/{id}` | **TD1:** id=1 **TD2:** id=2 **TD3:** id=3 | Status 200, property + Room_Types + Users | | | | |
| PROV-020 | Get Property Detail - Not found | ID không tồn tại | 1. GET `/api/properties/{id}` | **TD1:** id=99999 **TD2:** id=88888 **TD3:** id=-1 | Status 404, "Property not found" | | | | |
| PROV-021 | Get Property Detail - Soft deleted | Đã bị xóa mềm | 1. GET `/api/properties/<deleted_id>` | **TD1:** id_deleted_1 **TD2:** id_deleted_2 **TD3:** id_deleted_3 | Status 404, "Property not found" | | | | |
| PROV-022 | Update Property - Valid | Cập nhật thành công | 1. PUT `/api/properties/1` với Bearer owner | **TD1:** `{"name":"A"}` **TD2:** `{"address":"New Addr"}` **TD3:** `{"latitude":11}` | Status 200, "Property updated successfully" | DB cập nhật | | | |
| PROV-023 | Update Property - Not owner | Provider khác cố sửa | 1. PUT `/api/properties/1` với Bearer provider2 | **TD1:** Bearer provider2 **TD2:** Bearer provider3 **TD3:** Bearer provider4 | Status 403, "You do not have permission to update" | Không đổi | | | |
| PROV-024 | Update Property - Traveler | Traveler cố sửa | 1. PUT `/api/properties/1` với Bearer traveler | **TD1:** Bearer traveler1 **TD2:** Bearer traveler2 **TD3:** Bearer admin | Status 403 | Không đổi | | | |
| PROV-025 | Delete Property - Soft Delete | Xóa mềm thành công | 1. DELETE `/api/properties/{id}` với Bearer owner | **TD1:** id=1 **TD2:** id=2 **TD3:** id=3 | Status 200, cascade soft-delete Property, Room_Types, Rooms | is_deleted=true cho tất cả | | | |
| PROV-026 | Delete Property - Not owner | Provider khác cố xóa | 1. DELETE `/api/properties/1` với Bearer provider2 | **TD1:** Bearer provider2 **TD2:** Bearer provider3 **TD3:** Bearer traveler | Status 403, "You do not have permission to delete" | Không xóa | | | |
| PROV-027 | Get Room Types - Valid | Lấy DS room types | 1. GET `/api/properties/1/room-types` | **TD1:** propertyId=1 **TD2:** propertyId=2 **TD3:** propertyId=3 | Status 200, mảng room types sorted by base_price ASC | | | | |
| PROV-028 | Get Room Types - Availability check | Kiểm tra phòng trống | 1. GET `/api/properties/1/room-types?check_in_date=...` | **TD1:** Dates hợp lệ 1 **TD2:** Dates hợp lệ 2 **TD3:** Dates hợp lệ 3 | Status 200, mỗi room type có `available_quantity` | | | | |
| PROV-029 | Get Room Types - Property not found | Property không tồn tại | 1. GET `/api/properties/99999/room-types` | **TD1:** propertyId=99999 **TD2:** propertyId=-1 **TD3:** propertyId deleted | Status 404, "Property not found" | | | | |
| PROV-030 | Create Room Type - Valid | Tạo room type mới | 1. POST `/api/properties/1/room-types` | **TD1:** name="A", max=2, price=100k **TD2:** name="B", max=3, price=200k **TD3:** name="C", max=4, price=500k | Status 201 | Room type mới trong DB | | | |
| PROV-031 | Create Room Type - Missing name | Thiếu tên | 1. POST `/api/properties/1/room-types` | **TD1:** name=null **TD2:** name="" **TD3:** không truyền trường name | Status 400, "Room type name is required" | Không tạo | | | |
| PROV-032 | Create Room Type - Name > 50 chars | Tên quá dài | 1. POST `/api/properties/1/room-types` | **TD1:** name=51 ký tự **TD2:** 100 ký tự **TD3:** 150 ký tự | Status 400, "Room type name cannot exceed 50 characters" | Không tạo | | | |
| PROV-033 | Create Room Type - max_guests = 0 | Số khách = 0 | 1. POST `/api/properties/1/room-types` | **TD1:** max_guests=0 **TD2:** max_guests=-1 **TD3:** max_guests=-10 | Status 400, "Max guests must be greater than 0" | Không tạo | | | |
| PROV-034 | Create Room Type - max_guests > 20 | Số khách > 20 | 1. POST `/api/properties/1/room-types` | **TD1:** max_guests=21 **TD2:** max_guests=50 **TD3:** max_guests=100 | Status 400, "Max guests cannot exceed 20 people" | Không tạo | | | |
| PROV-035 | Create Room Type - base_price = 0 | Giá = 0 | 1. POST `/api/properties/1/room-types` | **TD1:** base_price=0 **TD2:** base_price=-1 **TD3:** base_price=-100 | Status 400, "Base price must be greater than 0" | Không tạo | | | |
| PROV-036 | Create Room Type - Định dạng số lượng phòng | Truyền sai data type | 1. POST `/api/properties/1/room-types` | **TD1:** max_guests="five" **TD2:** base_price="một trăm" **TD3:** max_guests=1.5 | Status 400, yêu cầu số nguyên | Không tạo | | | |
| PROV-037 | Create Room (Phòng vật lý) - Trùng số phòng | Trùng room_number | 1. POST `/api/room-types/1/rooms` (nếu có API) | **TD1:** room_number=101 (đã tồn tại) **TD2:** 102 (đã có) **TD3:** 103 (đã có) | Hệ thống chặn và báo lỗi 400/409 "Room number already exists" | Không tạo | | | Ghi nhận nếu chưa implement logic check trùng |
| PROV-038 | Update Room - Sai trạng thái | Cập nhật status sai | 1. PUT `/api/rooms/1` (nếu có API) | **TD1:** status="unknown" **TD2:** status="booked" (không có trong enum) **TD3:** status="clean" | Status 400, "Invalid status" (chỉ nhận available, maintenance, occupied) | Không đổi | | | Ghi nhận nếu chưa implement |
| PROV-039 | Logic Upload - Xử lý ảnh Property | Giới hạn dung lượng/số lượng | 1. POST upload ảnh property | **TD1:** Upload 11 ảnh (quá limit 10) **TD2:** Upload ảnh 10MB (quá limit 5MB) **TD3:** Upload file .exe | Status 400 báo lỗi limit hoặc format | | | | Ghi nhận API upload |
| PROV-040 | UI Create Property - Kéo thả bản đồ | UX kéo marker | 1. Mở Create Property 2. Kéo thả marker trên Map | **TD1:** Kéo ra biển **TD2:** Kéo vào HCM **TD3:** Kéo sang nước khác | Lat/Long tự động update vào form tương ứng vị trí marker | | | | |

---
---

## Module 4: Admin Management

**Module Name:** Module_AdminManagement

### Pre-condition
- User đã đăng nhập với role `admin` và có `accessToken` hợp lệ
- Có ít nhất 3 user trong hệ thống (1 admin, 1 traveler, 1 provider), tất cả is_deleted != true
- Có 1 user đã bị soft delete (is_deleted = true) với ID = `<deleted_user_id>`
- Admin frontend chạy tại `http://localhost:5173`

---

| Test Case# | Test Title/Scenario | Test Summary | Test Steps | Test Data | Expected Result | Post-condition | Actual Result | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|
| ADM-001 | Get Users - Default | Lấy danh sách users | 1. GET `/api/users` với Bearer admin | **TD1:** Bearer admin1 **TD2:** Bearer admin2 **TD3:** Bearer superadmin | Status 200, trả về `{ users, pagination }`, không chứa password_hash | | | | |
| ADM-002 | Get Users - Pagination | Phân trang | 1. GET `/api/users?page=X&limit=Y` | **TD1:** page=1, limit=2 **TD2:** page=2, limit=5 **TD3:** page=10, limit=10 | Status 200, phân trang đúng số lượng | | | | |
| ADM-003 | Get Users - Filter role traveler | Lọc role traveler | 1. GET `/api/users?role=traveler` | **TD1:** `role=traveler` **TD2:** `role=TRAVELER` (nếu API hỗ trợ case-insensitive) **TD3:** `role=Traveler` | Status 200, tất cả users trả về có role=traveler | | | | |
| ADM-004 | Get Users - Filter role provider | Lọc provider | 1. GET `/api/users?role=provider` | **TD1:** `role=provider` **TD2:** `role=PROVIDER` **TD3:** `role=Provider` | Status 200, tất cả users có role=provider | | | | |
| ADM-005 | Get Users - Filter role admin | Lọc admin | 1. GET `/api/users?role=admin` | **TD1:** `role=admin` **TD2:** `role=ADMIN` **TD3:** `role=Admin` | Status 200, tất cả users có role=admin | | | | |
| ADM-006 | Get Users - Search by email | Tìm theo email | 1. GET `/api/users?search=...` | **TD1:** `search=existing` **TD2:** `search=prov` **TD3:** `search=admin@` | Status 200, kết quả chứa email match | | | | |
| ADM-007 | Get Users - Search by name | Tìm theo tên | 1. GET `/api/users?search=...` | **TD1:** `search=Nguyen` **TD2:** `search=User` **TD3:** `search=Provider` | Status 200, kết quả chứa full_name match | | | | |
| ADM-008 | Get Users - Exclude soft-deleted | Không hiển thị user đã xóa mềm | 1. GET `/api/users` | **TD1:** Lần 1 **TD2:** Lần 2 **TD3:** Lần 3 | Status 200, danh sách không chứa user có is_deleted=true | | | | |
| ADM-009 | Get Users - Traveler access | Traveler cố truy cập | 1. GET `/api/users` với Bearer traveler | **TD1:** Bearer traveler1 **TD2:** Bearer traveler2 **TD3:** Bearer traveler3 | Status 403, "You do not have permission" | | | | |
| ADM-010 | Get Users - Provider access | Provider cố truy cập | 1. GET `/api/users` với Bearer provider | **TD1:** Bearer prov1 **TD2:** Bearer prov2 **TD3:** Bearer prov3 | Status 403, "You do not have permission" | | | | |
| ADM-011 | Get Users - No token | Không có token | 1. GET `/api/users` | **TD1:** Không header **TD2:** Header rỗng **TD3:** Bearer expired | Status 401, "Access token is required" | | | | |
| ADM-012 | Get User by ID - Valid | Xem chi tiết user | 1. GET `/api/users/<id>` | **TD1:** id của traveler **TD2:** id của provider **TD3:** id của admin khác | Status 200, user info không có password_hash | | | | |
| ADM-013 | Get User by ID - Not found | ID không tồn tại | 1. GET `/api/users/<id>` | **TD1:** id=99999 **TD2:** id=-1 **TD3:** id=0 | Status 404, "User not found" | | | | |
| ADM-014 | Get User by ID - Soft deleted | User đã bị xóa mềm | 1. GET `/api/users/<deleted_user_id>` | **TD1:** id deleted 1 **TD2:** id deleted 2 **TD3:** id deleted 3 | Status 404, "User not found" | | | | |
| ADM-015 | Update Role - To provider | Đổi role thành provider | 1. PUT `/api/users/<traveler_id>/role` | **TD1:** `{"role":"provider"}` cho id=2 **TD2:** cho id=3 **TD3:** cho id=4 | Status 200, "User role updated successfully", data.role="provider" | Role cập nhật trong DB | | | |
| ADM-016 | Update Role - To admin | Đổi role thành admin | 1. PUT `/api/users/<traveler_id>/role` | **TD1:** `{"role":"admin"}` cho id=5 **TD2:** cho id=6 **TD3:** cho id=7 | Status 200, data.role="admin" | Role cập nhật | | | |
| ADM-017 | Update Role - To traveler | Đổi role thành traveler | 1. PUT `/api/users/<provider_id>/role` | **TD1:** `{"role":"traveler"}` cho prov1 **TD2:** cho prov2 **TD3:** cho prov3 | Status 200, data.role="traveler" | Role cập nhật | | | |
| ADM-018 | Update Role - Invalid role | Role không hợp lệ | 1. PUT `/api/users/<id>/role` | **TD1:** `{"role":"superadmin"}` **TD2:** `{"role":"manager"}` **TD3:** `{"role":""}` | Status 400, "Role must be either traveler, provider, or admin" | Role không đổi | | | |
| ADM-019 | Update Role - Missing role | Thiếu trường role | 1. PUT `/api/users/<id>/role` | **TD1:** `{}` **TD2:** `{"role":null}` **TD3:** `{"Role":"admin"}` (sai case key) | Status 400, "Role is required" | Role không đổi | | | |
| ADM-020 | Update Role - Soft-deleted user | Cố sửa user đã xóa | 1. PUT `/api/users/<deleted_user_id>/role` | **TD1:** deleted1 **TD2:** deleted2 **TD3:** deleted3 | Status 404, "User not found" | Không đổi | | | |
| ADM-021 | Update Role - Non-admin access | Traveler cố đổi role | 1. PUT `/api/users/<id>/role` | **TD1:** Bearer traveler **TD2:** Bearer provider **TD3:** Không header | Status 403 / 401 | Không đổi | | | |
| ADM-022 | Delete User - Soft delete | Xóa mềm user thành công | 1. DELETE `/api/users/<valid_id>` | **TD1:** id traveler **TD2:** id provider **TD3:** id admin khác | Status 200, "User deleted successfully" | User.is_deleted = true | | | |
| ADM-023 | Delete User - Not found | ID không tồn tại | 1. DELETE `/api/users/99999` | **TD1:** id=99999 **TD2:** id=-1 **TD3:** id=0 | Status 404, "User not found" | | | | |
| ADM-024 | Delete User - Already deleted | User đã xóa trước đó | 1. DELETE `/api/users/<deleted_user_id>` | **TD1:** deleted1 **TD2:** deleted2 **TD3:** deleted3 | Status 404, "User not found" | | | | |
| ADM-025 | Delete User - Non-admin access | Không phải admin cố xóa | 1. DELETE `/api/users/<id>` | **TD1:** Bearer traveler **TD2:** Bearer provider **TD3:** No token | Status 403 / 401 | Không xóa | | | |
| ADM-026 | Admin Login UI - Valid credentials | Đăng nhập Admin UI | 1. Mở `/admin/login` 2. Login admin | **TD1:** admin@w.com/Test@1234 **TD2:** admin2@w.com/Pass@1 **TD3:** superadmin@w.com/Xyz#9 | Chuyển hướng đến `/admin/dashboard` | Token lưu localStorage | | | |
| ADM-027 | Admin Login UI - Non-admin user | Traveler login Admin | 1. Mở `/admin/login` 2. Login user thường | **TD1:** traveler@w.com **TD2:** provider@w.com **TD3:** user3@w.com | Toast error: "You do not have admin privileges" | Không lưu token | | | |
| ADM-028 | Admin Login UI - Wrong password | Sai mật khẩu | 1. Mở `/admin/login` | **TD1:** Sai 1 lần **TD2:** Sai 2 lần **TD3:** Sai 3 lần | Toast error: "Login failed" | | | | |
| ADM-029 | Admin Protected Route | Truy cập Dashboard ko login | 1. Clear localStorage 2. Truy cập `/admin/dashboard` | **TD1:** Lần 1 **TD2:** Lần 2 **TD3:** Thử `/admin/users` | Redirect về `/admin/login`, không hiện màn trắng | | | | |
| ADM-030 | Admin Theme Toggle | Chuyển đổi sáng/tối | 1. Click icon theme ở Header | **TD1:** Dark sang Light **TD2:** Light sang Dark **TD3:** F5 trang vẫn giữ theme | Giao diện chuyển đổi, lưu `adminTheme` vào localStorage | | | | |
| ADM-031 | Logic - Luồng cấp lại mật khẩu | Admin force reset password | 1. Admin bấm Reset Pass cho user | **TD1:** Reset cho traveler **TD2:** Reset cho provider **TD3:** Reset cho admin khác | Trả về mật khẩu ngẫu nhiên hoặc link reset | Mật khẩu mới được update | | | Ghi nhận nếu chưa implement tính năng này |

---

## Module 5: Booking

**Module Name:** Module_Booking

### Pre-condition
- Đã có user `traveler` đăng nhập với `accessToken` hợp lệ
- Đã có user `provider` sở hữu property (ID=1) với room_type (ID=1), base_price=500000
- Room_type ID=1 có 5 phòng vật lý available
- Đã có 1 booking (ID=1) ở trạng thái `pending` thuộc traveler hiện tại, property ID=1
- Tài khoản traveler2 (khác traveler hiện tại) cũng tồn tại trong hệ thống

---

| Test Case# | Test Title/Scenario | Test Summary | Test Steps | Test Data | Expected Result | Post-condition | Actual Result | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|
| BOOK-001 | Create Booking - Valid | Tạo booking thành công | 1. POST `/api/bookings` | **TD1:** check_in="2026-08-01", out="2026-08-03", qty=2 **TD2:** qty=1 **TD3:** qty=3 | Status 201, "Booking created successfully", status="pending" | Booking + Details tạo trong DB | | | |
| BOOK-002 | Create Booking - Multiple room types | Đặt nhiều loại phòng | 1. POST `/api/bookings` | **TD1:** room1(qty=1), room2(qty=1) **TD2:** room1(qty=2), room2(qty=2) **TD3:** room1(qty=1), room2(qty=3) | Status 201, total_price tính đúng | DB có đủ records detail | | | |
| BOOK-003 | Create Booking - Missing property_id | Thiếu property_id | 1. POST `/api/bookings` | **TD1:** property_id=null **TD2:** property_id="" **TD3:** không field property_id | Status 400, "Property ID is required" | Không tạo | | | |
| BOOK-004 | Create Booking - Invalid property_id | property_id ko tồn tại | 1. POST `/api/bookings` | **TD1:** id=99999 **TD2:** id=-1 **TD3:** id=0 | Status 404, "Property not found" | Không tạo | | | |
| BOOK-005 | Create Booking - Missing dates | Thiếu ngày in/out | 1. POST `/api/bookings` | **TD1:** thiếu check_in **TD2:** thiếu check_out **TD3:** thiếu cả 2 | Status 400 | Không tạo | | | |
| BOOK-006 | Create Booking - checkout <= checkin | Check-out trước in | 1. POST `/api/bookings` | **TD1:** in="2026-08-05", out="2026-08-03" **TD2:** in="2026-08-10", out="2026-08-01" **TD3:** in="2026-08-01", out="2026-08-01" | Status 400, "Check-out date must be after check-in date" | Không tạo | | | |
| BOOK-007 | Create Booking - Missing rooms | Thiếu rooms array | 1. POST `/api/bookings` | **TD1:** rooms=null **TD2:** rooms=[] **TD3:** không có field rooms | Status 400, "At least one room selection is required" | Không tạo | | | |
| BOOK-008 | Create Booking - Invalid room_type | room_type ko thuộc property | 1. POST `/api/bookings` | **TD1:** room_type_id=9999 **TD2:** id của property khác **TD3:** id=0 | Status 400, "Room type ... does not belong to this property" | Không tạo | | | |
| BOOK-009 | Create Booking - Not enough rooms | Đặt quá số phòng trống | 1. POST `/api/bookings` | **TD1:** qty=10 (có 5) **TD2:** qty=100 **TD3:** qty=6 | Status 400, "Not enough rooms available" | Không tạo | | | |
| BOOK-010 | Create Booking - quantity = 0 | Số lượng = 0 | 1. POST `/api/bookings` | **TD1:** qty=0 **TD2:** qty=-1 **TD3:** qty=-10 | Status 400, "Quantity must be at least 1" | Không tạo | | | |
| BOOK-011 | Create Booking - Provider role | Provider cố đặt phòng | 1. POST `/api/bookings` | **TD1:** Bearer prov1 **TD2:** Bearer prov2 **TD3:** Bearer prov3 | Status 403, "You do not have permission" | Không tạo | | | |
| BOOK-012 | Get My Bookings - Default | Traveler xem lịch sử | 1. GET `/api/bookings/my-bookings` | **TD1:** Bearer traveler1 **TD2:** Bearer traveler2 **TD3:** Bearer traveler3 | Status 200, `{ bookings, pagination }` | | | | |
| BOOK-013 | Get My Bookings - Filter status | Lọc trạng thái | 1. GET `/api/bookings/my-bookings?status=...` | **TD1:** pending **TD2:** confirmed **TD3:** cancelled | Status 200, danh sách lọc đúng | | | | |
| BOOK-014 | Get My Bookings - Pagination | Phân trang | 1. GET `/api/bookings/my-bookings?page=...` | **TD1:** p=1, l=5 **TD2:** p=2, l=5 **TD3:** p=1, l=10 | Status 200, max limit | | | | |
| BOOK-015 | Get Provider Bookings - Valid | Provider xem booking | 1. GET `/api/bookings/provider-bookings` | **TD1:** Bearer prov1 **TD2:** Bearer prov2 **TD3:** Bearer prov3 | Status 200, `{ bookings, pagination, stats }` | | | | |
| BOOK-016 | Get Provider Bookings - Filter | Lọc trạng thái | 1. GET `/api/bookings/provider-bookings?status=...`| **TD1:** pending **TD2:** confirmed **TD3:** completed | Status 200 | | | | |
| BOOK-017 | Get Provider Bookings - Traveler access| Traveler cố truy cập | 1. GET `/api/bookings/provider-bookings` | **TD1:** Bearer traveler1 **TD2:** Bearer traveler2 **TD3:** Bearer admin | Status 403 | | | | |
| BOOK-018 | Get Booking Detail - Owner | Traveler xem đơn mình | 1. GET `/api/bookings/<id>` | **TD1:** id=1 **TD2:** id=2 **TD3:** id=3 | Status 200, detail đầy đủ | | | | |
| BOOK-019 | Get Booking Detail - Provider | Provider xem đơn property mình| 1. GET `/api/bookings/<id>` | **TD1:** id=1 **TD2:** id=2 **TD3:** id=3 | Status 200 | | | | |
| BOOK-020 | Get Booking Detail - Unauthorized | Traveler2 xem của traveler1 | 1. GET `/api/bookings/<id>` | **TD1:** traveler2 xem id=1 **TD2:** traveler3 xem id=2 **TD3:** prov2 xem id=1 | Status 403, "You do not have permission" | | | | |
| BOOK-021 | Get Booking Detail - Not found | Booking không tồn tại | 1. GET `/api/bookings/99999` | **TD1:** id=99999 **TD2:** id=-1 **TD3:** id=0 | Status 404, "Booking not found" | | | | |
| BOOK-022 | Update Status - Confirm | Provider duyệt booking | 1. PUT `/api/bookings/<id>/status` | **TD1:** `{"status":"confirmed"}` id=1 **TD2:** id=2 **TD3:** id=3 | Status 200, "Booking confirmed successfully" | Status cập nhật | | | |
| BOOK-023 | Update Status - Cancel | Provider hủy booking | 1. PUT `/api/bookings/<id>/status` | **TD1:** `{"status":"cancelled"}` id=4 **TD2:** id=5 **TD3:** id=6 | Status 200, "Booking cancelled successfully" | Status cập nhật | | | |
| BOOK-024 | Update Status - Invalid status | Status sai | 1. PUT `/api/bookings/1/status` | **TD1:** status="unknown" **TD2:** status="completed" **TD3:** status="booked" | Status 400, "Status must be either confirmed or cancelled" | Không đổi | | | |
| BOOK-025 | Update Status - Not owner | Provider khác cố duyệt | 1. PUT `/api/bookings/1/status` | **TD1:** Bearer prov2 **TD2:** Bearer prov3 **TD3:** Bearer prov4 | Status 403, "You can only manage bookings for your own properties" | Không đổi | | | |
| BOOK-026 | Update Status - Already cancelled | Duyệt booking đã hủy | 1. PUT `/api/bookings/<cancelled_id>/status`| **TD1:** cancelled_1 **TD2:** cancelled_2 **TD3:** cancelled_3 | Status 400, "Cannot update a cancelled booking" | | | | |
| BOOK-027 | Update Status - Already completed | Hủy booking đã hoàn thành | 1. PUT `/api/bookings/<completed_id>/status`| **TD1:** completed_1 **TD2:** completed_2 **TD3:** completed_3 | Status 400, "Cannot update a completed booking" | | | | |
| BOOK-028 | Create Booking - Past check-in date | Đặt phòng ngày quá khứ | 1. POST `/api/bookings` | **TD1:** in="2023-01-01" **TD2:** in="hôm qua" **TD3:** in="tháng trước" | Status 400, lỗi ngày quá khứ | Không tạo | | | |
| BOOK-029 | UI Booking - Khóa ngày quá khứ | Disable past dates trên lịch | 1. Mở form booking 2. Mở lịch | **TD1:** Ngày hqa **TD2:** Tháng trước **TD3:** Năm ngoái | Ngày quá khứ xám mờ, không click được | | | | |
| BOOK-030 | UI My Bookings - Huy hiệu trạng thái | Màu sắc badge status | 1. Mở lịch sử đặt phòng | **TD1:** Booking Pending **TD2:** Confirmed **TD3:** Cancelled | Pending (vàng), Confirmed (xanh), Cancelled (đỏ) | | | | |
| BOOK-031 | UI Manage Bookings - Phê duyệt nhanh | Update UI tức thời | 1. Provider duyệt booking UI | **TD1:** Duyệt booking 1 **TD2:** Hủy booking 2 **TD3:** Duyệt booking 3 | Đổi thành "Confirmed" không reload trang | | | | |
| BOOK-032 | Logic - Race Condition | Đặt cùng lúc phòng cuối | 1. 2 user gọi API tạo booking cùng lúc | **TD1:** UserA và UserB gọi cho room cuối (qty=1) **TD2:** 3 User cùng gọi **TD3:** User C gọi room có qty=2 | Request 1 pass (201), Request 2 tạch (400 - hết phòng) | Không bị overbooking | | | DB Transaction test |
| BOOK-033 | Ngoại lệ - Lỗi Mail/Thanh toán | Tích hợp bên thứ 3 lỗi | 1. Đặt phòng khi Server Mail/Payment down | **TD1:** Mail server 500 **TD2:** Stripe timeout **TD3:** Sai API key mail | Booking tạo thành công, status payment failed, hệ thống không crash | | | | Nếu có tích hợp |

---
