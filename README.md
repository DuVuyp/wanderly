# 📘 Wanderly - Sổ tay phát triển (Project Log)

## 1. Tổng quan dự án

- **Tên ứng dụng:** Wanderly
- **Mô tả:** Nền tảng du lịch cho phép người dùng tìm kiếm & đặt phòng khách sạn, lên lịch trình du lịch, và quản lý chỗ nghỉ (dành cho chủ nhà/provider).
- **Đối tượng:** Khách du lịch (Traveler), Chủ khách sạn/Homestay (Provider), Quản trị viên (Admin).
- **Kiến trúc:** Monorepo gồm 3 phần — `server/` (Backend API), `client/` (Giao diện người dùng), `admin/` (Giao diện quản trị).

---

## 2. Công nghệ & Thư viện (Tech Stack)

### Backend (`server/`)

- **Runtime:** Node.js (>=20)
- **Framework:** Express 5
- **ORM:** Prisma (SQL Server)
- **Xác thực:** JWT (jsonwebtoken), bcryptjs
- **Validate:** Joi
- **Upload ảnh:** Cloudinary, Multer
- **Email:** Nodemailer
- **Thanh toán (Dự kiến):** Stripe
- **Monitoring (Dự kiến):** Sentry

### Frontend Client (`client/`)

- **Framework:** React 19 + Vite
- **Routing:** React Router DOM v7
- **Styling:** TailwindCSS 3
- **HTTP Client:** Axios + React Query (TanStack)
- **Form:** React Hook Form + Zod
- **UI Icons:** Lucide React
- **Toast:** Sonner

### Frontend Admin (`admin/`)

- **Framework:** React 19 + Vite
- **Routing:** React Router DOM v7
- **HTTP Client:** Axios + React Query (TanStack)
- **Form:** React Hook Form + Zod
- **UI Icons:** Lucide React

### Quản lý dự án & Kiểm thử (Management & QA)

- **Project Tracking:** Jira (Quản lý tiến độ vòng đời dự án, phân công Task, theo dõi Bug/Issue)
- **Test Management:** TestRail (Thiết kế kịch bản kiểm thử (Test Cases), quản lý và đánh giá quá trình test)
- **API Testing:** Postman (Dùng để test các endpoint Backend)
- **E2E Testing:** Playwright (Dùng để test giao diện và luồng nghiệp vụ trên trình duyệt)

---

## 3. Cơ sở dữ liệu (Database Schema)

Hệ thống sử dụng **SQL Server** với các bảng chính:

```text
Users              → Người dùng (traveler / provider / admin)
Properties         → Khách sạn, Homestay, Resort, Villa (do Provider tạo)
Room_Types         → Loại phòng trong mỗi Property
Rooms              → Phòng cụ thể thuộc loại phòng
Bookings           → Đơn đặt phòng (pending / confirmed / completed / cancelled)
Booking_Details    → Chi tiết đơn đặt (loại phòng, số lượng, giá)
Itineraries        → Lịch trình du lịch (draft / published / completed)
Itinerary_Locations→ Các địa điểm trong lịch trình
Itinerary_Notes    → Ghi chú trong lịch trình (checklist)
```

**Roles trong hệ thống:**

| Role       | Mô tả                                                             |
| :--------- | :----------------------------------------------------------------- |
| `traveler` | Người dùng thường — tìm kiếm, đặt phòng, lên lịch trình.         |
| `provider` | Chủ khách sạn — quản lý Property, Room, xem đơn đặt phòng.       |
| `admin`    | Quản trị viên — quản lý toàn bộ User, Property, Booking hệ thống. |

---

## 4. Kiến trúc thư mục

