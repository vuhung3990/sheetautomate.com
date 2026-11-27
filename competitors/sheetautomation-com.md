# Hồ Sơ Đối Thủ: Sheet Automation (`sheetautomation.com`)

- **Website:** https://sheetautomation.com/
- **Google Workspace Marketplace:** https://workspace.google.com/marketplace/app/sheet_automation/250108887537
- **Ngày khảo sát:** 27/11/2026
- **Quy mô công bố:** 400,000+ lượt cài đặt · 4.9/5 sao · 500+ đánh giá
- **Định vị:** Native, no-code automation add-on chạy trực tiếp bên trong Google Sheets (Trigger → Condition → Action).

---

## 1. Bảng Giá & Hệ Sinh Thái Sản Phẩm

### Bảng giá Add-on chính (`sheetautomation.com/pricing.html`)
- **Free tier:** Có bản miễn phí trên Google Workspace Marketplace để bắt đầu.
- **Personal:** $6.58/tháng (trả năm $79) — 20 rules, 1K runs/tháng, 1 editor.
- **Professional (Most popular):** $9.08/tháng (trả năm $109) — 50 rules, 10K runs/tháng, trigger khi data thay đổi, 3rd-party forms, bỏ branding email, conditional action, thao tác chéo spreadsheet, Slack/webhooks.
- **Plus:** $10.75/tháng (trả năm $129) — 100 rules, 20K runs/tháng, trigger qua API, failure recovery, Branch action, Call HTTP, Search & Repeat, Automation logs & monitoring.
- **Business:** $16.58/tháng (trả năm $199) — 200 rules, 30K runs/tháng, trigger qua Webhook, event throttle control, auto-retry failed action, Custom script action, Human-in-the-loop action, rule backup/restore, hỗ trợ ưu tiên.
- **Team:** $41.58/tháng (trả năm $499) — 200 rules, 30K runs/tháng, 5 editors (hoặc mở rộng 2/5/10+ editors), shared team workspace, co-edit rules, chuyển quyền sở hữu rule.
- **Enterprise:** Custom — domain-wide rollout, quản trị & billing tập trung, volume tùy chỉnh, onboarding & solution design.
- **Chính sách:** Hoàn tiền 14 ngày (14-Day Money Back Guarantee), hỗ trợ phản hồi trong 24h.

### Hệ sinh thái sản phẩm phụ trợ & Dịch vụ
- **Share Single Sheet** (`sharesinglesheet.com`)
- **Send Email Poll** (bình chọn inline qua email)
- **Sheet Approval Workflow** (`sheet-approval.html` — $30/năm/user)
- **Form Automation** (`form-automation.html` — Free 10 responses/ngày, Standard $49/năm)
- **Automation Service** (`service.html` — nhận tư vấn Solution Design, Custom Action Development, Custom Apps Script Development, form thu lead theo task volume `<1k` đến `100k+`).

---

## 2. Toàn Bộ Ưu Điểm Của Sheet Automation So Với SheetAutomate.com

### 2.1. Phân phối chính thức & Onboarding không ma sát
- **Google-verified app trên Marketplace:** Cài đặt trong 30 giây (`Individual Install` hoặc `Domain Install`), **không bị màn hình cảnh báo** *"Google hasn't verified this app / unsafe"* như khi người dùng tự dán `Code.gs` từ SheetAutomate.com.
- **Triển khai quy mô công ty:** Hỗ trợ cài đặt hàng loạt theo Google Workspace Domain cho doanh nghiệp.
- **Social proof vượt trội:** 400,000+ installs và 500+ reviews 4.9/5 giúp tạo niềm tin tức thì so với trạng thái sản phẩm mới đang xây dựng cộng đồng.

### 2.2. Trải nghiệm No-Code Visual Rule Builder trong Sidebar
- **Không cần chạm code:** Xây dựng tự động hóa theo mô hình **Trigger → Condition → Action** hoàn toàn bằng giao diện kéo-chọn trong Sidebar Google Sheets (2–5 phút/rule).
- **Dễ bảo trì cho người không biết kỹ thuật:** Khi tên cột bị đổi, UI cảnh báo trực tiếp và cho phép chọn lại cột qua dropdown; không cần mở Apps Script editor hay đọc log JS.
- **Giảm phụ thuộc dev:** Nhân sự Ops, Sales, HR, Giáo dục có thể tự đọc hiểu và chỉnh sửa rule.

