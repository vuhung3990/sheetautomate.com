# Định Vị Thương Hiệu & Thiết Kế Đóng Gói Offer

> **Thương hiệu:** SheetAutomate  
> **Khẩu hiệu (Tagline):** 100% Google Workspace Native Document Automation. Zero Monthly SaaS. Zero 3rd-Party Data Risk.

---

## 1. Định Vị Thương Hiệu (Brand Positioning)

### Tuyên Bố Giá Trị Độc Quyền (Unique Value Proposition - UVP)
> *"Chúng tôi giúp các doanh nghiệp dịch vụ nhỏ loại bỏ hoàn toàn việc gõ tay hóa đơn, báo giá và chứng chỉ bằng cách cài đặt giải pháp tự động hóa tài liệu hoàn chỉnh, chạy 100% trực tiếp trên tài khoản Google Workspace của chính bạn — không phí thuê bao hàng tháng và dữ liệu không bao giờ rời khỏi hệ sinh thái Google của bạn."*

### 3 Trụ Cột Giá Trị Cốt Lõi:
1. **100% Google Workspace Native:** Giải pháp sử dụng Google Apps Script và Google Drive/Docs API nội bộ. Không dùng webhook bên thứ ba lỏng lẻo.
2. **Không Thu Phí Định Kỳ (Zero Monthly SaaS Fees):** Trả phí một lần duy nhất cho việc cài đặt và sở hữu trọn đời mã nguồn. Không chi phí ẩn hàng tháng ($30–$100/tháng như các dịch vụ khác).
3. **Bảo Mật Tuyệt Đối & Tuân Thủ Riêng Tư:** Toàn bộ dữ liệu khách hàng, tài chính, báo giá chỉ nằm trong Google Drive của khách hàng. Không lưu qua database trung gian.

---

## 2. Thiết Kế Đóng Gói Offer (Productized Offer)

### Gói 1: Setup & Repair Pilot ($450 — Cố Định)
*Dành cho doanh nghiệp đã có Google Sheet/Form và mẫu Google Doc, cần một luồng chạy hoàn tất, ổn định.*

- **Phạm vi công việc:**
  - Thiết lập hoặc sửa chữa 1 luồng tạo tài liệu tự động duy nhất.
  - Đầu vào: 1 Google Form hoặc 1 bảng Sheet đã chốt cấu trúc.
  - Đầu ra: 1 mẫu tài liệu (Doc/PDF) tối đa 2 trang, lưu vào đúng thư mục Google Drive.
  - Ghi nhận trạng thái: Tự động ghi mã trạng thái (DONE / ERROR) và gắn link PDF trực tiếp vào dòng Sheet tương ứng.
  - Tính năng chống chạy trùng (Idempotency Lock): Đảm bảo khi nhiều người thao tác không bị lặp PDF hoặc gửi sai khách.
  - Hỗ trợ bảng dòng hàng đơn giản (Dynamic line items): 1–10 dòng cố định, 1 loại tiền tệ.
- **Cam kết & Bảo hành:**
  - Kiểm tra điều kiện kỹ thuật trước (Preflight check).
  - Bảo hành lỗi kỹ thuật 30 ngày kể từ ngày bàn giao.
  - Ký hợp đồng Fixed-Price qua Upwork Escrow nếu khách yêu cầu an toàn thanh toán.

### Gói 2: Custom Bounded Automation (Từ $750 — Báo Giá Sau Preflight)
*Dành cho doanh nghiệp có yêu cầu mở rộng phức tạp hơn.*

- **Phạm vi mở rộng:**
  - Luồng dữ liệu nhiều bước (Multi-stage approval trước khi gen PDF).
  - Template phức tạp (Header/Footer động, bảng dòng hàng linh hoạt tới 20 dòng).
  - Tích hợp thêm kênh thông báo nội bộ (Slack webhook / Google Chat webhook báo người duyệt).
  - Thời gian dự toán tối đa 12 giờ làm việc trực tiếp.

---

## 3. Brand Voice & Phong Cách Giao Tiếp (Tone & Voice)

- **Minh bạch, trung thực (Radically Honest):** Không giấu giếm việc sử dụng các công cụ sẵn có nếu phù hợp. Nếu bài toán của khách có thể giải quyết nhanh bằng add-on miễn phí, sẵn sàng hướng dẫn thay vì cố ép thành dự án lớn.
- **Chuyên gia kỹ thuật thực chiến (Pragmatic Engineering):** Nói bằng con số cụ thể, thời gian tiết kiệm, tỷ lệ lỗi giảm thiểu, cơ chế khóa dữ liệu (Idempotency), không dùng thuật ngữ tiếp thị mơ hồ.
- **Tập trung vào sự an tâm (De-risking for Clients):** Luôn nhấn mạnh chia nhỏ milestone thanh toán, bảo hành 30 ngày và việc không lưu trữ dữ liệu của khách.