```text
wanderly/
│
├── server/                         # BACKEND API (Express + Prisma)
│   ├── prisma/
│   │   └── schema.prisma           # Định nghĩa model database
│   ├── src/
│   │   ├── config/                 # Cấu hình Prisma, env
│   │   ├── constants/              # Hằng số (roles, status)
│   │   ├── controllers/            # Xử lý request/response
│   │   ├── middlewares/            # Auth, validate, error handler
│   │   ├── routes/                 # Định nghĩa endpoint API
│   │   ├── services/               # Business logic & thao tác DB
│   │   ├── utils/                  # Hàm hỗ trợ (ApiError, catchAsync)
│   │   ├── validations/            # Rule validate input (Joi)
│   │   └── index.js                # Entry point
│   └── wanderly.sql                # Script khởi tạo database
│
├── client/                         # FRONTEND NGƯỜI DÙNG (React + Vite)
│   └── src/
│       ├── api/                    # Axios client & API calls
│       ├── pages/                  # Các trang (Login, Register, ...)
│       ├── assets/                 # Ảnh, icon
│       ├── App.jsx                 # Root component + Router
│       └── main.jsx                # Entry point
│
├── admin/                          # FRONTEND QUẢN TRỊ (React + Vite)
│   └── src/
│       ├── assets/                 # Ảnh, icon
│       ├── App.jsx                 # Root component
│       └── main.jsx                # Entry point
│
└── README.md                       # File này
```

### Luồng code Backend

Một request API đi theo luồng:

`route → middleware (validate/auth) → controller → service → database (Prisma)`

---

## 5. Danh sách Chức năng

### Nhóm cốt lõi (Core)

- Đăng ký / Đăng nhập / Quản lý phiên (JWT Access + Refresh Token).
- Quản lý Property (CRUD khách sạn, loại phòng, phòng) — dành cho Provider.
- Tìm kiếm & Đặt phòng — dành cho Traveler.
- Lên lịch trình du lịch (Itinerary) với bản đồ & ghi chú.
- Quản trị toàn hệ thống — dành cho Admin.

### Nhóm Mở rộng (Extended)

- Đánh giá & Nhận xét (Review) khách sạn.
- Upload ảnh khách sạn qua Cloudinary.
- Thanh toán trực tuyến (Stripe).
- Gửi email xác nhận / Reset mật khẩu (Nodemailer).
- Dashboard thống kê cho Admin.

---

## 6. Quy trình làm việc nhóm (Team Workflow)

Để đảm bảo hiệu suất và tránh xung đột mã nguồn (Merge Conflict) cho nhóm 4 người, toàn bộ thành viên cần tuân thủ nghiêm ngặt quy trình dưới đây.

### 6.1. Quy tắc đặt tên (Naming Conventions)

**1. Đặt tên Nhánh (Branch):**
Luôn viết chữ thường, không dấu, dùng dấu gạch ngang `-` để nối từ.

* Tính năng mới: `feature/ten-tinh-nang` (VD: `feature/property-crud`, `feature/booking-api`)
* Sửa lỗi: `bugfix/ten-loi` (VD: `bugfix/login-token-expired`)
* Cấu hình hệ thống: `config/ten-cau-hinh` (VD: `config/add-cloudinary`)

**2. Viết lời nhắn Commit (Commit Message):**
Bắt đầu bằng tiền tố phân loại, sau đó mô tả ngắn gọn.

* `feat:` Thêm tính năng mới. (VD: `feat: Hoàn thành API quản lý Property`)
* `fix:` Sửa lỗi. (VD: `fix: Sửa lỗi refresh token không hoạt động`)
* `ui:` Cập nhật giao diện. (VD: `ui: Hoàn thành trang danh sách khách sạn`)
* `refactor:` Viết lại code gọn hơn, không thay đổi chức năng.
* `docs:` Cập nhật tài liệu.

### 6.2. Vòng lặp công việc hàng ngày (Daily Routine)

**Bước 1: Đồng bộ code (CỰC KỲ QUAN TRỌNG)**

```bash
git checkout main
git pull origin main
```

**Bước 2: Tạo nhánh cá nhân để code**

```bash
git checkout -b feature/ten-task-cua-ban
```

**Bước 3: Code và kiểm tra liên tục**