### 2.3. Hệ thống Triggers đa dạng & chính xác (13+ triggers)
Ngoài `onEdit`, `onFormSubmit`, `Time-driven` cơ bản của Apps Script, họ có các trigger chuyên sâu:
- **Theo phạm vi hẹp:** `Column is updated`, `Row is updated`, `Range is updated` (A1 notation), `Sheet is updated`, `New row is added`.
- **Bắt thay đổi từ công thức & API:** `Data is changed` (bắt được thay đổi do formula tính lại, có cả giá trị cũ & mới) và `Sheet is updated by API`.
- **Theo ngày/giờ động trong ô:** `Date has arrived`, `Time has arrived` (tự chạy X ngày trước/sau một cột ngày bất kỳ).
- **Form bên thứ 3 & Webhook:** `Form response is received` (Google Form), `Form (3rd-party) response is received` (Jotform, Zapier, Make), `Webhook is received`, `Sheet is scheduled` (hourly/daily/weekly/monthly).

### 2.4. Condition Builder & Biến (Variables) trực quan
- Hỗ trợ **Column condition**, **Range condition**, **Variable condition**, **Condition group** kết hợp **AND / OR** với **16 toán tử** (`is empty`, `is not empty`, `is equal to`, `is not equal to`, `is one of`, `is not one of`, `is more than`, `is less than`, `is at least`, `is at most`, `contains`, `does not contain`, `starts with`, `ends with`, `is after`, `is before`).
- Hỗ trợ tạo biến (`Create Variable`) và chèn placeholder dòng (`{{Name}}`, `{{Amount}}`) ngay trên UI.

### 2.5. Kho Actions đồ sộ, Human-in-the-Loop, AI & Điều khiển luồng
Trong khi SheetAutomate.com hiện có **12 flows đóng gói sẵn** theo từng bài toán riêng lẻ, Sheet Automation cho phép ghép nhiều action trong một rule:
- **Email tương tác 2 chiều:** `Send Email`, `Send Approval Request` (nút **Approve / Decline** bấm thẳng trong inbox không cần mở Sheet hay đăng nhập), `Send Confirm Request`, `Send Poll`.
- **Row actions (12 hành động):** `Move Row` (tự xử lý lệch index khi xóa dòng), `Copy Row` (kể cả sang file khác), `Create Row`, `Update Row`, `Delete Row`, `Format Row`, `Hide Row`, `Protect Row`, `Add Note`, `Lookup Row`, `Search Row`, `Export Row`.
- **Sheet & Workspace actions:** `Create/Update/Delete Sheet`, `Sort Sheet`, `Find and Replace`, `Remove Duplicates`, `Export Sheet` (PDF đính kèm email), `Hide Column`, `Create Spreadsheet` (từ template kèm copy rules), `Share Spreadsheet`, `Create Drive File`.
- **Tích hợp ngoài & AI:** `Send Slack Message`, `Send SMS Message` (Twilio), `Call Webhook`, `Call HTTP`, `Call AI` (gọi Gemini viết kết quả vào ô).
- **Advanced Flow Control:** `Branch Action` (rẽ nhánh IF/ELSE), `Conditional Action`, `Delay Action`, `Repeat For Each Row`, và **`Custom script action`** (ở gói Business).

### 2.6. Quản trị vận hành & Cộng tác nhóm (Team Collaboration)
- **Monitoring & Logs:** Xem trạng thái từng rule (active/paused/error), lần chạy cuối và lịch sử lỗi ngay trong giao diện.
- **Độ tin cậy vận hành:** `Trigger failure recovery`, `Event throttle control`, `Auto-retry failed action`, `Rule backup/restore`.
- **Chia sẻ & đồng sở hữu rule:** Export/Import rule qua file hoặc link để đồng nghiệp map cột và chạy ngay; gói Team có **Shared team workspace**, nhiều editor cùng chỉnh sửa và chuyển quyền sở hữu rule.

### 2.7. Hệ sinh thái Content, SEO & Phễu chuyển đổi
- ~29+ automation templates cài 1-click (`/automations/`), Use Cases chia theo 6 nhóm công việc, tài liệu Docs chi tiết theo từng trigger/condition/action/recipe, Blog cập nhật đều đặn.
- Các trang so sánh trực diện đánh từ khóa tìm kiếm (*Sheet Automation vs Zapier*, *vs AppSheet*, *vs Apps Script*).
- Phễu dịch vụ rõ ràng (`service.html`) kết nối trực tiếp nhu cầu vượt giới hạn no-code sang dịch vụ Custom Apps Script.

