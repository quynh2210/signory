# 🌟 SIGNORY – NỀN TẢNG HỌC NGÔN NGỮ KÝ HIỆU CHO GIA ĐÌNH & TRẺ EM

**SIGNORY** là nền tảng học ngôn ngữ ký hiệu thông qua các bài học tương tác và trò chơi giáo dục, lấy cảm hứng từ phương pháp sư phạm sinh động của Duolingo. Dự án được thiết kế đồng hành cùng cuốn sách truyện tranh thiếu nhi, giúp phụ huynh và trẻ nhỏ cùng học ký hiệu, ghi nhớ ý nghĩa và làm quen với mặt chữ.

---

## 🚀 1. Hướng Dẫn Khởi Động Nhanh

### Yêu cầu môi trường
- **Node.js**: >= 18.x
- **Trình duyệt**: Chrome, Edge, Safari hoặc Firefox hỗ trợ Web Audio API.

### Cài đặt và chạy ứng dụng

1. **Khởi chạy Backend Server (Port 5001):**
   ```bash
   npm run server
   ```
   > Backend xử lý chữ ký bảo mật Cloudinary (Upload Signature), xóa media an toàn (Cloudinary Destroy API) mà không lộ Secret Key ra client.

2. **Khởi chạy Frontend Dev Server (Port 5173):**
   ```bash
   npm run dev
   ```
   > Truy cập ứng dụng tại: [http://localhost:5173](http://localhost:5173)

---99o

## 🔑 2. Cấu Hình & Tài Khoản Mẫu

### Cấu hình Firebase & Cloudinary
Đã được cấu hình tự động trong file `.env` với các khóa do người dùng cung cấp:
- **Firebase Project ID**: `signory-51079`
- **Cloudinary Cloud Name**: `di7xar1oz`
- **Cloudinary API Key**: `815682547284463`

### Khởi tạo tài khoản Quản trị viên (ADMIN) đầu tiên:
Hệ thống tuân thủ nguyên tắc bảo mật, **không cho phép đăng ký trực tiếp tài khoản Admin**:
1. Đăng ký tài khoản bất kỳ tại nút **Đăng Nhập / Đăng Ký** trên thanh điều hướng.
2. Vào trang **Cá Nhân** (`/profile`).
3. Tại mục **"Kích Hoạt Quyền Quản Trị Viên (ADMIN)"**, nhập mã bảo mật hệ thống:
   ```text
   signory_super_admin_2026_init
   ```
4. Nhấn **"Kích Hoạt Admin"**. Sau khi kích hoạt thành công, nút **"Quản Trị"** sẽ xuất hiện trên thanh menu để truy cập vào **Admin Dashboard** (`/admin`).

*(Bạn cũng có thể dùng nút Demo nhanh trong cửa sổ Đăng nhập để tự động điền thông tin)*

---

## 🎯 3. Các Chức Năng Nổi Bật

### A. Chế độ Phụ huynh (Parents Mode)
- **Bản đồ bài học Duolingo**: Các chặng học nối tiếp nhau, hiển thị số sao (1-3 sao), trạng thái đã hoàn thành, đang học và khóa.
- **Quy tắc mở khóa**: Bài 1 mở mặc định. Hoàn thành bài trước để mở khóa bài tiếp theo.
- **Mỗi bài học 3 ký hiệu trong ~3 phút**:
  - **Bài 1 (Ở nhà)**: Nhà, Ăn, Ngủ.
  - **Bài 2 (Gia đình & Yêu thương)**: Ba, Mẹ, Yêu thương.
- **Trình phát bài học đa tương tác**:
  - Khối văn bản hướng dẫn và mẹo truyện tranh.
  - Khối Video ký hiệu có tính năng **chạy chậm (0.5x, 0.75x)** và xem lại.
  - 7 dạng câu hỏi tương tác (Trắc nghiệm, Đoán hình, Sắp xếp từ Duolingo, Điền từ, Đúng/Sai, Ghép đôi, Nhận diện video).
  - Thanh phản hồi kết quả trượt từ dưới lên (Màu xanh ăn mừng / Màu cam gợi ý tích cực).
  - Màn hình chiến thắng với pháo hoa Confetti và âm thanh khúc khải hoàn!

### B. Chế độ Bé (Kids Mode)
- Nút bấm lớn, màu sắc tươi vui, ngôn ngữ siêu đơn giản.
- Vòng lặp trò chơi đoán hình qua ký hiệu (mặc định 5 câu).
- **Tính năng độc quyền**: Khi bé chọn đúng, hệ thống hiển thị từng chữ cái hoạt họa kèm âm thanh vui tai (Ví dụ: **N - H - À**, **Ă - N**, **N - G - Ủ**).
- Không phạt điểm khi bé chọn sai, luôn khuyến khích tích cực.

### C. Khu vực Quản trị (Admin Dashboard & Lesson Builder)
- **Dashboard Tổng quan**: Thống kê bài học, câu hỏi, người dùng, lượt hoàn thành.
- **Quản lý Bài học**: Thêm, sửa, xóa, nhân bản bài học, thay đổi thứ tự và trạng thái xuất bản.
- **Lesson Builder chuyên dụng**:
  - Kéo thả / di chuyển thứ tự các khối (Văn bản, Video, Ảnh, Quiz).
  - Form tùy biến cho từng dạng câu hỏi chuyên biệt.
  - **Live Preview Tab**: Thử nghiệm trực tiếp trải nghiệm của học viên ngay trong trang quản trị trước khi xuất bản.
- **Quản lý Media (Cloudinary)**:
  - Upload trực tiếp với thanh tiến trình % thực tế.
  - Xem trước thư viện ảnh & video.
  - Xóa file dọn dẹp sạch trên Cloudinary, không để lại dữ liệu rác.
- **Quản lý Người dùng & Huy hiệu**: Theo dõi điểm EXP, sao, khóa/mở tài khoản, tạo mới các danh hiệu.
- **Quản lý Âm thanh & Cài đặt**: Thử nghiệm âm thanh Web Audio và cấu hình số câu hỏi cho Chế độ Bé.

---

## 🛡️ 4. Bảo Mật & Bảo Vệ Trẻ Em

- **Quyền riêng tư của trẻ**: Hệ thống không thu thập khuôn mặt, ngày sinh hay thông tin cá nhân của trẻ nhỏ; tài khoản được quản lý bởi phụ huynh.
- **An toàn API Secrets**: Cloudinary API Secret được bảo vệ hoàn toàn trên Node Backend, phía client chỉ thực hiện upload thông qua Chữ ký mã hóa (Signature).
- **Lưu ý sư phạm**: Website đóng vai trò công cụ hỗ trợ gia đình làm quen và giao tiếp ngôn ngữ ký hiệu cùng truyện tranh, không thay thế giáo dục chuyên biệt.
