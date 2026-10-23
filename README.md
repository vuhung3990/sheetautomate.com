# SheetAutomate.com

> **100% Google Workspace Native Document Automation**  
> Dịch vụ & giải pháp tự động hoá tài liệu trọn gói từ Google Sheets / Forms sang Google Docs / PDF. Zero recurring SaaS fees. Zero 3rd-party data risk.

---

## 📌 Tổng Quan Cấu Trúc Dự Án

Dự án được tái cấu trúc rành mạch thành 4 phân vùng độc lập nhằm tối ưu hóa việc phát triển song song giữa kỹ thuật, kinh doanh và quản trị ý tưởng:

- **[`structure.txt`](./structure.txt)**: Bản đồ tổng thể dự án. Đọc file này để nắm bắt ngay sơ đồ tổ chức, quy ước đặt tên và cách phối hợp giữa các thành phần.
- **[`web/`](./web/)**: Toàn bộ mã nguồn ứng dụng web Landing Page (React 18 + TypeScript + Tailwind CSS + Vite), sẵn sàng deploy lên Cloudflare Pages.
- **[`idea/`](./idea/)**: Nơi lưu trữ toàn bộ ý tưởng nảy sinh trong quá trình triển khai (định dạng `.txt`).
- **[`plan/`](./plan/)**: Kế hoạch phát triển sản phẩm & thương hiệu (định dạng `.md`):
  - **[`plan/marketing/`](./plan/marketing/)**: Kế hoạch tiếp cận khách hàng GTM 90 ngày, định vị thương hiệu, phân tích đối thủ cạnh tranh.
  - **[`plan/tech/`](./plan/tech/)**: Kiến trúc Google Apps Script, quy trình nghiệm thu 3 Milestone, giới hạn kỹ thuật và dừng lỗ (Stop-Loss).
- **[`decision/`](./decision/)**: Nhật ký các quyết định kiến trúc & kinh doanh cốt lõi (định dạng `.txt`), ghi rõ bối cảnh và lý do **tại sao quyết định như thế**.

---

## ⚡ Hướng Dẫn Nhanh Cho Lập Trình Viên

### Chạy Website Landing Page
```bash
# 1. Đi vào thư mục web
cd web

# 2. Cài đặt dependencies
npm install

# 3. Khởi động môi trường dev
npm run dev

# 4. Kiểm tra build sản phẩm
npm run build
```

Chi tiết xem tại [`web/README.md`](./web/README.md).
