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

## Sprint 1: Tập trung xây dựng Backend API (Hoàn thành 80% Core tính năng)

**Quy tắc chung cho toàn SPRINT 1:**

* Trọng tâm của Sprint này là **chỉ làm việc trên thư mục `server/`**. Tạm thời chưa code giao diện trên `client/` và `admin/`.
* Xây dựng toàn bộ các API nền tảng để phục vụ cho các Sprint sau.
* Tuân thủ luồng: `route` → `middleware (auth, validate)` → `controller` → `service` → `Prisma (DB)`.
* **BẮT BUỘC:** Dùng **Postman** để test toàn bộ endpoint API đảm bảo JSON đầu ra chính xác trước khi ghép vào Frontend. Sau này khi có UI sẽ dùng thêm **Playwright** để test luồng E2E.
* **Code bị lỗi (crash server) tuyệt đối không được push lên.**

---

### 👨‍💻 Thành viên 1: Lead / Authentication & Security

**Mục tiêu:** Xây dựng nền tảng bảo mật cốt lõi cho hệ thống. Đảm bảo luồng đăng ký, đăng nhập và cấp phát token an toàn tuyệt đối. Mặc dù một số phần đã code nháp, vẫn cần chuẩn hóa lại.

| Task (Việc cần làm) | Vị trí file cần thao tác | Hướng dẫn triển khai chi tiết |
| :--- | :--- | :--- |
| **1. API Đăng ký & Đăng nhập (Auth)** | `server/src/controllers/authController.js`<br>`server/src/services/authService.js`<br>`server/src/routes/authRoutes.js` | **POST /api/auth/register**: Nhận `email`, `password`, `full_name`, `role`. Băm mật khẩu (bcrypt) trước khi lưu DB.<br>**POST /api/auth/login**: Kiểm tra mật khẩu, sinh ra `accessToken` và `refreshToken` (JWT). Trả thông tin user (trừ password) về cho client. |
| **2. Quản lý Token (Refresh & Logout)** | `server/src/controllers/authController.js`<br>`server/src/services/authService.js` | **POST /api/auth/refresh-token**: Cấp lại `accessToken` mới khi token cũ hết hạn.<br>**POST /api/auth/logout**: Xóa token hoặc đưa vào blacklist (nếu có). |
| **3. Middleware Xác thực (Auth)** | `server/src/middlewares/authMiddleware.js` | Viết hàm `authenticateToken` để kiểm tra Bearer Token ở header. Nếu hợp lệ, gán `req.user = decodedToken`. Nếu không, trả về HTTP 401 Unauthorized. |
| **4. Middleware Phân quyền (Role-based)** | `server/src/middlewares/authMiddleware.js` | Viết hàm `authorizeRoles(...roles)`. Ví dụ `authorizeRoles('admin', 'provider')`. Kiểm tra `req.user.role` từ token, nếu không khớp trả về lỗi HTTP 403 Forbidden. |
| **5. Validation Schema cho Auth** | `server/src/validations/authValidation.js` | Viết các schema Joi để kiểm tra dữ liệu đầu vào cho Login/Register (email phải đúng định dạng, password dài ít nhất 8 ký tự). |

---

### 👨‍💻 Thành viên 2: User Profile & Admin Management

**Mục tiêu:** Xây dựng các API liên quan đến quản lý thông tin tài khoản cá nhân và các tính năng quản trị User dành riêng cho Admin.

| Task (Việc cần làm) | Vị trí file cần thao tác | Hướng dẫn triển khai chi tiết |
| :--- | :--- | :--- |
| **1. API Quản lý User (Cho Admin)** | `server/src/controllers/userController.js`<br>`server/src/services/userService.js`<br>`server/src/routes/userRoutes.js` | **GET /api/users**: Lấy danh sách (hỗ trợ query phân trang `page`, `limit`).<br>**GET /api/users/:id**: Lấy chi tiết một user.<br>**PUT /api/users/:id/role**: Cập nhật role (admin có thể nâng cấp user thành provider).<br>**DELETE /api/users/:id**: Xóa user.<br>*Tất cả API này phải bọc qua middleware `authorizeRoles('admin')`*. |
| **2. API Cập nhật Profile cá nhân** | `server/src/controllers/profileController.js`<br>`server/src/services/profileService.js`<br>`server/src/routes/profileRoutes.js` | **PUT /api/profile**: Cập nhật thông tin chính mình (tên, số điện thoại, avatar...). Lấy ID từ `req.user.id`. |
| **3. API Đổi Mật Khẩu** | `server/src/controllers/profileController.js`<br>`server/src/services/profileService.js` | **PUT /api/profile/change-password**: Nhận `oldPassword` và `newPassword`. So sánh mật khẩu cũ bằng `bcrypt.compare`, nếu đúng thì hash mật khẩu mới và update DB. |
| **4. Validation Schema cho User** | `server/src/validations/userValidation.js` | Joi schema chặn dữ liệu lỗi: `updateProfileSchema`, `changePasswordSchema`, `updateRoleSchema`. |
| **5. Seed Data (Tạo dữ liệu mẫu)** | `server/src/seed.js` (Tạo script riêng) | Viết script chạy độc lập sử dụng `prisma` để tự động chèn 1 Admin (`admin@wanderly.com`), 2 Provider, và 5 Traveler với password mặc định là `123456`. Dùng để cấp data test cho cả team. |

