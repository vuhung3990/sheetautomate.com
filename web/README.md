# SheetAutomate.com — High-Converting Landing Page

Landing page hiện đại, tốc độ cao dành cho **SheetAutomate** — dịch vụ & giải pháp tự động hoá tài liệu Google Workspace (Google Sheets / Forms $\rightarrow$ PDF).

Trang web được tối ưu hoá chuyển đổi (Conversion-Focused), giao diện Dark Mode công nghệ hiện đại, có mô phỏng luồng chạy thời gian thực (Interactive Simulator) và bảng tính ROI tự động. Sẵn sàng 100% để deploy trực tiếp lên **Cloudflare Pages**.

---

## 🚀 Các Tính Năng Nổi Bật Trên Trang

1. **Hero Section Siêu Đẹp & Thông Điệp Chắc Nịch:**
   - Đánh trúng nỗi đau khách hàng quốc tế: Tốn hàng chục giờ gõ tay hoá đơn, báo giá, chứng chỉ từ bảng tính.
   - Định vị UVP độc quyền: **100% Google Workspace Native, Không phí thuê bao hàng tháng (Zero recurring SaaS), Không lưu dữ liệu qua server bên thứ 3**.
   - Cam kết bảo hành lỗi 30 ngày & hỗ trợ ký hợp đồng Escrow (Upwork Fixed-Price).

2. **Interactive Workflow Simulator (Trải Nghiệm Tương Tác Sống Động):**
   - Cho phép khách hàng trải nghiệm thực tế với 3 loại tài liệu:
     - *B2B Client Invoice*
     - *Field Service / Work Order*
     - *Certificate of Completion*
   - Khách có thể nhập dữ liệu trực tiếp $\rightarrow$ Bấm **"Run Automation Pipeline"** $\rightarrow$ Hệ thống mô phỏng 4 bước kỹ thuật:
     1. Kiểm tra Schema & Format Ngày/Tiền tệ
     2. Khóa chống chạy trùng (Idempotency Lock)
     3. Trộn dữ liệu vào Google Doc Template
     4. Xuất PDF lưu Google Drive & ghi link ngược lại ô Sheet.
   - Bật popup xem tài liệu mô phỏng sắc nét và hiệu ứng pháo giấy confetti ăn mừng.

3. **ROI & Time-Saved Calculator (Bảng Tính Lợi Nhuận Trực Quan):**
   - 3 thanh trượt điều chỉnh: Số lượng tài liệu/tháng, Số phút làm thủ công, Chi phí nhân sự/giờ.
   - Tự động tính toán: Số giờ lãng phí mỗi tháng, Số tiền thất thoát mỗi năm, Số ngày hoàn vốn gói Pilot $450 (thường chỉ 15–20 ngày), Tỷ suất sinh lời ROI (+1,500% – 2,500%).

4. **Bảng So Sánh Minh Bạch (Why Us vs. Autocrat vs. Monthly SaaS):**
   - Phân tích thẳng thắn lý do tại sao khách hàng nên chọn gói Pilot $450 thay vì vật lộn với add-on miễn phí (Autocrat) dễ gãy hoặc phần mềm SaaS đắt đỏ ($300–$1,200/năm).

5. **Mô Hình 3 Giai Đoạn Milestone An Toàn Tuyệt Đối Cho Khách:**
   - **M1: Feasibility Preflight ($75)** — Kiểm tra quyền Admin/OAuth, schema, cam kết hoàn 100% nếu triển khai build.
   - **M2: Build & Staging Test ($300)** — Lập trình Apps Script, khóa chống trùng, kiểm thử tải.
   - **M3: Production Handover & Video ($75)** — Bàn giao, quay video Loom cho nhân viên, kích hoạt bảo hành 30 ngày.

6. **Form Nhận Yêu Cầu Đa Bước & Lưu Trữ Tự Động (Smart Lead Capture):**
   - Thu thập thông tin quy trình, loại tài liệu, khối lượng và email làm việc.
   - Tự động lưu lead vào `localStorage` của trình duyệt.

7. **Bảo Mật & Điều Khoản Pháp Lý (Privacy & Terms Modals):**
   - Tích hợp sẵn modal Chính sách bảo mật dữ liệu & Điều khoản dịch vụ.

---

## 🛠️ Hướng Dẫn Deploy Lên Cloudflare Pages

### Cách 1: Kết nối trực tiếp qua Git (GitHub / GitLab) — Khuyên dùng

1. Khởi tạo Git repository trong thư mục này và push lên GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: complete modern sheetautomate landing page"
   git branch -M main
   git remote add origin https://github.com/<your-username>/sheetautomate.git
   git push -u origin main
   ```
2. Đăng nhập vào dashboard **Cloudflare** $\rightarrow$ Chọn mục **Workers & Pages** $\rightarrow$ **Create Application** $\rightarrow$ **Pages** $\rightarrow$ **Connect to Git**.
3. Chọn repo `sheetautomate`.
4. Cấu hình Build Settings:
   - **Root directory:** `web` (quan trọng nếu repo chứa các thư mục plan, idea, decision)
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. Nhấn **Save and Deploy**. Cloudflare Pages sẽ tự động build và cấp domain miễn phí dạng `*.pages.dev` kèm chứng chỉ SSL tự động!
6. Trỏ custom domain `sheetautomate.com` vào Cloudflare Pages trong tab **Custom domains**.

---

### Cách 2: Deploy Nhanh bằng Wrangler CLI (Không cần qua GitHub)

Nếu bạn muốn deploy tức thì từ máy tính:

1. Build dự án ra thư mục `dist`:
   ```bash
   npm run build
   ```
2. Deploy trực tiếp thư mục `dist` bằng lệnh Wrangler:
   ```bash
   npx wrangler pages deploy dist --project-name=sheetautomate
   ```
   *(Trình duyệt sẽ mở ra để bạn xác thực tài khoản Cloudflare một lần duy nhất).*

---

## 💻 Chạy Thử Ở Môi Trường Local

```bash
# Cài đặt thư viện (nếu chưa cài)
npm install

# Khởi động dev server
npm run dev

# Kiểm tra bản build production
npm run build
npm run preview
```
