# Kiến Trúc Kỹ Thuật Hệ Thống & Google Apps Script Engine

> **Mục tiêu kỹ thuật:** Xây dựng hệ thống tự động hóa tài liệu chạy 100% trong môi trường Google Workspace của khách hàng, đảm bảo tính toàn vẹn dữ liệu (Idempotency), không thất thoát dữ liệu và ghi log kiểm toán đầy đủ.

---

## 1. Sơ Đồ Kiến Trúc Luồng Dữ Liệu (Data Pipeline)

```
[Google Form Submit / Manual Row Selection in Sheet]
                        │
                        ▼
           [Pre-flight Validation Gate]
      (Kiểm tra trường bắt buộc, regex email, format ngày/tiền tệ)
                        │
                        ▼
             [Idempotency Mutex Lock]
   (LockService Apps Script: Chống 2 tiến trình xử lý cùng dòng)
                        │
                        ▼
       [Google Doc Template Merge Engine]
 (Nhân bản Template Doc -> Thay thế {{tag}} & render bảng dòng hàng)
                        │
                        ▼
            [Google Drive PDF Converter]
      (Chuyển Doc thành PDF -> Lưu đúng Thư mục Drive đích)
                        │
                        ▼
             [Post-Execution Audit]
  (Ghi ngược Link PDF, Timestamp, Trạng thái DONE/ERROR vào Sheet)
```

---

## 2. Các Tiêu Chuẩn Kỹ Thuật Bắt Buộc

### 1. Khóa Chống Chạy Trùng (Idempotency & Concurrency Lock)
- **Vấn đề thực tế:** Khi 2 người dùng cùng ấn nút duyệt trên Sheet hoặc 2 Form được submit gần như đồng thời, hệ thống có thể tạo ra 2 PDF trùng lặp hoặc ghi đè dữ liệu.
- **Giải pháp kỹ thuật:**
  - Sử dụng `LockService.getScriptLock()` hoặc `LockService.getDocumentLock()`.
  - Thiết lập timeout tối đa 30,000ms.
  - Trước khi xử lý dòng, kiểm tra cột `Automation Status`: nếu đã có giá trị `PROCESSING` hoặc `DONE` thì lập tức bỏ qua.
  - Sau khi lấy khóa, cập nhật ngay trạng thái dòng thành `PROCESSING`.

### 2. Quản Trị Phân Quyền & OAuth Scopes Tối Thiểu
- **Nguyên tắc an toàn:** Chỉ xin quyền vừa đủ (Principle of Least Privilege).
- **Danh sách OAuth Scopes được phép:**
  - `https://www.googleapis.com/auth/spreadsheets` (Đọc/ghi Google Sheets)
  - `https://www.googleapis.com/auth/documents` (Tạo và điền template Google Docs)
  - `https://www.googleapis.com/auth/drive` (Lưu trữ và xuất PDF trong thư mục được chỉ định)
- **Scopes bị cấm trong bản Pilot mặc định:**
  - `https://mail.google.com/` (Không xin quyền gửi mail toàn quyền trừ khi khách hàng có yêu cầu riêng đã được phê duyệt).

### 3. Cơ Chế Xử Lý Lỗi & Ghi Log (Error Handling & Audit Trail)
- Sử dụng khối `try ... catch ... finally` bọc toàn bộ chu kỳ xử lý mỗi tài liệu.
- Trong khối `finally`, luôn đảm bảo:
  - Giải phóng khóa: `lock.releaseLock()`.
  - Cập nhật trạng thái dòng: Nếu thành công ghi `DONE` + URL link PDF; nếu thất bại ghi `ERROR: [mô tả ngắn]`.
  - Không bao giờ để script crash ngầm mà không để lại dấu vết trên Sheet.

---

## 3. Quản Trị Hạ Tầng Website (Cloudflare Pages)

- **Landing Page Frontend:** React 18, TypeScript, Tailwind CSS, Vite.
- **Hosting:** Cloudflare Pages (Free tier: Băng thông không giới hạn, 500 builds/tháng).
- **Cấu hình bảo mật:** Tích hợp file `public/_headers` và `public/_redirects`:
  - `Content-Security-Policy`: Chặn XSS và script độc hại.
  - `X-Frame-Options: DENY`: Chống Clickjacking.
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`.
