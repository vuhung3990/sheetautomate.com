# Thư Mục Kế Hoạch Triển Khai SheetAutomate (`plan/`)

> Thư mục này chứa toàn bộ kế hoạch chiến lược phát triển sản phẩm, thương hiệu, tiếp cận thị trường và kiến trúc kỹ thuật của **SheetAutomate.com**.

---

## 📁 Cấu Trúc Thư Mục

```
plan/
├── README.md                                          # Mục lục & hướng dẫn tra cứu tài liệu kế hoạch
├── KE_HOACH_TRIEN_KHAI_SHEETAUTOMATE.md               # Kế hoạch tổng thể 90 ngày ban đầu
├── KHUNG_HANH_DONG_SHEETAUTOMATE_V2.md                # Khung hành động cập nhật (áp dụng chính thức)
├── TONG_HOP_PHAN_BIEN_KE_HOACH_SHEETAUTOMATE.md      # Tổng hợp phản biện & stress-test từ Codex
│
├── marketing/                                         # Kế hoạch tiếp thị, thương hiệu & bán hàng
│   ├── 01-chien-luoc-tiep-can-khach-hang-gtm.md       # Go-To-Market 90 ngày, chiến lược 0 Connects Upwork
│   ├── 02-dinh-vi-thuong-hieu-va-offer.md             # UVP, Brand Voice, Gói dịch vụ ($450 & $750+)
│   └── 03-phan-tich-doi-thu-va-loi-the-canh-tranh.md  # So sánh Autocrat, Document Studio, SaaS, Objection Handling
│
└── tech/                                              # Kế hoạch kỹ thuật, kiến trúc & kiểm soát rủi ro
    ├── 01-kien-truc-he-thong-va-apps-script.md        # Kiến trúc luồng dữ liệu, Idempotency lock, OAuth scopes
    ├── 02-quy-trinh-uat-va-nghiem-thu-3-milestone.md  # Quy trình 3 Milestone & checklist nghiệm thu UAT
    ├── 03-gioi-han-ky-thuat-va-quy-tac-stop-loss.md   # Giới hạn phạm vi (In/Out-of-Scope) & dừng lỗ theo giờ
    ├── 04-huong-dan-tich-hop-paypal-bao-mat.md        # Kiến trúc bảo mật thanh toán PayPal, chống gian lận & lộ secret
    └── design-system/                                 # Hệ thống thiết kế UI/UX & Design Tokens
        └── sheetautomate/
            └── MASTER.md                              # Source of Truth cho bảng màu, typography, WCAG 2.2 AA
```

---

## 🧭 Hướng Dẫn Sử Dụng
- **Kế hoạch chính thức cần tuân thủ:** Luôn đối chiếu theo `KHUNG_HANH_DONG_SHEETAUTOMATE_V2.md` và các tài liệu chuyên sâu trong `marketing/` và `tech/`.
- **Đóng góp kế hoạch mới:** Mọi tài liệu bổ sung trong thư mục này phải viết dưới định dạng **Markdown (.md)**.
