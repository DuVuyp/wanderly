# 📋 Wanderly - Test Case Document

---

## Module 1: Authentication

**Project Name:** Wanderly  
**Module Name:** Module_Authentication  
**API Base URL:** `http://localhost:4000`

### Pre-condition
- Server đang chạy tại `http://localhost:4000`
- Database đã được khởi tạo với Prisma schema
- Không có user nào đăng ký với email `testuser@wanderly.com`
- Đã có sẵn 1 tài khoản hợp lệ: `existing@wanderly.com` / `Test@1234`

---

| Test Case# | Test Title/Scenario | Test Summary | Test Steps | Test Data | Expected Result | Post-condition | Actual Result | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|
| AUTH-001 | Register - Valid data (Traveler) | Đăng ký tài khoản traveler thành công | 1. POST `/api/auth/register` với body hợp lệ | `{"full_name":"Nguyen Van A","email":"testuser@wanderly.com","password":"Test@1234","role":"traveler"}` | Status 201, `success: true`, trả về user không chứa `password_hash` | Tài khoản mới được tạo trong DB | | | |
| AUTH-002 | Register - Valid data (Provider) | Đăng ký tài khoản provider thành công | 1. POST `/api/auth/register` với role provider | `{"full_name":"Provider User","email":"provider@wanderly.com","password":"Test@1234","role":"provider"}` | Status 201, `success: true`, user.role = "provider" | Tài khoản provider mới được tạo | | | |
| AUTH-003 | Register - Duplicate email | Đăng ký email đã tồn tại | 1. POST `/api/auth/register` với email đã đăng ký | `{"full_name":"Dup User","email":"existing@wanderly.com","password":"Test@1234"}` | Status 409, message: "Email already exists" | Không tạo tài khoản mới | | | |
| AUTH-004 | Register - Missing full_name | Thiếu trường full_name | 1. POST `/api/auth/register` không có full_name | `{"email":"new@wanderly.com","password":"Test@1234"}` | Status 400, message: "Full name is required" | Không tạo tài khoản | | | |
| AUTH-005 | Register - full_name quá ngắn | full_name < 2 ký tự | 1. POST `/api/auth/register` với full_name = "A" | `{"full_name":"A","email":"new@wanderly.com","password":"Test@1234"}` | Status 400, message: "Full name must be at least 2 characters" | Không tạo tài khoản | | | |
| AUTH-006 | Register - full_name quá dài | full_name > 100 ký tự | 1. POST `/api/auth/register` với full_name 101 chars | `{"full_name":"A...101chars...","email":"new@wanderly.com","password":"Test@1234"}` | Status 400, message: "Full name must be at most 100 characters" | Không tạo tài khoản | | | |
| AUTH-007 | Register - Missing email | Thiếu trường email | 1. POST `/api/auth/register` không có email | `{"full_name":"Test User","password":"Test@1234"}` | Status 400, message: "Email is required" | Không tạo tài khoản | | | |
| AUTH-008 | Register - Invalid email format | Email không hợp lệ | 1. POST `/api/auth/register` với email sai định dạng | `{"full_name":"Test","email":"not-an-email","password":"Test@1234"}` | Status 400, message: "Email must be a valid email address" | Không tạo tài khoản | | | |
| AUTH-009 | Register - Missing password | Thiếu password | 1. POST `/api/auth/register` không có password | `{"full_name":"Test","email":"new@wanderly.com"}` | Status 400, message: "Password is required" | Không tạo tài khoản | | | |
| AUTH-010 | Register - Password too short | Password < 8 ký tự | 1. POST `/api/auth/register` với password ngắn | `{"full_name":"Test","email":"new@wanderly.com","password":"Ab1@"}` | Status 400, message: "Password must be at least 8 characters" | Không tạo tài khoản | | | |
| AUTH-011 | Register - Password weak (no uppercase) | Password thiếu chữ hoa | 1. POST `/api/auth/register` với password yếu | `{"full_name":"Test","email":"new@wanderly.com","password":"test@1234"}` | Status 400, message: "Password must include uppercase, lowercase, number, and special character" | Không tạo tài khoản | | | |
| AUTH-012 | Register - Password weak (no lowercase) | Password thiếu chữ thường | 1. POST `/api/auth/register` | `{"full_name":"Test","email":"new@wanderly.com","password":"TEST@1234"}` | Status 400, message chứa "uppercase, lowercase, number, and special character" | Không tạo tài khoản | | | |
| AUTH-013 | Register - Password weak (no number) | Password thiếu số | 1. POST `/api/auth/register` | `{"full_name":"Test","email":"new@wanderly.com","password":"Test@abcd"}` | Status 400, validation error | Không tạo tài khoản | | | |
| AUTH-014 | Register - Password weak (no special char) | Password thiếu ký tự đặc biệt | 1. POST `/api/auth/register` | `{"full_name":"Test","email":"new@wanderly.com","password":"Test1234a"}` | Status 400, validation error | Không tạo tài khoản | | | |
| AUTH-015 | Register - Invalid role | Role không hợp lệ | 1. POST `/api/auth/register` với role sai | `{"full_name":"Test","email":"new@wanderly.com","password":"Test@1234","role":"superadmin"}` | Status 400, message: "Role is invalid" | Không tạo tài khoản | | | |
| AUTH-016 | Register - Default role | Không truyền role sẽ mặc định là traveler | 1. POST `/api/auth/register` không truyền role | `{"full_name":"Test","email":"default@wanderly.com","password":"Test@1234"}` | Status 201, user.role = "traveler" | Tài khoản tạo với role traveler | | | |
| AUTH-017 | Register - Empty body | Body rỗng | 1. POST `/api/auth/register` với body `{}` | `{}` | Status 400, validation errors cho full_name, email, password | Không tạo tài khoản | | | |
| AUTH-018 | Login - Valid credentials | Đăng nhập thành công | 1. POST `/api/auth/login` với thông tin hợp lệ | `{"email":"existing@wanderly.com","password":"Test@1234"}` | Status 200, `success: true`, trả về `{ user, tokens }`, tokens chứa access.token & refresh.token | accessToken & refreshToken được cấp | | | |
| AUTH-019 | Login - Wrong password | Sai mật khẩu | 1. POST `/api/auth/login` với password sai | `{"email":"existing@wanderly.com","password":"WrongPass@1"}` | Status 401, message: "Invalid email or password" | Không cấp token | | | |
| AUTH-020 | Login - Non-existent email | Email không tồn tại | 1. POST `/api/auth/login` với email chưa đăng ký | `{"email":"nonexist@wanderly.com","password":"Test@1234"}` | Status 401, message: "Invalid email or password" | Không cấp token | | | |
| AUTH-021 | Login - Missing email | Thiếu email | 1. POST `/api/auth/login` không có email | `{"password":"Test@1234"}` | Status 400, message: "Email is required" | Không cấp token | | | |
| AUTH-022 | Login - Missing password | Thiếu password | 1. POST `/api/auth/login` không có password | `{"email":"existing@wanderly.com"}` | Status 400, message: "Password is required" | Không cấp token | | | |
| AUTH-023 | Login - Invalid email format | Email sai định dạng | 1. POST `/api/auth/login` | `{"email":"invalid-format","password":"Test@1234"}` | Status 400, message: "Email must be a valid email address" | Không cấp token | | | |
| AUTH-024 | Login - Soft-deleted user | Đăng nhập bằng tài khoản đã bị xóa mềm | 1. POST `/api/auth/login` với user có is_deleted=true | `{"email":"deleted@wanderly.com","password":"Test@1234"}` | Status 401, message: "Invalid email or password" | Không cấp token | | | |
| AUTH-025 | Get Me - Valid token | Lấy thông tin user hiện tại | 1. Đăng nhập lấy token 2. GET `/api/auth/me` với Bearer token | Header: `Authorization: Bearer <valid_access_token>` | Status 200, `success: true`, trả về thông tin user không chứa password_hash | | | | |
| AUTH-026 | Get Me - No token | Không có token | 1. GET `/api/auth/me` không truyền header | Không có Authorization header | Status 401, message: "Access token is required" | | | | |
| AUTH-027 | Get Me - Invalid token | Token không hợp lệ | 1. GET `/api/auth/me` với token sai | Header: `Authorization: Bearer invalidtoken123` | Status 401, message: "Invalid access token" | | | | |
| AUTH-028 | Get Me - Expired token | Token đã hết hạn | 1. GET `/api/auth/me` với token expired | Header: `Authorization: Bearer <expired_token>` | Status 401, message: "Access token has expired" | | | | |
| AUTH-029 | Refresh Token - Valid | Làm mới token thành công | 1. Đăng nhập lấy refreshToken 2. POST `/api/auth/refresh-token` | `{"refreshToken":"<valid_refresh_token>"}` | Status 200, trả về cặp tokens mới (access + refresh) | Token cũ vẫn hợp lệ (stateless JWT) | | | |
| AUTH-030 | Refresh Token - Missing | Thiếu refreshToken | 1. POST `/api/auth/refresh-token` body rỗng | `{}` | Status 400, message: "Refresh token is required" | | | | |
| AUTH-031 | Refresh Token - Invalid | refreshToken không hợp lệ | 1. POST `/api/auth/refresh-token` | `{"refreshToken":"invalidtoken"}` | Status 401, message: "Invalid token" | | | | |
| AUTH-032 | Logout - Valid | Đăng xuất thành công | 1. Đăng nhập lấy token 2. POST `/api/auth/logout` với Bearer token | Header: `Authorization: Bearer <valid_access_token>` | Status 200, message: "Logged out successfully" | Client xóa token khỏi localStorage | | | |
| AUTH-033 | Logout - No token | Đăng xuất không có token | 1. POST `/api/auth/logout` không truyền token | Không có Authorization header | Status 401, message: "Access token is required" | | | | |