* **Quy tắc Vàng:** Code bị lỗi đỏ màn hình / terminal thì tuyệt đối chưa được commit.
* Thường xuyên chạy `npm run dev` để kiểm tra.
* Chỉ sử dụng các constant, util đã khai báo trong `constants/`, `utils/`.

**Bước 4: Lưu và Đẩy code lên cuối ngày**

```bash
git add .
git commit -m "feat: Mô tả công việc đã làm hôm nay"
git push -u origin feature/ten-task-cua-ban
```

### 6.3. Quy trình Review và ghép code (Pull Request)

1. **Người code:** Lên GitHub, tạo Pull Request từ nhánh `feature/...` hướng vào nhánh `main`.
2. **Thông báo:** Nhắn vào group chat: *"Tôi đã tạo PR cho [mô tả], nhờ 1 bạn vào review!"*.
3. **Người Review:**
   * Xem các file code đã thay đổi.
   * Chạy thử trên máy (nếu cần).
   * Kiểm tra code có đúng chuẩn không, có file rác không.
   * Ổn → **Approve** + **Merge**. Chưa ổn → Comment yêu cầu sửa.
4. **Không tự Merge PR của chính mình.** Phải có ít nhất 1 người khác duyệt.

### 6.4. Xử lý sự cố (Merge Conflict)

1. **Không xóa file hay xóa nhánh.**
2. **Báo cáo:** Nhắn ngay vào group: *"Tôi bị conflict file ... với bạn ..."*.
3. **Giải quyết:** Mở file trong VS Code, chọn Accept Current/Incoming Change, thảo luận rồi commit lại.

### 6.5. Tiêu chuẩn hoàn thành một Task (Definition of Done)

- [ ] Ứng dụng chạy không lỗi ở Terminal (cả server lẫn client/admin).
- [ ] API trả về đúng format JSON: `{ success, message, data }`.
- [ ] **BẮT BUỘC:** Đã test các luồng API (thành công/thất bại) bằng **Postman**.
- [ ] **BẮT BUỘC:** Đã test luồng giao diện người dùng (nếu có) tự động bằng **Playwright**.
- [ ] UI responsive, không vỡ layout trên các kích thước màn hình.
- [ ] Đã dọn dẹp `console.log()` debug và code rác.
- [ ] Đã chạy `npm run lint` không có lỗi.

---

## 7. Hướng dẫn chạy dự án ở máy local

### 7.1. Chạy Backend

```bash
cd server
npm install
npx prisma generate
```

Tạo database bằng file `wanderly.sql`, cấu hình `.env` theo `.env.example`, sau đó:

```bash
npm run dev
```

### 7.2. Chạy Frontend Client

```bash
cd client
npm install
npm run dev
```

Client chạy tại `http://localhost:3000`.

### 7.3. Chạy Frontend Admin

```bash
cd admin
npm install
npm run dev
```

Admin chạy tại `http://localhost:5173`.

---

## Phân công công việc (Sprint 2 - API & UI)

**Quy tắc chung cho toàn SPRINT 2:**

* Trọng tâm của Sprint này là hoàn thiện tính năng Full-stack (Cả Backend API và Frontend UI).
* Không yêu cầu viết Playwright / Test tự động.
* Tuân thủ luồng Backend: `route` → `middleware (auth, validate)` → `controller` → `service` → `Prisma (DB)`.
* Tuân thủ luồng Frontend: `React Router` → `Pages` → `Axios Call API` → `Render UI`.
* **BẮT BUỘC:** Dùng **Postman** để test toàn bộ endpoint API đảm bảo JSON đầu ra chính xác trước khi ghép vào Frontend.
* **Code bị lỗi (crash server/màn hình trắng) tuyệt đối không được push lên.**

---

### 👨‍💻 Thành viên 1: Đăng ký / Đăng nhập (Auth)

**Mục tiêu:** Xây dựng nền tảng bảo mật và luồng đăng nhập, điều hướng người dùng cơ bản.