---

### 👨‍💻 Thành viên 3: API Quản lý Cơ sở lưu trú (Property & Room)

**Mục tiêu:** Viết các API cho Provider (chủ nhà) đăng bài, quản lý các khách sạn, homestay, định nghĩa loại phòng, và quản lý các phòng cụ thể.

| Task (Việc cần làm) | Vị trí file cần thao tác | Hướng dẫn triển khai chi tiết |
| :--- | :--- | :--- |
| **1. CRUD Property (Khách sạn/Homestay)** | `server/src/controllers/propertyController.js`<br>`server/src/services/propertyService.js`<br>`server/src/routes/propertyRoutes.js` | **POST /api/properties**: Tạo mới. Lấy `provider_id` bằng `req.user.id`. Bắt buộc nhận `name`, `type`, `address`, `latitude`, `longitude`, `check_in_time`, `check_out_time`.<br>**GET /api/properties**: Lấy danh sách tài sản của mình (nếu gọi với role provider).<br>**PUT/DELETE**: Chỉ cho phép thao tác nếu `property.provider_id == req.user.id`. |
| **2. CRUD Room Types (Loại phòng)** | `server/src/controllers/roomTypeController.js`<br>`server/src/services/roomTypeService.js`<br>`server/src/routes/roomTypeRoutes.js` | Định nghĩa các loại phòng (VD: Phòng đôi, Phòng gia đình).<br>**POST /api/properties/:propertyId/room-types**: Kiểm tra xem Property này có thuộc về `req.user` không trước khi tạo. Dữ liệu cần có: `name`, `max_guests`, `base_price`, `total_quantity`, `amenities`. |
| **3. CRUD Rooms (Quản lý phòng vật lý)** | `server/src/controllers/roomController.js`<br>`server/src/services/roomService.js`<br>`server/src/routes/roomRoutes.js` | Sau khi có loại phòng (VD: 5 phòng đôi), cần tạo ID thực tế (VD: P101, P102).<br>**POST /api/room-types/:roomTypeId/rooms**: Tạo phòng cụ thể với `room_number`. Cập nhật trạng thái `available`, `maintenance`. |
| **4. Validation Schema** | `server/src/validations/propertyValidation.js` | Viết schema Joi kiểm tra: Giá phòng phải > 0, số lượng người > 0, tọa độ vĩ độ (`latitude`) từ -90 đến 90, kinh độ (`longitude`) từ -180 đến 180. |

---

### 👨‍💻 Thành viên 4: API Tìm kiếm (Search) & Đặt phòng (Booking)

**Mục tiêu:** Xử lý luồng cốt lõi của hệ thống du lịch. Logic đếm phòng trống và xử lý transaction khi người dùng chốt đặt phòng.

| Task (Việc cần làm) | Vị trí file cần thao tác | Hướng dẫn triển khai chi tiết |
| :--- | :--- | :--- |
| **1. API Tìm kiếm Khách sạn (Search)** | `server/src/controllers/searchController.js`<br>`server/src/services/searchService.js`<br>`server/src/routes/searchRoutes.js` | **GET /api/search**: Người dùng truyền query: `?location=DaNang&checkIn=...&checkOut=...&guests=2`.<br>**Logic phức tạp:** Dùng Prisma query để tìm các Property theo địa chỉ, đếm số lượng Room đang rảnh (không trùng với bất kỳ Booking nào đang `confirmed` hoặc `pending` trong khoảng ngày đó). |
| **2. API Xem chi tiết Property** | (Tương tự trên) | **GET /api/search/:propertyId**: Trả về chi tiết Property, danh sách Room_Types, và lọc ra MỖI loại phòng hiện còn TRỐNG bao nhiêu phòng theo thời gian check-in/out. |
| **3. API Đặt phòng (Booking)** | `server/src/controllers/bookingController.js`<br>`server/src/services/bookingService.js`<br>`server/src/routes/bookingRoutes.js` | **POST /api/bookings**: Traveler gửi `property_id` và danh sách các loại phòng muốn đặt.<br>**Logic:** Dùng `Prisma Transaction` (chạy lệnh DB dạng đồng bộ) để: 1. Kiểm tra lại số phòng trống. 2. Tính `total_price`. 3. Ghi vào bảng `Bookings`. 4. Ghi vào `Booking_Details`. |
| **4. API Quản lý Booking** | (Tương tự trên) | **GET /api/bookings/my-bookings**: Traveler lấy danh sách đơn của mình.<br>**GET /api/bookings/provider-bookings**: Provider lấy đơn đặt phòng thuộc khách sạn của họ.<br>**PUT /api/bookings/:id/status**: Đổi trạng thái (`confirmed` / `cancelled`). |

---

### 👨‍💻 Thành viên 5: API Lịch trình (Itinerary) & Upload Ảnh & Email