---

## Module 2: Profile

**Module Name:** Module_Profile

### Pre-condition
- User đã đăng nhập thành công và có `accessToken` hợp lệ
- User hiện tại có thông tin: `full_name: "Test User"`, `phone_number: null`, `avatar: null`

---

| Test Case# | Test Title/Scenario | Test Summary | Test Steps | Test Data | Expected Result | Post-condition | Actual Result | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|
| PROF-001 | Get Profile - Valid | Lấy thông tin profile thành công | 1. GET `/api/profile` với Bearer token | Header: `Authorization: Bearer <token>` | Status 200, trả về user info, không chứa password_hash, verify_token, reset_pass_token, token_expiry | | | | |
| PROF-002 | Get Profile - No token | Lấy profile không có token | 1. GET `/api/profile` không có header | Không có Authorization header | Status 401, message: "Access token is required" | | | | |
| PROF-003 | Get Profile - Invalid token | Token không hợp lệ | 1. GET `/api/profile` với token sai | Header: `Authorization: Bearer faketoken` | Status 401, message: "Invalid access token" | | | | |
| PROF-004 | Update Profile - full_name | Cập nhật tên thành công | 1. PUT `/api/profile` với full_name mới | `{"full_name":"Nguyen Van B"}` + Bearer token | Status 200, message: "Profile updated successfully", data.full_name = "Nguyen Van B" | full_name trong DB được cập nhật | | | |
| PROF-005 | Update Profile - phone_number | Cập nhật SĐT thành công | 1. PUT `/api/profile` với phone_number | `{"phone_number":"0912345678"}` + Bearer token | Status 200, data.phone_number = "0912345678" | phone_number trong DB được cập nhật | | | |
| PROF-006 | Update Profile - avatar URL | Cập nhật avatar thành công | 1. PUT `/api/profile` với avatar URI | `{"avatar":"https://example.com/avatar.jpg"}` + Bearer token | Status 200, data.avatar = URL đã truyền | avatar trong DB được cập nhật | | | |
| PROF-007 | Update Profile - full_name quá dài | full_name > 255 ký tự | 1. PUT `/api/profile` | `{"full_name":"A...256chars..."}` + Bearer token | Status 400, validation error | Profile không thay đổi | | | |
| PROF-008 | Update Profile - phone_number quá dài | phone_number > 20 ký tự | 1. PUT `/api/profile` | `{"phone_number":"012345678901234567890"}` + Bearer token | Status 400, validation error | Profile không thay đổi | | | |
| PROF-009 | Update Profile - avatar không phải URI | avatar sai format | 1. PUT `/api/profile` | `{"avatar":"not-a-url"}` + Bearer token | Status 400, validation error | Profile không thay đổi | | | |
| PROF-010 | Update Profile - Clear phone_number | Xóa SĐT (set null) | 1. PUT `/api/profile` | `{"phone_number":null}` + Bearer token | Status 200, data.phone_number = null | phone_number trong DB là null | | | |
| PROF-011 | Update Profile - Clear avatar | Xóa avatar (set empty) | 1. PUT `/api/profile` | `{"avatar":""}` + Bearer token | Status 200, data.avatar = "" | avatar trong DB là empty | | | |
| PROF-012 | Update Profile - Multiple fields | Cập nhật nhiều trường cùng lúc | 1. PUT `/api/profile` | `{"full_name":"New Name","phone_number":"0987654321","avatar":"https://img.com/a.png"}` + Bearer token | Status 200, tất cả trường đều được cập nhật | | | | |
| PROF-013 | Update Profile - Empty body | Body rỗng | 1. PUT `/api/profile` với body `{}` | `{}` + Bearer token | Status 200 (không lỗi, không thay đổi gì) | Profile giữ nguyên | | | |
| PROF-014 | Update Profile - No token | Không có token | 1. PUT `/api/profile` | `{"full_name":"Hacker"}` (không có Bearer) | Status 401, message: "Access token is required" | Profile không thay đổi | | | |
| PROF-015 | Change Password - Valid | Đổi mật khẩu thành công | 1. PUT `/api/profile/change-password` | `{"oldPassword":"Test@1234","newPassword":"NewPass@5678"}` + Bearer token | Status 200, message: "Password changed successfully" | Đăng nhập lại bằng mật khẩu mới thành công | | | |
| PROF-016 | Change Password - Wrong old password | Nhập sai mật khẩu cũ | 1. PUT `/api/profile/change-password` | `{"oldPassword":"WrongOld@1","newPassword":"NewPass@5678"}` + Bearer token | Status 400, message: "Incorrect old password" | Password không đổi | | | |
| PROF-017 | Change Password - Missing oldPassword | Thiếu mật khẩu cũ | 1. PUT `/api/profile/change-password` | `{"newPassword":"NewPass@5678"}` + Bearer token | Status 400, validation error | Password không đổi | | | |
| PROF-018 | Change Password - Missing newPassword | Thiếu mật khẩu mới | 1. PUT `/api/profile/change-password` | `{"oldPassword":"Test@1234"}` + Bearer token | Status 400, message: "New password is required" | Password không đổi | | | |
| PROF-019 | Change Password - New password too short | Mật khẩu mới < 8 ký tự | 1. PUT `/api/profile/change-password` | `{"oldPassword":"Test@1234","newPassword":"Ab1@"}` + Bearer token | Status 400, message: "Password must be at least 8 characters" | Password không đổi | | | |
| PROF-020 | Change Password - New password weak | Mật khẩu mới yếu | 1. PUT `/api/profile/change-password` | `{"oldPassword":"Test@1234","newPassword":"testtest"}` + Bearer token | Status 400, message chứa "uppercase, lowercase, number, and special character" | Password không đổi | | | |
| PROF-021 | Change Password - No token | Không có token | 1. PUT `/api/profile/change-password` | `{"oldPassword":"Test@1234","newPassword":"NewPass@5678"}` (không Bearer) | Status 401 | Password không đổi | | | |

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
| PROV-001 | Create Property - Valid resort | Tạo property resort thành công | 1. POST `/api/properties` với Bearer provider | `{"name":"Beach Resort","property_type":"resort","address":"123 Coastal Rd","latitude":10.762,"longitude":106.660,"check_in_time":"14:00","check_out_time":"12:00"}` | Status 201, message: "Property created successfully" | Property mới trong DB | | | |
| PROV-002 | Create Property - Valid hotel | Tạo property hotel | 1. POST `/api/properties` | `{"name":"City Hotel","property_type":"hotel","address":"456 St","latitude":21.028,"longitude":105.854,"check_in_time":"15:00","check_out_time":"11:00"}` | Status 201, data.property_type = "hotel" | | | | |
| PROV-003 | Create Property - Valid homestay | Tạo homestay | 1. POST `/api/properties` | `{"name":"Cozy Homestay","property_type":"homestay","address":"78 Rd","latitude":16.047,"longitude":108.206,"check_in_time":"13:00","check_out_time":"10:00"}` | Status 201 | | | | |
| PROV-004 | Create Property - Valid villa | Tạo villa | 1. POST `/api/properties` | `{"name":"Luxury Villa","property_type":"villa","address":"1 Hill","latitude":11.94,"longitude":108.458,"check_in_time":"14:00","check_out_time":"12:00"}` | Status 201 | | | | |
| PROV-005 | Create Property - Missing name | Thiếu tên | 1. POST `/api/properties` | `{"property_type":"hotel","address":"Addr","latitude":10,"longitude":106,"check_in_time":"14:00","check_out_time":"12:00"}` | Status 400, "Property name is required" | Không tạo | | | |
| PROV-006 | Create Property - Name > 100 chars | Tên quá dài | 1. POST `/api/properties` | name = 101 ký tự | Status 400, "Property name cannot exceed 100 characters" | Không tạo | | | |
| PROV-007 | Create Property - Invalid type | property_type sai | 1. POST `/api/properties` | `{"name":"T","property_type":"apartment",...}` | Status 400, "Property type must be one of: hotel, homestay, resort, villa" | Không tạo | | | |
| PROV-008 | Create Property - Missing address | Thiếu địa chỉ | 1. POST `/api/properties` | Không có field address | Status 400, "Address is required" | Không tạo | | | |
| PROV-009 | Create Property - Latitude > 90 | Vĩ độ ngoài phạm vi | 1. POST `/api/properties` | `{"latitude":91,...}` | Status 400, "Latitude must be between -90 and 90" | Không tạo | | | |
| PROV-010 | Create Property - Longitude > 180 | Kinh độ ngoài phạm vi | 1. POST `/api/properties` | `{"longitude":181,...}` | Status 400, "Longitude must be between -180 and 180" | Không tạo | | | |
| PROV-011 | Create Property - Invalid time format | Sai format giờ check-in | 1. POST `/api/properties` | `{"check_in_time":"2PM",...}` | Status 400, "Check-in time must be in HH:MM format (24h)" | Không tạo | | | |
| PROV-012 | Create Property - Traveler role | Traveler cố tạo | 1. POST `/api/properties` với Bearer traveler | Body hợp lệ + Bearer traveler | Status 403, "You do not have permission" | Không tạo | | | |
| PROV-013 | Get Properties - Public | Danh sách public | 1. GET `/api/properties` (no auth) | Không cần header | Status 200, `{ properties, pagination }` | | | | |
| PROV-014 | Get Properties - Filter type | Lọc theo loại | 1. GET `/api/properties?property_type=hotel` | Query: property_type=hotel | Status 200, tất cả items type=hotel | | | | |
| PROV-015 | Get Properties - Search keyword | Tìm theo tên | 1. GET `/api/properties?keyword=Sunrise` | Query: keyword=Sunrise | Status 200, kết quả có "Sunrise" | | | | |
| PROV-016 | Get Properties - Search location | Tìm theo địa chỉ | 1. GET `/api/properties?location=Coastal` | Query: location=Coastal | Status 200, kết quả chứa "Coastal" | | | | |
| PROV-017 | Get Properties - Pagination | Phân trang | 1. GET `/api/properties?page=1&limit=5` | Query: page=1, limit=5 | Status 200, max 5 items, pagination đầy đủ | | | | |
| PROV-018 | Get Properties - Provider view | Provider xem DS property của mình | 1. GET `/api/properties` với Bearer provider | Bearer token provider (no query) | Status 200, mảng properties của provider có Room_Types & Rooms | | | | |
| PROV-019 | Get Property Detail - Valid | Xem chi tiết | 1. GET `/api/properties/1` | id=1 | Status 200, property + Room_Types + Users | | | | |
| PROV-020 | Get Property Detail - Not found | ID không tồn tại | 1. GET `/api/properties/99999` | id=99999 | Status 404, "Property not found" | | | | |
| PROV-021 | Get Property Detail - Soft deleted | Đã bị xóa mềm | 1. GET `/api/properties/<deleted_id>` | id = soft-deleted | Status 404, "Property not found" | | | | |
| PROV-022 | Update Property - Valid | Cập nhật thành công | 1. PUT `/api/properties/1` với Bearer owner | `{"name":"Sunrise Beach Hotel"}` | Status 200, "Property updated successfully" | DB cập nhật | | | |
| PROV-023 | Update Property - Not owner | Provider khác cố sửa | 1. PUT `/api/properties/1` với Bearer provider2 | `{"name":"Hacked"}` | Status 403, "You do not have permission to update" | Không đổi | | | |
| PROV-024 | Update Property - Traveler | Traveler cố sửa | 1. PUT `/api/properties/1` với Bearer traveler | `{"name":"Hacked"}` | Status 403 | Không đổi | | | |
| PROV-025 | Delete Property - Soft Delete | Xóa mềm thành công | 1. DELETE `/api/properties/1` với Bearer owner | Bearer token owner | Status 200, cascade soft-delete Property, Room_Types, Rooms | is_deleted=true cho tất cả | | | |
| PROV-026 | Delete Property - Not owner | Provider khác cố xóa | 1. DELETE `/api/properties/1` với Bearer provider2 | Bearer provider2 | Status 403, "You do not have permission to delete" | Không xóa | | | |
| PROV-027 | Get Room Types - Valid | Lấy DS room types | 1. GET `/api/properties/1/room-types` | propertyId=1 | Status 200, mảng room types sorted by base_price ASC | | | | |
| PROV-028 | Get Room Types - Availability check | Kiểm tra phòng trống | 1. GET `/api/properties/1/room-types?check_in_date=2026-07-01&check_out_date=2026-07-03` | Dates query | Status 200, mỗi room type có `available_quantity` | | | | |
| PROV-029 | Get Room Types - Property not found | Property không tồn tại | 1. GET `/api/properties/99999/room-types` | propertyId=99999 | Status 404, "Property not found" | | | | |
| PROV-030 | Create Room Type - Valid | Tạo room type mới | 1. POST `/api/properties/1/room-types` với Bearer provider | `{"name":"Superior","max_guests":3,"base_price":750000,"amenities":"WiFi, TV"}` | Status 201 | Room type mới trong DB | | | |
| PROV-031 | Create Room Type - Missing name | Thiếu tên | 1. POST `/api/properties/1/room-types` | `{"max_guests":2,"base_price":500000}` | Status 400, "Room type name is required" | Không tạo | | | |
| PROV-032 | Create Room Type - Name > 50 chars | Tên quá dài | 1. POST `/api/properties/1/room-types` | name = 51 ký tự | Status 400, "Room type name cannot exceed 50 characters" | Không tạo | | | |
| PROV-033 | Create Room Type - max_guests = 0 | Số khách = 0 | 1. POST `/api/properties/1/room-types` | `{"name":"T","max_guests":0,"base_price":500000}` | Status 400, "Max guests must be greater than 0" | Không tạo | | | |
| PROV-034 | Create Room Type - max_guests > 20 | Số khách > 20 | 1. POST `/api/properties/1/room-types` | `{"name":"T","max_guests":21,"base_price":500000}` | Status 400, "Max guests cannot exceed 20 people" | Không tạo | | | |
| PROV-035 | Create Room Type - base_price = 0 | Giá = 0 | 1. POST `/api/properties/1/room-types` | `{"name":"T","max_guests":2,"base_price":0}` | Status 400, "Base price must be greater than 0" | Không tạo | | | |
| PROV-036 | Create Room Type - Negative price | Giá âm | 1. POST `/api/properties/1/room-types` | `{"name":"T","max_guests":2,"base_price":-100}` | Status 400, "Base price must be greater than 0" | Không tạo | | | |

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
| ADM-001 | Get Users - Default | Lấy danh sách users mặc định | 1. GET `/api/users` với Bearer admin | Header: Bearer admin token | Status 200, trả về `{ users, pagination }`, users không chứa password_hash | | | | |
| ADM-002 | Get Users - Pagination | Phân trang | 1. GET `/api/users?page=1&limit=2` | Query: page=1, limit=2 | Status 200, tối đa 2 users, pagination.page=1, pagination.limit=2 | | | | |
| ADM-003 | Get Users - Filter role traveler | Lọc theo role | 1. GET `/api/users?role=traveler` | Query: role=traveler | Status 200, tất cả users có role=traveler | | | | |
| ADM-004 | Get Users - Filter role provider | Lọc provider | 1. GET `/api/users?role=provider` | Query: role=provider | Status 200, tất cả users có role=provider | | | | |
| ADM-005 | Get Users - Filter role admin | Lọc admin | 1. GET `/api/users?role=admin` | Query: role=admin | Status 200, tất cả users có role=admin | | | | |
| ADM-006 | Get Users - Search by email | Tìm theo email | 1. GET `/api/users?search=existing` | Query: search=existing | Status 200, kết quả chứa user có email match | | | | |
| ADM-007 | Get Users - Search by name | Tìm theo tên | 1. GET `/api/users?search=Nguyen` | Query: search=Nguyen | Status 200, kết quả chứa user có full_name match | | | | |
| ADM-008 | Get Users - Exclude soft-deleted | Không hiển thị user đã xóa mềm | 1. GET `/api/users` | Bearer admin | Status 200, danh sách không chứa user có is_deleted=true | | | | |
| ADM-009 | Get Users - Traveler access | Traveler cố truy cập | 1. GET `/api/users` với Bearer traveler | Bearer traveler token | Status 403, "You do not have permission" | | | | |
| ADM-010 | Get Users - Provider access | Provider cố truy cập | 1. GET `/api/users` với Bearer provider | Bearer provider token | Status 403, "You do not have permission" | | | | |
| ADM-011 | Get Users - No token | Không có token | 1. GET `/api/users` | Không header | Status 401, "Access token is required" | | | | |
| ADM-012 | Get User by ID - Valid | Xem chi tiết user | 1. GET `/api/users/<valid_id>` | URL param: id hợp lệ | Status 200, trả về user info không có password_hash | | | | |
| ADM-013 | Get User by ID - Not found | ID không tồn tại | 1. GET `/api/users/99999` | URL param: id=99999 | Status 404, "User not found" | | | | |
| ADM-014 | Get User by ID - Soft deleted | User đã bị xóa mềm | 1. GET `/api/users/<deleted_user_id>` | URL param: id đã xóa mềm | Status 404, "User not found" | | | | |
| ADM-015 | Update Role - To provider | Đổi role thành provider | 1. PUT `/api/users/<traveler_id>/role` | `{"role":"provider"}` + Bearer admin | Status 200, "User role updated successfully", data.role="provider" | Role cập nhật trong DB | | | |
| ADM-016 | Update Role - To admin | Đổi role thành admin | 1. PUT `/api/users/<traveler_id>/role` | `{"role":"admin"}` + Bearer admin | Status 200, data.role="admin" | Role cập nhật | | | |
| ADM-017 | Update Role - To traveler | Đổi role thành traveler | 1. PUT `/api/users/<provider_id>/role` | `{"role":"traveler"}` + Bearer admin | Status 200, data.role="traveler" | Role cập nhật | | | |
| ADM-018 | Update Role - Invalid role | Role không hợp lệ | 1. PUT `/api/users/<id>/role` | `{"role":"superadmin"}` + Bearer admin | Status 400, "Role must be either traveler, provider, or admin" | Role không đổi | | | |
| ADM-019 | Update Role - Missing role | Thiếu trường role | 1. PUT `/api/users/<id>/role` | `{}` + Bearer admin | Status 400, "Role is required" | Role không đổi | | | |
| ADM-020 | Update Role - Soft-deleted user | Cố sửa user đã xóa | 1. PUT `/api/users/<deleted_user_id>/role` | `{"role":"provider"}` + Bearer admin | Status 404, "User not found" | Không thay đổi | | | |
| ADM-021 | Update Role - Non-admin access | Traveler cố đổi role | 1. PUT `/api/users/<id>/role` với Bearer traveler | `{"role":"admin"}` + Bearer traveler | Status 403 | Không đổi | | | |
| ADM-022 | Delete User - Soft delete | Xóa mềm user thành công | 1. DELETE `/api/users/<valid_id>` với Bearer admin | URL param: id hợp lệ | Status 200, "User deleted successfully" | User.is_deleted = true trong DB | | | |
| ADM-023 | Delete User - Not found | ID không tồn tại | 1. DELETE `/api/users/99999` | URL param: id=99999 | Status 404, "User not found" | | | | |
| ADM-024 | Delete User - Already deleted | User đã bị xóa trước đó | 1. DELETE `/api/users/<deleted_user_id>` | URL param: id đã xóa mềm | Status 404, "User not found" | | | | |
| ADM-025 | Delete User - Non-admin access | Traveler cố xóa user | 1. DELETE `/api/users/<id>` với Bearer traveler | Bearer traveler | Status 403 | Không xóa | | | |
| ADM-026 | Admin Login UI - Valid credentials | Đăng nhập Admin panel thành công | 1. Mở `http://localhost:5173/admin/login` 2. Nhập email/password admin 3. Click Sign In | Email: admin@test.com, Password: Test@1234 | Chuyển hướng đến `/admin/dashboard`, hiển thị Dashboard | Token lưu trong localStorage | | | |
| ADM-027 | Admin Login UI - Non-admin user | Traveler cố đăng nhập Admin | 1. Mở `/admin/login` 2. Nhập thông tin traveler 3. Click Sign In | Email: traveler@test.com, Password: Test@1234 | Toast error: "You do not have admin privileges", không redirect | Không lưu token | | | |
| ADM-028 | Admin Login UI - Wrong password | Sai mật khẩu | 1. Mở `/admin/login` 2. Nhập sai password 3. Click Sign In | Email: admin@test.com, Password: WrongPass | Toast error: "Login failed" | | | | |
| ADM-029 | Admin Protected Route - No token | Truy cập Dashboard không đăng nhập | 1. Clear localStorage 2. Truy cập `http://localhost:5173/admin/dashboard` | Không có token | Tự động redirect về `/admin/login`, không hiện màn trắng | | | | |
| ADM-030 | Admin Theme Toggle | Chuyển đổi sáng/tối | 1. Đăng nhập Admin 2. Click icon theme ở Header | Click toggle icon | Giao diện chuyển giữa light/dark mode, preference lưu vào localStorage('adminTheme') | | | | |

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
| BOOK-001 | Create Booking - Valid | Tạo booking thành công | 1. POST `/api/bookings` với Bearer traveler | `{"property_id":1,"check_in_date":"2026-08-01","check_out_date":"2026-08-03","rooms":[{"room_type_id":1,"quantity":2}]}` | Status 201, "Booking created successfully", total_price = 500000 × 2 × 2 = 2000000, status="pending" | Booking + Booking_Details tạo trong DB | | | |
| BOOK-002 | Create Booking - Multiple room types | Đặt nhiều loại phòng | 1. POST `/api/bookings` | `{"property_id":1,"check_in_date":"2026-09-01","check_out_date":"2026-09-02","rooms":[{"room_type_id":1,"quantity":1},{"room_type_id":2,"quantity":1}]}` | Status 201, total_price tính đúng cho cả 2 room types × 1 đêm | Booking_Details có 2 records | | | |
| BOOK-003 | Create Booking - Missing property_id | Thiếu property_id | 1. POST `/api/bookings` | `{"check_in_date":"2026-08-01","check_out_date":"2026-08-03","rooms":[{"room_type_id":1,"quantity":1}]}` | Status 400, "Property ID is required" | Không tạo | | | |
| BOOK-004 | Create Booking - Invalid property_id | property_id không tồn tại | 1. POST `/api/bookings` | `{"property_id":99999,"check_in_date":"2026-08-01","check_out_date":"2026-08-03","rooms":[{"room_type_id":1,"quantity":1}]}` | Status 404, "Property not found" | Không tạo | | | |
| BOOK-005 | Create Booking - Missing check_in_date | Thiếu ngày check-in | 1. POST `/api/bookings` | `{"property_id":1,"check_out_date":"2026-08-03","rooms":[{"room_type_id":1,"quantity":1}]}` | Status 400, "Check-in date is required" | Không tạo | | | |
| BOOK-006 | Create Booking - Missing check_out_date | Thiếu ngày check-out | 1. POST `/api/bookings` | `{"property_id":1,"check_in_date":"2026-08-01","rooms":[{"room_type_id":1,"quantity":1}]}` | Status 400, "Check-out date is required" | Không tạo | | | |
| BOOK-007 | Create Booking - checkout <= checkin | Check-out trước check-in | 1. POST `/api/bookings` | `{"property_id":1,"check_in_date":"2026-08-05","check_out_date":"2026-08-03","rooms":[{"room_type_id":1,"quantity":1}]}` | Status 400, "Check-out date must be after check-in date" | Không tạo | | | |
| BOOK-008 | Create Booking - Same day in/out | Check-in = Check-out | 1. POST `/api/bookings` | `{"property_id":1,"check_in_date":"2026-08-01","check_out_date":"2026-08-01","rooms":[{"room_type_id":1,"quantity":1}]}` | Status 400, "Check-out date must be after check-in date" | Không tạo | | | |
| BOOK-009 | Create Booking - Missing rooms array | Thiếu rooms | 1. POST `/api/bookings` | `{"property_id":1,"check_in_date":"2026-08-01","check_out_date":"2026-08-03"}` | Status 400, "At least one room selection is required" | Không tạo | | | |
| BOOK-010 | Create Booking - Empty rooms array | rooms rỗng | 1. POST `/api/bookings` | `{...,"rooms":[]}` | Status 400, "At least one room selection is required" | Không tạo | | | |
| BOOK-011 | Create Booking - Invalid room_type_id | room_type không thuộc property | 1. POST `/api/bookings` | `{...,"rooms":[{"room_type_id":9999,"quantity":1}]}` | Status 400, "Room type with ID 9999 does not belong to this property" | Không tạo | | | |
| BOOK-012 | Create Booking - Not enough rooms | Đặt quá số phòng trống | 1. POST `/api/bookings` | `{...,"rooms":[{"room_type_id":1,"quantity":100}]}` | Status 400, "Not enough rooms available" | Không tạo | | | |
| BOOK-013 | Create Booking - quantity = 0 | Số lượng = 0 | 1. POST `/api/bookings` | `{...,"rooms":[{"room_type_id":1,"quantity":0}]}` | Status 400, "Quantity must be at least 1" | Không tạo | | | |
| BOOK-014 | Create Booking - Provider role | Provider cố đặt phòng | 1. POST `/api/bookings` với Bearer provider | Body hợp lệ + Bearer provider | Status 403, "You do not have permission" | Không tạo | | | |
| BOOK-015 | Create Booking - No token | Không có token | 1. POST `/api/bookings` | Body hợp lệ, không header | Status 401, "Access token is required" | Không tạo | | | |
| BOOK-016 | Get My Bookings - Default | Traveler xem lịch sử booking | 1. GET `/api/bookings/my-bookings` với Bearer traveler | Bearer traveler token | Status 200, trả về `{ bookings, pagination }`, bookings chỉ chứa của traveler hiện tại | | | | |
| BOOK-017 | Get My Bookings - Filter status | Lọc theo trạng thái | 1. GET `/api/bookings/my-bookings?status=pending` | Query: status=pending | Status 200, tất cả bookings có status=pending | | | | |
| BOOK-018 | Get My Bookings - Pagination | Phân trang | 1. GET `/api/bookings/my-bookings?page=1&limit=5` | Query: page=1, limit=5 | Status 200, max 5 items, pagination đầy đủ | | | | |
| BOOK-019 | Get My Bookings - No token | Không có token | 1. GET `/api/bookings/my-bookings` | Không header | Status 401 | | | | |
| BOOK-020 | Get Provider Bookings - Valid | Provider xem đơn đặt phòng | 1. GET `/api/bookings/provider-bookings` với Bearer provider | Bearer provider token | Status 200, trả về `{ bookings, pagination, stats }`, stats gồm pending/confirmed/cancelled/completed | | | | |
| BOOK-021 | Get Provider Bookings - Filter status | Lọc theo trạng thái | 1. GET `/api/bookings/provider-bookings?status=pending` | Query: status=pending | Status 200, tất cả bookings có status=pending | | | | |
| BOOK-022 | Get Provider Bookings - Traveler access | Traveler cố truy cập | 1. GET `/api/bookings/provider-bookings` với Bearer traveler | Bearer traveler | Status 403, "You do not have permission" | | | | |
| BOOK-023 | Get Booking Detail - Owner | Traveler xem booking của mình | 1. GET `/api/bookings/1` với Bearer traveler (owner) | Bearer traveler (owner of booking 1) | Status 200, trả về booking detail đầy đủ với Users, Properties, Booking_Details | | | | |
| BOOK-024 | Get Booking Detail - Provider | Provider xem booking của property mình | 1. GET `/api/bookings/1` với Bearer provider (owner of property) | Bearer provider | Status 200, trả về booking detail | | | | |
| BOOK-025 | Get Booking Detail - Admin | Admin xem bất kỳ booking | 1. GET `/api/bookings/1` với Bearer admin | Bearer admin | Status 200, trả về booking detail | | | | |
| BOOK-026 | Get Booking Detail - Unauthorized | Traveler2 xem booking của traveler1 | 1. GET `/api/bookings/1` với Bearer traveler2 | Bearer traveler2 (not owner) | Status 403, "You do not have permission to view this booking" | | | | |
| BOOK-027 | Get Booking Detail - Not found | Booking không tồn tại | 1. GET `/api/bookings/99999` | id=99999 | Status 404, "Booking not found" | | | | |
| BOOK-028 | Update Status - Confirm | Provider duyệt booking | 1. PUT `/api/bookings/1/status` với Bearer provider | `{"status":"confirmed"}` + Bearer provider (property owner) | Status 200, "Booking confirmed successfully", data.status="confirmed" | Status cập nhật trong DB | | | |
| BOOK-029 | Update Status - Cancel | Provider hủy booking | 1. PUT `/api/bookings/<pending_id>/status` | `{"status":"cancelled"}` + Bearer provider | Status 200, "Booking cancelled successfully" | Status = cancelled | | | |
| BOOK-030 | Update Status - Invalid status | Status không hợp lệ | 1. PUT `/api/bookings/1/status` | `{"status":"completed"}` + Bearer provider | Status 400, "Status must be either confirmed or cancelled" | Status không đổi | | | |
| BOOK-031 | Update Status - Missing status | Thiếu status | 1. PUT `/api/bookings/1/status` | `{}` + Bearer provider | Status 400, "Status is required" | Status không đổi | | | |
| BOOK-032 | Update Status - Not property owner | Provider khác cố duyệt | 1. PUT `/api/bookings/1/status` với Bearer provider2 | `{"status":"confirmed"}` + Bearer provider2 | Status 403, "You can only manage bookings for your own properties" | Status không đổi | | | |
| BOOK-033 | Update Status - Already cancelled | Cố cập nhật booking đã hủy | 1. PUT `/api/bookings/<cancelled_id>/status` | `{"status":"confirmed"}` + Bearer provider | Status 400, "Cannot update a cancelled booking" | | | | |
| BOOK-034 | Update Status - Already completed | Cố cập nhật booking đã hoàn thành | 1. PUT `/api/bookings/<completed_id>/status` | `{"status":"cancelled"}` + Bearer provider | Status 400, "Cannot update a completed booking" | | | | |
| BOOK-035 | Update Status - Booking not found | Booking không tồn tại | 1. PUT `/api/bookings/99999/status` | `{"status":"confirmed"}` + Bearer provider | Status 404, "Booking not found" | | | | |
| BOOK-036 | Update Status - Traveler access | Traveler cố duyệt booking | 1. PUT `/api/bookings/1/status` với Bearer traveler | `{"status":"confirmed"}` + Bearer traveler | Status 403, "You do not have permission" | Status không đổi | | | |

---
