# Wanderly - Hướng dẫn làm việc nhóm

Tài liệu này dùng để cả nhóm thống nhất cách lấy code, code trên nhánh riêng, đẩy code lên GitHub và tạo Pull Request.

## 1. Lấy code mới nhất về máy (Đầu ngày làm việc)
Nếu bạn chưa có thư mục dự án trên máy, hãy clone về:

```bash
git clone https://github.com/DuVuyp/wanderly.git
cd wanderly
```

Nếu đã có sẵn dự án, trước khi bắt đầu code bất cứ thứ gì, hãy đảm bảo bạn đang ở nhánh `main` và lấy code mới nhất mà các bạn khác vừa làm xong:

```bash
git checkout main
git pull origin main
```

## 2. Tạo nhánh riêng để làm việc
Tuyệt đối không code trên `main`. Hãy tạo một nhánh mới. Tên nhánh nên thể hiện rõ bạn đang làm gì.

```bash
# Lệnh này vừa tạo nhánh mới vừa chuyển bạn sang nhánh đó luôn
git checkout -b feature/ten-chuc-nang

# Ví dụ:
# git checkout -b feature/trang-dang-nhap
# git checkout -b fix/loi-hien-thi-header
```

## 3. Code và lưu lại (Commit)
Bây giờ bạn cứ mở code lên và làm việc bình thường. Khi làm xong một cụm tính năng nhỏ, hãy lưu lại:

```bash
# 1. Kiểm tra xem file nào đã thay đổi
git status

# 2. Thêm tất cả các file đã thay đổi vào danh sách chuẩn bị lưu
git add .

# 3. Lưu lại với một lời nhắn rõ ràng (tiếng Việt hay Anh đều được)
git commit -m "Hoàn thành giao diện trang đăng nhập"
```

## 4. Cập nhật lại code trước khi đẩy (Rất quan trọng)
Trong lúc bạn code nhánh của bạn, có thể các thành viên khác đã đẩy code mới lên `main`. Bạn cần kéo code đó về nhánh của mình để xem có bị xung đột (conflict) không.

```bash
git pull origin main
```

Lưu ý:
- Nếu không có lỗi gì, Git sẽ tự gộp code.
- Nếu có chữ `CONFLICT`, bạn cần mở file lỗi lên, sửa bằng tay để giữ lại code đúng, sau đó chạy lại lệnh `git add .` và `git commit -m "Fix conflict"`.

## 5. Đẩy nhánh của bạn lên GitHub
Sau khi đảm bảo code chạy tốt và đã cập nhật code mới từ nhóm, bạn đẩy nhánh này lên GitHub:

```bash
git push origin feature/ten-chuc-nang
# Ví dụ: git push origin feature/trang-dang-nhap
```

## 6. Tạo Pull Request (PR) - Gộp code vào dự án chung
Phần này không dùng lệnh mà làm trên web:

1. Lên trang GitHub của dự án. Bạn sẽ thấy một nút màu xanh lá cây tên là **Compare & pull request** vừa hiện ra. Nhấn vào đó.
2. Viết vài dòng mô tả xem nhánh này bạn đã làm những gì.
3. Nhấn **Create pull request**.

Lúc này, nhóm sẽ cùng vào xem code của bạn (Code Review). Nếu mọi người đồng ý, người quản lý (hoặc chính bạn) sẽ nhấn nút **Merge pull request** để gộp chính thức vào nhánh `main`.

---

## Giải thích cấu trúc thư mục (Backend)
Dự án hiện tại có phần backend nằm trong thư mục `server/`.

### Tổng quan

```text
server/
  prisma/
    schema.prisma
  src/
    config/
    constants/
    controllers/
    middlewares/
    routes/
    services/
    utils/
    validations/
```

### Ý nghĩa từng thư mục
- `server/prisma/`: Chứa file schema database (`schema.prisma`) và migration (nếu có). Đây là nơi định nghĩa model bằng Prisma.
- `server/src/index.js`: Điểm vào chính của server Express, nơi khởi tạo app, middleware và route.
- `server/src/config/`: Các cấu hình dùng chung (ví dụ kết nối Prisma, env config...).
- `server/src/constants/`: Hằng số toàn dự án (role, status, key cố định...).
- `server/src/controllers/`: Xử lý request/response cho từng API. Controller nhận request, gọi service, trả kết quả.
- `server/src/middlewares/`: Middleware dùng chung (xử lý lỗi, validate input, auth...).
- `server/src/routes/`: Định nghĩa endpoint và map endpoint tới controller.
- `server/src/services/`: Chứa business logic. Service thường giao tiếp database và xử lý nghiệp vụ.
- `server/src/utils/`: Hàm hỗ trợ và class dùng chung (ví dụ: `ApiError`, `catchAsync`).
- `server/src/validations/`: Rule validate dữ liệu đầu vào (thường dùng Joi).

### Luồng code để dễ hiểu
Một request API thường đi theo luồng:

`route -> middleware (validate/auth) -> controller -> service -> database`

Nói gọn:
- Route: định nghĩa đường dẫn API.
- Middleware: chặn lỗi/kiểm tra token/kiểm tra input.
- Controller: xử lý đầu vào đầu ra cho API.
- Service: chứa logic nghiệp vụ và thao tác DB.

---

## Hướng dẫn chạy backend ở máy local
Di chuyển vào thư mục backend và cài dependencies:

```bash
cd server
npm install
npx prisma generate
```

Tạo database bằng file wanderly.sql

Chạy server ở chế độ phát triển:

```bash
npm run dev
```

Test:

```bash
npm test
```

Lint:

```bash
npm run lint
```

Prisma (nếu cần):

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
```

> Gợi ý: Team nên thống nhất mẫu commit message và quy tắc đặt tên nhánh để dễ review hơn.
