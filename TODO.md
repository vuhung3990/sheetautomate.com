# SheetAutomate — TODO & Next Tasks

> Các đầu việc kỹ thuật ưu tiên cao (public repo, đồng bộ URL GitHub, badge VirusTotal động, cải thiện UX an tâm cho người dùng và Git hooks) đang được xử lý trực tiếp. Danh sách dưới đây ghi nhận **các phần việc tiếp theo** còn lại.

---

## 1. Cấu hình & Vận hành còn lại (Tùy chọn / Ngoài code)

- [ ] **Kích hoạt AI Multi-Model Security Audit trên CI (tùy chọn):**
  - Hiện `.github/workflows/flows-audit-and-deploy.yml` đang chạy fallback `Local Deep Static Security Analyzer` (khi không có LLM key/GitHub Models).
  - Bổ sung `GEMINI_API_KEY` hoặc `OPENAI_API_KEY` vào GitHub Repository Secrets (hoặc kiểm tra quyền GitHub Models qua `GITHUB_TOKEN`) nếu muốn CI quét bằng LLM thực tế ngoài bộ AST tĩnh.
- [ ] **Xác minh email nhận liên hệ `contact@sheetautomate.com`:**
  - Đảm bảo MX / Cloudflare Email Routing hoặc hộp thư đích hoạt động ổn định để không bỏ sót phản hồi hoặc yêu cầu từ cộng đồng.

---

## 2. Phát hành & Mở rộng sản phẩm

- [ ] **Phát hành Chrome Extension lên Chrome Web Store:**
  - Hoàn thiện gói `.zip` từ `extension/` (`node scripts/package-extension.mjs`) và submit lên Chrome Web Store Developer Dashboard theo checklist sẵn có trong `extension/README.md` (Single purpose, permission justifications cho `storage`, `clipboardWrite`, host permission `https://sheetautomate.com/*`).
  - Sau khi được duyệt, cập nhật link cài đặt 1-click Chrome Web Store vào `web/src/components/ExtensionPromo.tsx` (giữ nút tải `.zip` dự phòng).
- [ ] **Mở rộng thư viện Flows lên 20+ Use Cases (`idea/008`):**
  - Hiện có 12 flows chuẩn trong `flows/`. Bổ sung dần 8 use cases tiếp theo dựa trên nhu cầu thực tế từ người dùng (mỗi flow mới phải đạt chuẩn `flows/schema.json`, least-privilege OAuth, `LockService`, `tests/flows-runtime.test.mjs`).
- [ ] **Mở rộng mẫu theo ngành trên Interactive Simulator (`idea/001`):**
  - Trạng thái hiện tại: `DRAFT`. Chỉ bổ sung tab/mẫu ngành mới khi có tín hiệu nhu cầu rõ ràng từ người dùng.

---

## 3. Đồng bộ tài liệu chiến lược & Tăng trưởng Organic (GTM)

- [ ] **Đồng bộ thư mục `plan/` theo Quyết định 008 & 009 (100% Free Forever & Open Source):**
  - Rà soát và cập nhật (hoặc đánh dấu lưu trữ lịch sử) các tài liệu còn mô tả mô hình thu phí cũ ($5 / $450–$750 / PayPal):
    - `plan/README.md`
    - `plan/marketing/01-chien-luoc-tiep-can-khach-hang-gtm.md`
    - `plan/marketing/02-dinh-vi-thuong-hieu-va-offer.md`
  - Làm rõ phễu hiện hành: thu hút user tự nhiên qua Open-Source Flows + Chrome Extension miễn phí (và phạm vi nhận tư vấn/triển khai custom nếu vẫn duy trì).
- [ ] **Triển khai chuỗi video ngắn hướng dẫn & xử lý lỗi (`idea/003` — `IN PLANNING`):**
  - Quay 1 video thử nghiệm 2–3 phút giải quyết các lỗi phổ biến của Google Sheets / Autocrat (Apps Script timeout, chống trùng bằng `LockService`, format ngày/tiền tệ, bảng dòng hàng động) kèm link dẫn về `https://sheetautomate.com/`.
- [ ] **Phát triển kênh cộng đồng Organic (`idea/007`):**
  - Chọn 1–2 kênh trọng tâm (YouTube, LinkedIn, Reddit `r/googlesheets`, `r/gsuite`, `r/smallbusiness`) để chia sẻ flow miễn phí, giải đáp lỗi kỹ thuật và đo lường traffic / lượt cài extension.
