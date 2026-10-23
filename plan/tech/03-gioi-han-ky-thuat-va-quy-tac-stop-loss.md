# Giới Hạn Phạm Vi Kỹ Thuật & Quy Tắc Dừng Lỗ (Stop-Loss)

> **Mục tiêu:** Bảo vệ thời gian và biên lợi nhuận của người thực hiện, ngăn chặn hiện tượng phình to phạm vi (Scope Creep) và thiết lập cơ chế kiểm soát rủi ro bằng giờ định mức.

---

## 1. Giới Hạn Phạm Vi Cho Gói Pilot ($450)

### Các Hạng Mục NẰM TRONG Phạm Vi (In-Scope)
- **Số lượng mẫu:** Đúng 1 mẫu Google Doc duy nhất $\rightarrow$ xuất ra 1 file PDF.
- **Độ dài tài liệu:** Tối đa 2 trang A4 chuẩn.
- **Số lượng trường cố định:** Tối đa 20 trường thay thế (`{{field_name}}`).
- **Bảng dòng hàng động (Line items):**
  - Tối đa 1 bảng trong tài liệu.
  - Tối đa 10 dòng hàng.
  - Cột bảng cố định (ví dụ: STT, Mô tả, Số lượng, Đơn giá, Thành tiền).
  - 1 loại tiền tệ duy nhất (đã được tính toán sẵn công thức trong Sheet).
- **Điểm kích hoạt (Trigger):**
  - Hoặc 1 trigger Google Form submit.
  - Hoặc 1 nút bấm/menu tùy chỉnh trên Google Sheet để người dùng duyệt và chạy.
- **Lưu trữ:** Lưu vào 1 thư mục Google Drive cố định.

### Các Hạng Mục NGOÀI Phạm Vi (Out-of-Scope — Từ Chối Hoặc Báo Giá Riêng)
- Bảng lồng nhau (Nested tables) hoặc nhóm dữ liệu động phức tạp (Group-by).
- Tài liệu nhiều hơn 2 trang hoặc phân trang tùy biến vô hạn.
- Tự động tính toán thuế suất phức tạp hoặc đa tiền tệ trong mã Apps Script (phải tính trong Sheet trước).
- Tự động gửi email đính kèm PDF ra bên ngoài (trừ khi báo giá thêm và khách phê duyệt quyền).
- Tích hợp Webhook thời gian thực từ phần mềm thứ 3 không xác thực.
- Đồng bộ hai chiều (Two-way sync) với hệ thống ERP / CRM bên ngoài.

---

## 2. Quy Tắc Dừng Lỗ Theo Giờ Thực Tế (Stop-Loss Protocol)

Mỗi dự án đều được giới hạn số giờ làm việc trực tiếp (Direct Engineering Hours) nghiêm ngặt để đảm bảo tỷ suất thu nhập trên giờ tối thiểu $40–$60/giờ.

### Bảng Giới Hạn Giờ Định Mức:

| Hạng mục dự án | Giờ kế hoạch | Điểm cảnh báo vàng (Warning Trigger) | Ngưỡng dừng đỏ (Hard Stop-Loss) |
| :--- | :--- | :--- | :--- |
| **Gói Pilot ($450)** | **7.0 giờ** | **5.5 giờ** | **7.5 giờ** |
| **Gói Custom ($750+)** | **12.0 giờ** | **9.5 giờ** | **13.0 giờ** |

### Quy Trình Kích Hoạt Khi Chạm Điểm Cảnh Báo Vàng (5.5 Giờ):
1. **Dừng viết thêm code tùy biến:** Không cố gắng lập trình thêm tính năng phụ.
2. **Đánh giá lại bài toán:** Xác định nguyên nhân gây quá giờ (do dữ liệu khách hàng không chuẩn hay yêu cầu phát sinh ngoài thỏa thuận).
3. **Thảo luận với khách hàng:**
   - Đưa ra giải pháp đơn giản hóa (ví dụ: dùng công cụ có sẵn hoặc bỏ bớt định dạng phức tạp).
   - Hoặc thông báo cho khách hàng chi phí phát sinh nếu họ muốn tiếp tục duy trì yêu cầu nằm ngoài phạm vi ban đầu.
4. **Quyền dừng dự án (Graceful Exit):** Nếu khách hàng không đồng thuận và dự án chạm ngưỡng đỏ (7.5 giờ), dừng hợp tác theo thỏa thuận, bàn giao phần đã làm được tại Milestone hiện tại để bảo toàn nguồn lực.
