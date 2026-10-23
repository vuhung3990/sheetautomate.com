# Quy Trình Nghiệm Thu Kỹ Thuật (UAT) & 3 Milestone Triển Khai

> **Mục tiêu:** Đảm bảo mọi dự án triển khai cho khách hàng đều được kiểm soát chất lượng chặt chẽ, giảm thiểu tối đa rủi ro hoàn tiền và đạt sự hài lòng cao nhất.

---

## 1. Cơ Cấu 3 Milestone Tiêu Chuẩn

```
Milestone 1 ($75)                Milestone 2 ($300)               Milestone 3 ($75)
Feasibility Preflight   ───►     Build & Staging Test    ───►     Production & Video
(Khảo sát & Kiểm tra)            (Lập trình & Thử tải)            (Bàn giao & Bảo hành)
```

### Milestone 1: Feasibility Preflight ($75)
- **Thời gian thực hiện:** Trong vòng 24–48 giờ làm việc.
- **Nhiệm vụ:**
  1. Kiểm tra quyền Google Workspace Admin của khách hàng (có cho phép chạy Apps Script và OAuth nội bộ không).
  2. Rà soát cấu trúc Google Sheet/Form (kiểm tra kiểu dữ liệu, các cột bắt buộc, tính nhất quán).
  3. Kiểm tra mẫu Google Doc Template (vị trí thẻ placeholder `{{...}}`, định dạng bảng).
- **Tiêu chí nghiệm thu:**
  - Xuất ra 1 tài liệu PDF mẫu chạy thử nghiệm thành công từ 1 dòng dữ liệu thật.
  - *Nếu phát hiện xung đột bảo mật không thể khắc phục:* Hoàn lại 100% tiền Milestone 1 cho khách hàng.

### Milestone 2: Build & Staging Test ($300)
- **Thời gian thực hiện:** 2–4 ngày làm việc.
- **Nhiệm vụ:**
  1. Viết mã nguồn Google Apps Script hoàn chỉnh theo chuẩn kiến trúc.
  2. Tích hợp cơ chế khóa chống trùng (Idempotency Lock).
  3. Thiết lập xử lý bảng dòng hàng động (line items) nếu có.
  4. Tạo môi trường Staging (bản sao Sheet + Template) để kiểm thử.
- **Tiêu chí nghiệm thu:**
  - Chạy thử nghiệm thành công 5–10 trường hợp dữ liệu khác nhau (dữ liệu chuẩn, dữ liệu trống trường không bắt buộc, dữ liệu ký tự đặc biệt).
  - Khách hàng xem video demo hoặc tự bấm thử nghiệm trên bản Staging và bấm duyệt Milestone 2.

### Milestone 3: Production Handover & Video ($75)
- **Thời gian thực hiện:** Trong vòng 24 giờ sau khi Milestone 2 được duyệt.
- **Nhiệm vụ:**
  1. Triển khai script vào tài khoản Google Workspace chính thức của khách hàng.
  2. Cấp quyền truy cập và hướng dẫn khách ủy quyền OAuth an toàn.
  3. Quay video Loom (dưới 5 phút) hướng dẫn nhân viên cách sử dụng và cách đọc thông báo lỗi.
  4. Bàn giao tài liệu hướng dẫn và kích hoạt gói bảo hành kỹ thuật 30 ngày.
- **Tiêu chí nghiệm thu:**
  - Khách hàng chạy thử thành công 1 tài liệu thật trên môi trường Production.
  - Giải ngân Milestone 3 và khách hàng để lại đánh giá trên Upwork/Website.

---

## 2. Bảng Kiểm Tra Nghiệm Thu (UAT Checklist)

| STT | Hạng mục kiểm tra | Tiêu chuẩn đạt | Kết quả |
| :--- | :--- | :--- | :--- |
| 1 | **Tính chính xác dữ liệu** | Tất cả thẻ `{{tag}}` trong Doc được thay thế chính xác, không còn thẻ sót `{{...}}` | [ ] Đạt |
| 2 | **Định dạng số & ngày** | Tiền tệ có dấu phân cách hàng nghìn (ví dụ `$1,250.00`), ngày tháng theo đúng chuẩn khách yêu cầu | [ ] Đạt |
| 3 | **Độ dài và phân trang** | Nội dung dài không làm vỡ layout template, tối đa trong giới hạn trang cam kết (1–2 trang) | [ ] Đạt |
| 4 | **Đường dẫn lưu trữ** | File PDF xuất ra được lưu vào đúng thư mục Google Drive được chỉ định, tên file đặt theo chuẩn quy ước | [ ] Đạt |
| 5 | **Ghi ngược trạng thái** | Cột trạng thái trên Sheet ghi `DONE` và kèm link mở trực tiếp file PDF trên Drive | [ ] Đạt |
| 6 | **Bảo vệ chống trùng** | Thao tác bấm đúp liên tục hoặc submit cùng lúc không tạo ra 2 PDF trùng cho cùng 1 bản ghi | [ ] Đạt |
| 7 | **Xử lý ngoại lệ** | Khi thiếu dữ liệu bắt buộc, script không crash mà ghi thông báo lỗi rõ ràng vào Sheet | [ ] Đạt |