| Task (Việc cần làm) | Vị trí file cần thao tác | Hướng dẫn triển khai chi tiết |
| :--- | :--- | :--- |
| **1. Cập nhật Backend API Auth** | `server/src/controllers/authController.js`<br>`server/src/services/authService.js`<br>`server/src/routes/authRoutes.js` | **POST /api/auth/register**: Đã có sẵn nhưng cần đảm bảo validate password `>= 8` ký tự, check trùng email.<br>**POST /api/auth/login**: Đã có sẵn, cần test kĩ trường hợp sai email/password. |
| **2. Quản lý phiên Backend** | `server/src/controllers/authController.js` | **POST /api/auth/refresh-token**: Xử lý cấp lại token mới.<br>**POST /api/auth/logout**: API cho phép đăng xuất. |
| **3. Frontend: Giao diện Đăng ký** | `client/src/pages/Register.jsx` | Đã có UI, cần kiểm tra logic gọi `register` API qua axios, validate form (pass >= 8 ký tự, báo lỗi đúng). |
| **4. Frontend: Giao diện Đăng nhập** | `client/src/pages/Login.jsx` | Đã có UI, xử lý gọi `login` API, lưu `accessToken`, `refreshToken`, `user` vào `localStorage`. |
| **5. Điều hướng sau Đăng nhập** | `client/src/App.jsx`<br>`client/src/components/...` | Đọc thông tin role trong `localStorage.user`. Nếu role `traveler` → điều hướng vào trang chủ tìm khách sạn. Nếu `provider` → trang quản lý property. Xử lý nút Đăng xuất trên thanh điều hướng. |

---

### 👨‍💻 Thành viên 2: Quản lý hồ sơ cá nhân

**Mục tiêu:** Xây dựng tính năng cho phép người dùng tự cập nhật thông tin và đổi mật khẩu.

| Task (Việc cần làm) | Vị trí file cần thao tác | Hướng dẫn triển khai chi tiết |
| :--- | :--- | :--- |
| **1. Backend: API Upload Ảnh** | `server/src/controllers/uploadController.js`<br>`server/src/services/uploadService.js`<br>`server/src/routes/uploadRoutes.js` | Cài `cloudinary`, `multer`. **POST /api/upload**: Nhận form-data, upload lên Cloudinary, trả về URL. Có chặn upload file không phải ảnh hoặc file quá lớn. |
| **2. Backend: API Profile** | `server/src/controllers/profileController.js`<br>`server/src/services/profileService.js`<br>`server/src/routes/profileRoutes.js` | **PUT /api/profile**: Cập nhật thông tin (tên, sđt, avatar...). Lấy ID từ `req.user.id`. **PUT /api/profile/change-password**: So sánh `oldPassword`, hash `newPassword` (>= 8 kí tự). |
| **3. Frontend: Trang Hồ sơ (UI)** | `client/src/pages/Profile.jsx` | Xây dựng giao diện hiển thị thông tin user. Lấy thông tin từ `req.user.id` (thông qua API `GET /api/auth/me` đã có). Ngăn không cho xem/sửa người khác. |
| **4. Frontend: Form cập nhật** | `client/src/pages/Profile.jsx` | Form thay đổi Avatar (gọi API upload, hiển thị preview). Form sửa Tên/SĐT. |
| **5. Frontend: Đổi mật khẩu** | `client/src/pages/ChangePassword.jsx` | Giao diện nhập mật khẩu cũ/mới. Validate mật khẩu mới >= 8 ký tự. Đổi thành công thì đăng xuất tự động hoặc cập nhật lại phiên. |

---

### 👨‍💻 Thành viên 3: Quản lý cơ sở lưu trú (Provider)

**Mục tiêu:** Tính năng dành riêng cho chủ nhà (Provider) để đăng tin và quản lý phòng.