---

## 3. Điểm Tựa Khác Biệt Hiện Có Của SheetAutomate.com

Để bám sát mục tiêu mà **không đánh mất bản sắc**, cần giữ vững các lợi thế mà Sheet Automation không có:
1. **$0 Forever & Không giới hạn run/tháng:** Không khóa tính năng sau paywall, không dừng workflow khi vượt 1K–30K runs/tháng — chỉ phụ thuộc quota gốc Google Workspace.
2. **100% Open Source (MIT) & Triple-Audited:** Toàn bộ `Code.gs` và `appsscript.json` minh bạch trên GitHub, kiểm định 3 lớp (Community + AST/AI + VirusTotal), dễ audit cho doanh nghiệp khắt khe về bảo mật.
3. **100% In-Tenant & Zero Telemetry:** Không qua server/database trung gian, không giữ quyền `UrlFetch` gửi dữ liệu ra ngoài trừ khi người dùng chủ động cấu hình webhook trong Script Properties; trong khi add-on bên thứ 3 đòi quyền rộng trên Drive/UrlFetch và quản lý quota/cấu hình qua hạ tầng của họ.
4. **Thế mạnh chuyên sâu Doc/PDF Merge nghiệp vụ:** Các flow sẵn có giải quyết tốt bài toán tạo tài liệu nhiều dòng hàng, hóa đơn, hợp đồng, chứng chỉ, work order với cơ chế `LockService` + idempotency chống chạy trùng.

---

## 4. Mục Tiêu & Checklist Bám Sát (Action Plan)

| Hạng mục học hỏi / thu hẹp khoảng cách | Trạng thái hiện tại của SheetAutomate.com | Mục tiêu hành động cụ thể |
| :--- | :--- | :--- |
| **1. Giảm ma sát cài đặt (Onboarding)** | Chrome Extension mới cài dạng `.zip` (`Load unpacked`); Apps Script hiện cảnh báo unverified | Hoàn tất submit Chrome Extension lên **Chrome Web Store** (theo `TODO.md`); cải tiến hướng dẫn 1-click & video walkthrough vượt qua bước xác thực cá nhân dễ hiểu hơn. |
| **2. Mở rộng kho Flows phủ các use case top của đối thủ** | Hiện có 12 flows (mạnh về PDF/Docs & Digest) | Mở rộng lên 20+ flows (`idea/008`), ưu tiên bổ sung nhóm flow mà user tìm nhiều nhất từ đối thủ: **Move/Archive Row khi đổi Status**, **One-click Email Approval**, **Date-arrived Reminder tổng quát**, **Auto-sort / Remove Duplicates theo lịch**, **Slack / Google Chat alert**. |
| **3. Trang nội dung SEO & So sánh trực diện** | Có `WhenFit.tsx` (so sánh chung SaaS) & `llms.txt` | Xây dựng trang/mục **Use Cases** và **So sánh** (*SheetAutomate vs SaaS Add-ons / Zapier / Autocrat*) nhắm đúng nỗi đau: hết quota run, phí hàng tháng, lỗi lệch index, bảo mật dữ liệu nội bộ. |
| **4. Hỗ trợ cấu hình không cần sửa nhiều code** | User cần đọc/sửa hằng số trong `Code.gs` hoặc Script Properties | Chuẩn hóa mọi flow có bảng cấu hình (`Config` sheet hoặc `ScriptProperties` / UI menu dialog trong Sheets) để người không biết code vẫn đổi tên cột, email nhận, ngưỡng điều kiện dễ dàng. |
| **5. Dễ bảo trì & theo dõi lỗi (Observability)** | Ghi trạng thái vào cột audit (`COMPLETED`, `NEEDS_CORRECTION`) | Chuẩn hóa sheet `Audit_Log` + gửi email cảnh báo khi trigger lỗi trên các flow tự động chạy ngầm (Time-driven / OnFormSubmit). |
| **6. Phễu dịch vụ & Tăng trưởng Organic** | `plan/` còn chưa đồng bộ sau `decision/008`, chưa có form/trang dịch vụ đồng nhất | Đồng bộ `plan/` và cân nhắc giữ kênh **Custom Implementation / Setup Service** (tương tự `service.html` của đối thủ) cho doanh nghiệp thích dùng miễn phí open-source nhưng muốn thuê triển khai trọn gói. |