**Mục tiêu:** Cung cấp tính năng lên kế hoạch chuyến đi (Itinerary), đồng thời lo các dịch vụ bên thứ 3 (Upload ảnh Cloudinary, gửi Email Nodemailer).

| Task (Việc cần làm) | Vị trí file cần thao tác | Hướng dẫn triển khai chi tiết |
| :--- | :--- | :--- |
| **1. CRUD Lịch trình (Itinerary)** | `server/src/controllers/itineraryController.js`<br>`server/src/services/itineraryService.js`<br>`server/src/routes/itineraryRoutes.js` | **POST /api/itineraries**: Tạo một bảng kế hoạch mới (cần `title`, `start_date`, `end_date`). Gắn với `req.user.id`.<br>**GET /api/itineraries**: Trả về danh sách lịch trình cá nhân.<br>**PUT/DELETE**: Sửa/Xóa lịch trình. |
| **2. API Quản lý Địa điểm (Locations)** | `server/src/controllers/itineraryController.js`<br>`server/src/services/itineraryService.js` | **POST /api/itineraries/:id/locations**: Thêm địa điểm vào lịch trình. Truyền `property_id` (nếu là KS trong hệ thống) HOẶC `custom_name`, `latitude`, `longitude`. Tính toán field `order_index`.<br>**PUT /api/itineraries/:id/locations/reorder**: Đảo vị trí địa điểm. |
| **3. API Tích hợp Upload Ảnh** | `server/src/controllers/uploadController.js`<br>`server/src/services/uploadService.js`<br>`server/src/routes/uploadRoutes.js` | Cài đặt package `cloudinary`, `multer`.<br>**POST /api/upload**: Nhận file từ `req.file` (form-data), đẩy lên Cloudinary, trả về URL (vd: `https://res.cloudinary.com/...`). Dùng chung cho upload Avatar, upload ảnh Khách sạn/Phòng. |
| **4. Service Gửi Email tự động** | `server/src/services/emailService.js` | Cấu hình `nodemailer` (SMTP Gmail hoặc Mailtrap).<br>Viết hàm `sendBookingConfirmation(email, bookingData)`: Gửi email HTML hóa đơn khi khách đặt phòng thành công.<br>Viết hàm `sendWelcomeEmail(email, name)`: Gửi khi đăng ký thành công. (Thành viên 1 sẽ gọi hàm này). |

---

### LƯU Ý SPRINT 1. Quy chuẩn giao tiếp API

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

**5. Hướng dẫn Test API bằng Postman sau khi Code xong:**

Để đảm bảo API hoạt động đúng trước khi báo cáo hoặc push code, mỗi thành viên **BẮT BUỘC** thực hiện các bước sau:
1. **Khởi động Server:** Chạy lệnh `npm run dev` ở thư mục `server/`. Đảm bảo server đang chạy (thường là ở `http://localhost:5000`).
2. **Quy tắc đặt tên request (bắt buộc):**
    - Mỗi module là một folder (VD: `auth/`, `users/`, `bookings/`).
    - Tên request trong folder chỉ là **action**.
    - Ví dụ:
       - Folder `auth/`: `login`, `register`, `refresh-token`, `logout`
       - Folder `users/`: `list`, `detail`, `update-role`, `delete`
       - Folder `bookings/`: `create`, `my-bookings`, `provider-bookings`, `update-status`
    - URL luôn dùng biến: `{{BASE_URL}}/api/...`
3. **Tạo Request mới trong Postman:**
   - Chọn đúng phương thức HTTP (`GET`, `POST`, `PUT`, `DELETE`).
   - Nhập đường dẫn API (VD: `{{BASE_URL}}/api/auth/login`).
4. **Truyền Dữ liệu (Nếu là POST/PUT):**
   - Chuyển sang tab **Body**, chọn **raw** và chọn định dạng **JSON**.
   - Gõ dữ liệu test vào (VD: `{"email": "test@gmail.com", "password": "123"}`).
5. **Gắn Token (Với các API yêu cầu đăng nhập/phân quyền):**
   - Dùng biến `{{access_token}}` ở **Authorization** → **Bearer Token**.
   - Sau khi chạy login, token tự cập nhật cho các request tiếp theo.
6. **Gửi và Kiểm tra Response:**
   - Nhấn **Send**.
   - Kiểm tra kết quả trả về có đúng chuẩn `{ success, message, data }` chưa. (Lưu ý message tiếng Anh).
   - **ĐẶC BIỆT:** Phải tự cố tình test các luồng lỗi (VD: gửi thiếu field, gửi sai ID, test user không đủ quyền) để xem HTTP Status Code có trả đúng mã lỗi (`400`, `401`, `403`, `404`) không, và server có bị crash không.

> Gợi ý: Khi gặp bất kỳ vấn đề nào, hãy nhắn ngay vào group chat thay vì tự giải quyết một mình. Các hàm liên quan tới cơ sở dữ liệu (`Prisma`) rất mạnh mẽ nhưng nếu kẹt thì cần hỏi để dùng đúng cách. Teamwork là chìa khóa! 🚀