| Task (Việc cần làm) | Vị trí file cần thao tác | Hướng dẫn triển khai chi tiết |
| :--- | :--- | :--- |
| **1. Backend: API Properties** | `server/src/controllers/propertyController.js`<br>`server/src/services/propertyService.js`<br>`server/src/routes/propertyRoutes.js` | **POST, GET, PUT, DELETE /api/properties**: Quản lý khách sạn/resort. Bắt buộc nhận tọa độ (-90 đến 90 cho lat, -180 đến 180 cho lng), tên, địa chỉ. Provider không sửa được của người khác. **Lưu ý: API DELETE phải áp dụng xóa mềm (`is_deleted = true`).** |
| **2. Backend: API Room Types** | `server/src/controllers/roomTypeController.js`<br>`server/src/services/...` | **POST /api/properties/:propertyId/room-types**: Tạo loại phòng (đơn, đôi). Ràng buộc `max_guests` > 0, `base_price` > 0. |
| **3. Backend: API Rooms** | `server/src/controllers/roomController.js`<br>`server/src/services/...` | **POST /api/room-types/:roomTypeId/rooms**: Tạo các phòng vật lý (P101, P102). Quản lý status (available, maintenance). |
| **4. Frontend: Provider Dashboard** | `client/src/pages/provider/...` | Xây dựng khu vực quản lý riêng cho Provider (Traveler không vào được). Danh sách các Property của họ. |
| **5. Frontend: Thêm/Sửa Property & Phòng** | `client/src/pages/provider/...` | Giao diện Form thêm khách sạn mới. Giao diện thêm loại phòng và thêm số phòng tương ứng. Cho phép đổi trạng thái phòng (bảo trì). |

---

### 👨‍💻 Thành viên 4: Quản lý người dùng (Admin)

**Mục tiêu:** Xây dựng trang Admin panel độc lập phục vụ việc vận hành hệ thống.

| Task (Việc cần làm) | Vị trí file cần thao tác | Hướng dẫn triển khai chi tiết |
| :--- | :--- | :--- |
| **1. Backend: API Users (Admin)** | `server/src/controllers/userController.js`<br>`server/src/services/userService.js`<br>`server/src/routes/userRoutes.js` | **GET /api/users**: Trả danh sách user (không kèm `password_hash`), có phân trang, tìm kiếm, lọc role.<br>**GET /api/users/:id**: Xem chi tiết.<br>**PUT /api/users/:id/role**: Đổi role (Traveler <-> Provider).<br>**DELETE /api/users/:id**: Xóa user **(áp dụng xóa mềm `is_deleted = true`)**. Bọc bằng middleware `authorizeRoles('admin')`. |
| **2. Frontend: Admin Layout** | `admin/src/App.jsx`<br>`admin/src/components/...` | Khởi tạo Layout cho Admin trên project `admin/` riêng biệt. Thêm Navbar, Sidebar. Kiểm tra token admin, không có quyền thì văng ra. |
| **3. Frontend: Quản lý Danh sách** | `admin/src/pages/UsersManagement.jsx` | Hiển thị bảng User. Gắn bộ lọc (Role) và thanh tìm kiếm (Email, Tên). Tích hợp phân trang (Pagination). |
| **4. Frontend: Thao tác User** | `admin/src/pages/UsersManagement.jsx` | Thêm cột "Hành động" (Actions). Nút Xóa (bật popup confirm trước khi gọi API DELETE). Nút Đổi Role (Mở modal dropdown chọn role mới). |

---

### 👨‍💻 Thành viên 5: Đặt phòng & Quản lý booking

**Mục tiêu:** Cho phép người dùng tìm phòng trống và thanh toán (chốt booking).

| Task (Việc cần làm) | Vị trí file cần thao tác | Hướng dẫn triển khai chi tiết |
| :--- | :--- | :--- |
| **1. Backend: API Đặt phòng** | `server/src/controllers/bookingController.js`<br>`server/src/services/bookingService.js`<br>`server/src/routes/bookingRoutes.js` | **POST /api/bookings**: Yêu cầu check-in < check-out. Tính tiền tổng dựa trên số đêm. Trừ số lượng phòng khả dụng. Dùng DB Transaction. |
| **2. Backend: API Danh sách Booking** | `server/src/controllers/bookingController.js` | **GET /api/bookings/my-bookings**: Dành cho Traveler xem phòng đã đặt.<br>**GET /api/bookings/provider-bookings**: Dành cho Provider xem có ai đặt phòng khách sạn mình không. |
| **3. Backend: Cập nhật Trạng thái** | `server/src/controllers/bookingController.js` | **PUT /api/bookings/:id/status**: Provider được phép xác nhận (confirmed) hoặc từ chối/hủy (cancelled) đơn đặt phòng. |
| **4. Frontend: Form Đặt phòng** | `client/src/pages/Booking.jsx` | UI chọn ngày nhận/trả phòng. Chọn loại phòng cần đặt. Hiển thị tổng tiền tự động tính toán. Validate chỉ cho đặt khi đã đăng nhập. |
| **5. Frontend: Lịch sử & Quản lý đơn** | `client/src/pages/MyBookings.jsx`<br>`client/src/pages/provider/ManageBookings.jsx` | Traveler: Giao diện xem lịch sử các đơn đặt phòng.<br>Provider: Màn hình danh sách đơn hàng chờ xác nhận, có nút Duyệt / Hủy đơn. |

---

### LƯU Ý SPRINT 2. Quy chuẩn giao tiếp API

**1. Format Response thống nhất:**

Tất cả API response phải tuân thủ format sau để Frontend dễ dàng xử lý. **Lưu ý: Trường `message` BẮT BUỘC phải viết bằng Tiếng Anh (English) để hệ thống đồng bộ.**

```json
// Thành công
{
  "success": true,
  "message": "Action completed successfully", // BẮT BUỘC BẰNG TIẾNG ANH
  "data": { ... } // Data có thể là object hoặc mảng
}

// Lỗi
{
  "success": false,
  "message": "Room not found or no rooms available", // BẮT BUỘC BẰNG TIẾNG ANH
  "statusCode": 404
}
```

**2. TUYỆT ĐỐI KHÔNG gõ trực tiếp tên role vào code:**

Sử dụng constant đã định nghĩa trong `server/src/constants/roles.js`:

**❌ Code Sai:**

```js
if (req.user.role === 'admin') { ... }
```

**✅ Code Đúng:**

```js
import USER_ROLES from '../constants/roles.js'

if (req.user.role === USER_ROLES.ADMIN) { ... }
```

**3. Cấu trúc Controller chuẩn:**

Mọi controller đều phải dùng `catchAsync` để bọc hàm async nhằm tự động bắt lỗi mà không cần `try/catch` lặp lại nhiều lần:

```js
import catchAsync from '../utils/catchAsync.js'
import * as myService from '../services/myService.js'

const myAction = catchAsync(async (req, res) => {
  const result = await myService.doSomething(req.body);
  res.status(200).json({ success: true, message: 'Action completed successfully', data: result });
});

export { myAction }
```

**4. Quy trình khi cần thêm Route mới:**

1. Tạo file route trong `server/src/routes/`.
2. Import và đăng ký route trong `server/src/index.js` (theo pattern `app.use('/api/...', myRoutes)`).
3. **KHÔNG QUÊN** kiểm tra route trên Postman trước khi commit.
4. Nhắn tin thông báo vào group chat để mọi người cùng cập nhật endpoint mới.

## 5. Hướng dẫn test API bằng Postman sau khi code xong

Để đảm bảo API hoạt động đúng trước khi báo cáo hoặc push code, mỗi thành viên **BẮT BUỘC** thực hiện đầy đủ các bước sau:

### 1. Khởi động server

Mở terminal tại thư mục `server/` và chạy lệnh:

```bash
npm run dev
```

Đảm bảo server đã khởi động thành công và không có lỗi trong terminal.

---

### 2. Kiểm tra environment trong Postman

Trước khi test API, cần kiểm tra Postman đang sử dụng đúng environment.

Ở góc trên bên phải Postman, chọn environment:

```text
wanderly_dev
```

Nếu chưa chọn environment, các biến như `{{BASE_URL}}` hoặc `{{access_token}}` có thể không hoạt động.

---

### 3. Tạo folder theo module API

Trong collection của project, tạo folder tương ứng với module API vừa code.

Ví dụ, nếu trong code khai báo route:

```js
app.use('/api/users', userRoutes);
```

thì trong Postman tạo folder tên:

```text
users
```

Mỗi module nên có một folder riêng để dễ quản lý request.

---

### 4. Tạo request mới

Trong folder module tương ứng, tạo request mới và cấu hình như sau:

* Chọn đúng phương thức HTTP: `GET`, `POST`, `PUT`, `DELETE`, ...
* Nhập đúng đường dẫn API.

Ví dụ:

```http
POST {{BASE_URL}}/auth/login
```

hoặc:

```http
GET {{BASE_URL}}/users
```

---

### 5. Cấu hình token nếu API yêu cầu quyền truy cập

Nếu API yêu cầu quyền truy cập, ví dụ chỉ user đã đăng nhập, admin hoặc một role cụ thể mới được phép thực hiện, cần lấy token trước khi test.

Thực hiện như sau:

1. Mở request đăng nhập:

```http
POST {{BASE_URL}}/auth/login
```

2. Nhập body bằng tài khoản đã được tạo.

Ví dụ:

```json
{
  "email": "your_email@example.com",
  "password": "your_password"
}
```

3. Bấm **Send**.

Sau khi đăng nhập thành công, hệ thống sẽ tự động lưu `access_token` vào environment.

4. Với các request cần quyền truy cập, vào tab **Headers** và thêm:

| Key             | Value                     |
| --------------- | ------------------------- |
| `Authorization` | `Bearer {{access_token}}` |

---

### 6. Nhập body cho request POST hoặc PUT

Nếu request sử dụng phương thức `POST`, `PUT` hoặc `PATCH`, cần nhập dữ liệu trong phần body.

Thực hiện như sau:

```text
Body → raw → JSON
```

Sau đó nhập dữ liệu tương ứng.

Ví dụ:

```json
{
  "email": "your_email@example.com",
  "password": "your_password"
}
```

Lưu ý kiểm tra kỹ tên field và kiểu dữ liệu phải đúng với API đã định nghĩa.

---

### 7. Gửi request và kiểm tra response

Sau khi cấu hình đầy đủ, bấm **Send** để gửi request.

Cần kiểm tra các nội dung sau:

* API có trả về đúng dữ liệu mong muốn không.
* Response có đúng format chuẩn chưa:

```json
{
  "success": true,
  "message": "Success message",
  "data": {}
}
```

* HTTP Status Code có đúng với từng trường hợp không.

Ví dụ:

| Trường hợp             | Status Code mong muốn |
| ---------------------- | --------------------: |
| Thành công             |          `200`, `201` |
| Thiếu hoặc sai dữ liệu |                 `400` |
| Chưa đăng nhập         |                 `401` |
| Không đủ quyền         |                 `403` |
| Không tìm thấy dữ liệu |                 `404` |
| Lỗi server             |                 `500` |

---

### 8. Bắt buộc test các luồng lỗi

Ngoài luồng thành công, mỗi thành viên **BẮT BUỘC** tự test thêm các luồng lỗi.

Ví dụ:

* Gửi thiếu field bắt buộc.
* Gửi sai kiểu dữ liệu.
* Gửi token không hợp lệ.
* Không gửi token đối với API yêu cầu đăng nhập.
* Dùng tài khoản không đủ quyền để gọi API admin.
* Gọi API với ID không tồn tại.

Mục tiêu là đảm bảo API không chỉ chạy đúng ở trường hợp thành công, mà còn xử lý lỗi đúng chuẩn và trả về HTTP Status Code phù hợp.

> Gợi ý: Khi gặp bất kỳ vấn đề nào, hãy nhắn ngay vào group chat thay vì tự giải quyết một mình. Các hàm liên quan tới cơ sở dữ liệu (`Prisma`) rất mạnh mẽ nhưng nếu kẹt thì cần hỏi để dùng đúng cách. Teamwork là chìa khóa! 🚀
