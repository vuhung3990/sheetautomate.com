# Kế hoạch triển khai SheetAutomate.com từ con số 0

> **Cập nhật sau phản biện:** áp dụng [Khung hành động phiên bản 2](./KHUNG_HANH_DONG_SHEETAUTOMATE_V2.md) cho offer, kênh tìm khách với 0 Connects, onboarding, stop-loss và UAT/milestone. Những phần tương ứng bên dưới là phương án ban đầu để tham chiếu, không áp dụng đồng thời với bản điều chỉnh.

**Ngày lập:** 23/10/2026. **Chu kỳ đầu:** 90 ngày kể từ ngày bắt đầu thực hiện.

**Mục tiêu:** có 1–3 khách quốc tế trả tiền cho dịch vụ tự động hóa bảng tính, giao hàng thành công và biết bài toán nào đáng tiếp tục. Sau đó mới đóng gói thành sản phẩm.

Đây là kế hoạch thử nghiệm kinh doanh, không phải dự báo chắc chắn có khách hay có lãi. Giá, số giờ và các ngưỡng quyết định dưới đây là giả thuyết ban đầu, cần thay bằng dữ liệu thực tế.

## 1. Những điều đã thống nhất với chủ website

| Nội dung | Quyết định |
| --- | --- |
| Xuất phát điểm | Xây từ đầu, chưa có sản phẩm, ngách hay mạng lưới khách hàng |
| Mô hình ban đầu | Dịch vụ tự động hóa có phạm vi cố định → chuẩn hóa → sản phẩm nếu có bằng chứng |
| Thị trường | Quốc tế; website, đề xuất và bán hàng bằng tiếng Anh |
| Năng lực | Có thể lập trình Apps Script, Python/JavaScript, tích hợp API và dùng AI hỗ trợ |
| Thời gian | 30 giờ/tuần |
| Ngân sách | Tối đa 100 USD/tháng cho công cụ, hosting và tìm khách |
| Mục tiêu 90 ngày | 1–3 khách trả tiền; chưa đặt mục tiêu doanh thu tháng cố định |
| Cách trao đổi | Chat/email là chính, gọi khi cần; tiếng Anh có AI hỗ trợ |
| Nguyên tắc chọn việc | Bài toán cụ thể, dễ demo, dễ triển khai và nghiệm thu |

Kế hoạch viết bằng tiếng Việt để sử dụng nội bộ. Nội dung mẫu dành cho khách viết bằng tiếng Anh.

Chưa xác minh website đang phục vụ nội dung gì: công cụ duyệt web không truy cập được tên miền trong lần kiểm tra này. Không suy ra website bị lỗi hoặc tên miền chưa được cấu hình. Thư mục dự án hiện chưa có mã nguồn ứng dụng.

## 2. Kết quả brainstorm và quyết định chung

Ba agent đã phản biện độc lập về mô hình kinh doanh, tìm khách và triển khai/kinh tế, rồi xem lại đề xuất chung.

| Vấn đề tranh luận | Kết luận đã thống nhất |
| --- | --- |
| Làm SaaS ngay hay dịch vụ trước? | Dịch vụ trước; website là nơi chứng minh năng lực và nhận yêu cầu |
| Chọn một ngành ngay hay chọn một công việc? | Chọn một công việc hẹp trước; tìm ngành qua các khách có nhu cầu giống nhau |
| PDF hay gộp CSV? | PDF là ứng viên mặc định vì demo trực quan; CSV có lợi thế ít phụ thuộc layout. Kiểm tra nhu cầu rồi chỉ xây một hướng |
| Bán gì khi có sẵn công cụ miễn phí? | Bán cấu hình vào quy trình thật, kiểm tra dữ liệu, chạy thử và bàn giao; có thể dùng công cụ sẵn nếu phù hợp |
| Giá thử nghiệm? | 450 USD/pilot đúng phạm vi. Chưa xem là giá thị trường đã được xác nhận |
| Có bán thuê bao ngay không? | Không đặt mục tiêu thuê bao. Chỉ bán bảo trì nếu có nhu cầu và công việc cụ thể |
| Bao giờ làm sản phẩm? | Khi có các dự án trả phí đủ giống nhau và bằng chứng khách muốn mua giải pháp tiêu chuẩn |

**Một câu định hướng:** SheetAutomate giúp doanh nghiệp nhỏ loại bỏ một thao tác bảng tính lặp lại bằng một giải pháp được cài đặt và bàn giao trọn gói.

## 3. Chọn bài toán đầu tiên bằng kiểm tra nhu cầu

### 3.1. Hai ứng viên, chỉ triển khai một

| | Ứng viên A — ưu tiên kiểm tra | Ứng viên B — dự phòng |
| --- | --- | --- |
| Tên offer | One-page PDF documents from your existing Google Sheet | Recurring CSV imports into one clean Google Sheet |
| Vấn đề | Nhập lại dữ liệu từ Sheet vào một tài liệu theo mẫu | Định kỳ copy nhiều CSV cùng cấu trúc vào bảng tổng |
| Đầu ra | Chọn một bản ghi → tạo PDF → lưu Drive → ghi link vào Sheet | File CSV trong một thư mục Drive → kiểm tra → nhập vào Sheet → ghi log |
| Điểm dễ demo | Nhìn thấy ngay tài liệu trước/sau | Chạy lại file không thêm dữ liệu trùng, file sai được báo rõ |
| Bẫy cần tránh | Thiết kế nhiều mẫu, bảng dòng hàng biến động, phân trang, tính giá | Mapping tùy ý, tự đoán dữ liệu bẩn, đối soát tài chính, nhiều loại file |

PDF có thể là phiếu xác nhận, thư theo mẫu hoặc báo giá một trang với giá trị đã tính sẵn. Không quảng bá thành hệ thống báo giá đầy đủ: báo giá có nhiều dòng hàng, tính giá hay duyệt nhiều cấp là phạm vi khác.

### 3.2. Kiểm tra trong ngày 1–2, tối đa 8 giờ

1. Tìm 20 yêu cầu thuê triển khai công khai: khoảng 10 về PDF và 10 về CSV/Sheets. Nếu không tìm đủ, ghi số thực tế; không thêm bài không liên quan để đủ chỉ tiêu.
2. Ưu tiên yêu cầu gần đây, đọc nội dung gốc, ghi ngày và loại yêu cầu trùng. Kiểm tra trạng thái trước khi coi đó là cơ hội ứng tuyển.
3. Ghi lại: URL, ngày kiểm tra, bài toán, đầu vào/đầu ra, ngân sách nếu công khai, phần ngoài phạm vi, điều kiện ngôn ngữ và tình trạng tuyển.
4. Phân biệt bài thuê người làm với bài hỏi code hoặc quảng bá công cụ. Hai loại sau chỉ giúp hiểu ngôn ngữ vấn đề.
5. Với mỗi hướng, chấm 0–2 điểm cho: có người mua tìm người làm; phù hợp scope; tiếp cận được; có giá trị lặp lại; triển khai được bằng năng lực hiện có. Tổng tối đa 10 điểm/yêu cầu.

Một yêu cầu PDF chỉ được đếm là phù hợp khi có thể giới hạn ở một trang, một mẫu, tối đa 20 trường cố định và giá trị đã có trong Sheet; không mặc định nhận tính giá, bảng động hoặc tự gửi email. Với CSV, cần xác định được một schema, cách nhập và khóa chống trùng.

**Quy tắc chọn:**

- Giữ PDF nếu tìm được ít nhất 3 yêu cầu phù hợp và có tín hiệu người mua rõ; nếu CSV phù hợp hơn rõ rệt thì chọn CSV.
- Nếu cả hai phù hợp tương đương, chọn PDF vì dễ trình bày kết quả trong demo.
- Nếu chưa có hướng nào đủ tín hiệu, dành thêm tối đa một tuần tìm hiểu và trao đổi; chưa xây hai demo hoặc thêm nhiều dịch vụ.
- Ba yêu cầu phù hợp chỉ đủ chọn thứ tự thử bán, chưa chứng minh thị trường sẽ mua offer 450 USD của mình.

### 3.3. Dữ liệu khảo sát ban đầu và giới hạn

Đã tìm thấy các yêu cầu thuê triển khai công khai về [nhập CSV, chống trùng và log](https://www.upwork.com/freelance-jobs/apply/Google-Sheets-Automation-Specialist_~022110797500312077183/), [inventory và tạo báo giá](https://www.upwork.com/freelance-jobs/apply/Google-Sheets-Automation-Expert-Inventory-Pricing-Quoting-System_~022112636395116922317/) và [tạo PDF hàng loạt từ Sheets](https://www.upwork.com/freelance-jobs/apply/Bulk-Generate-Branded-PDFs-from-Google-Sheet_~022105685070870441761/).

Đây là ví dụ về công việc được người mua mô tả, chưa phải danh sách lead đã xác nhận còn mở. Hai yêu cầu đầu có phạm vi rộng hơn pilot; yêu cầu CSV còn có điều kiện tiếng Tây Ban Nha. Yêu cầu PDF có thêm thiết kế và công việc nội dung. Chúng không được tự động tính là ba job phù hợp trong bước kiểm tra trên.

## 4. Gói dịch vụ đầu tiên và cách thu tiền

### 4.1. Pilot mặc định: Sheet → PDF, giá thử nghiệm 450 USD

**Kết quả bán:** biến dữ liệu có sẵn trong một Google Sheet thành PDF một trang theo mẫu, có kiểm tra và hướng dẫn sử dụng.

**Bao gồm:**

- Một doanh nghiệp, một spreadsheet, một bảng dữ liệu đã thống nhất cấu trúc.
- Một mẫu một trang, tối đa 20 trường cố định, một ngôn ngữ và một loại tiền tệ nếu có.
- Khách cung cấp mẫu hiện có hoặc chọn mẫu demo cơ bản. Chốt layout trước khi nhận dự án.
- Tổng tiền và giá trị nghiệp vụ lấy từ Sheet; không xây công thức định giá hoặc tư vấn thuế.
- Người dùng chọn bản ghi và chủ động tạo PDF. File lưu trong một thư mục Drive thuộc khách.
- Link PDF, thời gian và trạng thái được ghi lại; lỗi được hiển thị để xử lý.
- Một vòng chỉnh trong phạm vi đã thống nhất, một video hướng dẫn và tài liệu bàn giao ngắn.
- Bảy ngày sửa lỗi so với đặc tả đã nghiệm thu.

**Ngoài phạm vi:** nhiều template, bảng dòng hàng biến động, OCR, scraping, CRM, chữ ký điện tử, email hàng loạt, logic thuế, tính giá, nhiều ngôn ngữ và hỗ trợ 24/7.

**Thời hạn mục tiêu:** 5–7 ngày làm việc sau khi có đủ mẫu, dữ liệu, quyền và khoản thanh toán đầu tiên. Ước lượng lại trước khi cam kết nếu mẫu thực tế phức tạp hơn.

**Bảo vệ phạm vi:** thêm đầu ra, thêm mẫu hoặc thay đổi quy tắc là một yêu cầu mới. Gửi phần thay đổi và giá bằng văn bản trước khi làm.

### 4.2. Nếu chọn CSV thay cho PDF

Giữ cấu trúc bán pilot tương tự; kiểm tra lại mức giá sau khi xem dữ liệu. Scope đề xuất:

- Một thư mục Drive, CSV UTF-8, một schema đã thống nhất và một Sheet đích.
- Chỉ nhập thêm bản ghi mới; không đồng bộ cập nhật/xóa hai chiều.
- Một khóa định danh do khách xác nhận; tối đa ba quy tắc làm sạch cụ thể.
- Một nút chạy và một lịch chạy; có log file đã nhập và dòng bị từ chối.
- Giới hạn dung lượng/số dòng được ghi sau khi benchmark dữ liệu mẫu, trước khi chốt giá.
- Khách vẫn xuất file từ phần mềm nguồn nếu chưa có kết nối: gọi đúng là tự động hóa bước nhập và xử lý CSV.
- Không gồm XLSX, dữ liệu scan, đoán bản ghi trùng bằng AI, đối soát hay quyết định tài chính.

### 4.3. Thanh toán và các mốc

Với khách trực tiếp, đề xuất 50% khi chốt scope, 50% sau khi đạt nghiệm thu và trước bàn giao cuối. Ghi rõ mốc, phần việc tương ứng và cách xử lý nếu dừng dự án. Đây là điều khoản đề xuất, sẽ thống nhất theo từng khách.

Với khách từ Upwork, dùng hợp đồng và milestone của nền tảng. Chỉ bắt đầu phần việc khi milestone tương ứng đã funded; nộp công việc theo quy trình của nền tảng. Phân biệt tiền được cấp vào milestone với tiền đã được giải ngân và rút được. [Upwork milestones](https://support.upwork.com/hc/en-us/articles/44564821903763-Understanding-milestones-on-fixed-price-contracts).

Với khách trực tiếp, có thể kiểm tra PayPal Business/Invoicing trước khi viết checkout riêng. Trang PayPal dành cho Việt Nam có giới thiệu tính năng nhận thanh toán và invoice; phải kiểm tra tài khoản thực tế, xác minh và phí trước khi dùng. [PayPal VN](https://www.paypal.com/vn/business/accept-payments?locale.x=en_US).

Không mặc định tích hợp Stripe: tại thời điểm khảo sát, Việt Nam không có trong danh sách quốc gia mở Stripe Payments trực tiếp. Kiểm tra điều kiện của tài khoản/pháp nhân thực tế trước khi chọn phương án. [Stripe availability](https://stripe.com/global).

Khách có nguồn từ marketplace tiếp tục trao đổi và thanh toán theo quy định của marketplace; website không dùng để chuyển giao dịch ra ngoài trái điều khoản.

### 4.4. Sau pilot

- Xin phản hồi về công việc đã hoàn thành, thời gian sử dụng và điểm còn khó; xin phép riêng nếu muốn đăng case study.
- Không ép gói bảo trì cho workflow khách tự dùng ổn định.
- Hỗ trợ hoặc mở rộng được báo giá riêng. Chỉ thiết kế gói định kỳ khi có nội dung công việc, giới hạn giờ và thời gian phản hồi cụ thể.
- Sau ba pilot, xem xét mức giá tiêu chuẩn, ví dụ từ 650 USD nếu dữ liệu công việc và giá trị cho khách hỗ trợ mức này. Chưa công bố như một mức giá đã kiểm chứng.

## 5. Định vị trước công cụ miễn phí và đối thủ

Sheetgo hiện có gói miễn phí và Automations Pro 35 USD/tháng khi thanh toán năm hoặc 50 USD khi thanh toán tháng. Coefficient cũng có gói miễn phí và trả phí. Đây là bằng chứng về sản phẩm cạnh tranh, không xác nhận nhu cầu ngách của SheetAutomate. [Sheetgo](https://www.sheetgo.com/pricing/automations/), [Coefficient](https://coefficient.io/pricing).

Google có [sample tạo PDF bằng Apps Script](https://developers.google.com/apps-script/samples/automations/generate-pdfs), [IMPORTRANGE](https://support.google.com/docs/answer/3093340?hl=en) và [conditional notifications cho một số tài khoản](https://support.google.com/docs/answer/14099459?hl=en). Không nên bán một tính năng cơ bản như thể chưa có giải pháp thay thế.

**Lý do để khách mua cần kiểm chứng:** họ muốn có người áp dụng đúng vào file và quy trình của họ, xử lý trường hợp lỗi, chạy thử, ghi rõ trách nhiệm và bàn giao dùng được. Phí triển khai một lần không so trực tiếp với phí thuê phần mềm hàng tháng; phải so tổng công cài đặt, vận hành và nhu cầu thực tế.

Nếu một tính năng có sẵn đã giải quyết đầy đủ, hướng dẫn khách dùng hoặc bán việc cấu hình công cụ đó với phạm vi minh bạch. Không viết lại chỉ để có code riêng.

## 6. Website tối thiểu để bán được dịch vụ

**Trần công xây bản đầu: 8 giờ.** Website hỗ trợ cuộc bán hàng; chưa cần biến thành ứng dụng.

### 6.1. Nội dung cần có

| Vị trí | Nội dung | Mục đích |
| --- | --- | --- |
| Đầu trang | Một vấn đề, một kết quả, CTA rõ | Khách hiểu ngay mình làm gì |
| Demo | Video 60–90 giây với dữ liệu giả, PDF mẫu | Chứng minh giải pháp hoạt động |
| Phạm vi và giá | Pilot 450 USD, bao gồm/ngoài phạm vi, thời gian dự kiến | Lọc yêu cầu phù hợp |
| Cách làm | Gửi mẫu → chốt scope → triển khai → nghiệm thu → bàn giao | Giảm lo ngại về quá trình |
| FAQ | Quyền dữ liệu, ai sở hữu, sửa lỗi, trường hợp không phù hợp | Trả lời câu hỏi mua hàng |
| Liên hệ | Form mô tả quy trình và email công việc | Bắt đầu trao đổi |

Trang chủ có thể chứa toàn bộ offer đầu. Chỉ cần thêm trang privacy và thông tin điều khoản dịch vụ phù hợp với cách vận hành. Chưa cần blog hàng chục bài, tài khoản người dùng, dashboard, credit, checkout tự động hoặc Marketplace add-on.

### 6.2. Copy tiếng Anh cho hướng PDF

> **Turn spreadsheet rows into one-page PDFs — without retyping.**
>
> I set up a focused workflow using your existing Google Sheet and a fixed document template. Generate a PDF, save it to your Drive, and keep the file link in your Sheet.
>
> **Fixed-scope pilot: $450.** One spreadsheet, one one-page template, up to 20 fixed fields, validation, and a short handover guide. Final scope is confirmed after reviewing a sample.
>
> **CTA: Tell me about your workflow**

Ghi rõ demo là “Sample workflow using fictional data”. Chưa có khách thì giới thiệu trung thực là người triển khai độc lập; dùng ngôi “I”. Không dùng logo khách, testimonial, số giờ tiết kiệm hay đội ngũ chưa có thật.

### 6.3. Form nhận yêu cầu

Thu thập: tên, email công việc, công việc đang làm thủ công, tần suất, đầu ra mong muốn, công cụ đang dùng và thời điểm muốn triển khai. Ngân sách có thể là trường tùy chọn.

Chưa yêu cầu gửi file thật hoặc kết nối Google ở lần liên hệ đầu. Sau khi xác nhận phù hợp, xin dữ liệu mẫu đã ẩn thông tin cần bảo vệ hoặc xem qua chia sẻ màn hình. Link đặt lịch là tùy chọn; có thể hẹn bằng email trước.

## 7. Tìm khách quốc tế với ngân sách nhỏ

### 7.1. Một kênh chính, một kênh dự phòng

**Kênh chính dự kiến: Upwork**, nếu kiểm tra thấy job phù hợp, có thể sử dụng tài khoản và chi phí ứng tuyển nằm trong ngân sách. Lợi thế cần thử là tiếp cận người đã đăng nhu cầu thuê; không giả định hồ sơ mới sẽ dễ thắng.

**Dự phòng:** phản hồi yêu cầu thuê công khai trong cộng đồng cho phép, trao đổi có ngữ cảnh, hoặc giới thiệu từ người triển khai Workspace. Chọn tối đa hai nơi hoạt động. Không chạy đủ nhiều kênh cùng lúc hoặc mua quảng cáo trong chu kỳ đầu.

Nếu chưa sử dụng được Upwork, chuyển giờ và ngân sách chưa tiêu sang tìm yêu cầu công khai và làm việc với đối tác; không để kế hoạch phụ thuộc hoàn toàn vào một nền tảng.

### 7.2. Quy trình tuần

1. Hai buổi lọc job/yêu cầu công khai; bỏ việc vượt scope, điều kiện không đáp ứng hoặc không có đầu ra rõ.
2. Mỗi cơ hội phù hợp: đọc kỹ, ghi vấn đề cụ thể, xác định một câu cần làm rõ và chọn demo liên quan.
3. Gửi proposal riêng cho job đó; không gửi hàng loạt một mẫu. Kiểm tra chi phí ứng tuyển trước khi gửi.
4. Trao đổi bất đồng bộ để lấy mẫu và quy tắc; gọi 15–20 phút khi mô tả bằng chữ không đủ rõ.
5. Có fit thì gửi scope một trang và giá. Chưa có fit thì từ chối hoặc đề nghị tách một bước nhỏ nếu người mua đồng ý.
6. Ghi phản hồi và hành động tiếp theo. Giữ tối thiểu 6–8 giờ/tuần tìm khách kể cả khi đang giao pilot.

### 7.3. Kiểm soát chi phí ứng tuyển

Upwork công bố Connects giá 0,15 USD và số Connects cần cho mỗi proposal thay đổi. Trần 40 USD tương đương khoảng 266 Connects trước các điều chỉnh/phí có thể áp dụng; không cam kết mua được một số proposal cố định. [Upwork pricing](https://www.upwork.com/pricing/freelancer).

- Không boost proposal trong thử nghiệm đầu.
- Review khi đã dùng 20 USD hoặc gửi 5–10 proposal phù hợp, tùy điều kiện nào đến trước.
- Không có hội thoại có ý nghĩa: sửa độ phù hợp job, hồ sơ, hai dòng đầu và demo trước khi chi nửa ngân sách còn lại.
- Không mua thêm chỉ để đủ chỉ tiêu số lượng.

### 7.4. Mẫu proposal tiếng Anh

Chỉ dùng câu nói có demo sau khi demo thực sự hoàn thành. Với marketplace, chia sẻ demo bằng hình thức nền tảng cho phép.

> Hi [Name], I can help with the step where you [specific manual task from the job post].
>
> A focused first version would use one Google Sheet and one fixed one-page template. You select a record, generate the PDF, and get its Drive link back in the Sheet. It would not send anything automatically.
>
> I have a short sample using fictional data showing the workflow and missing-field checks.
>
> Could you share a redacted example of the current template and explain how often you prepare these documents? I can then confirm a fixed scope and price.

### 7.5. Mẫu làm rõ và đề xuất phạm vi

> To confirm the first version: one spreadsheet, one one-page template, and up to 20 fixed fields. All commercial values are already calculated in your Sheet.
>
> Delivery includes PDF generation, field validation, Drive links, one revision within scope, and a handover guide. It excludes variable item tables, pricing calculations, and automatic email delivery.
>
> The pilot is $450. I can confirm the delivery date once we have the approved template, sample data, required access, and the first funded milestone/payment.

## 8. Quy trình bán hàng và giao pilot

| Bước | Việc làm | Đầu ra cần có |
| --- | --- | --- |
| 1. Lọc yêu cầu | Xem công việc, mức thường xuyên, phạm vi và người quyết định | Có/không phù hợp; lý do |
| 2. Khảo sát ngắn | Xin khách mô tả lần làm gần nhất, thao tác và lỗi; lấy mẫu phù hợp | Input, output, quy tắc, người dùng, giá trị cần đạt |
| 3. Chốt scope | Một trang bằng tiếng Anh, gồm nghiệm thu, giới hạn và trách nhiệm cung cấp dữ liệu | Khách xác nhận bằng văn bản |
| 4. Thanh toán | Theo mốc đã thống nhất; kiểm tra trạng thái tiền | Mốc đầu đủ điều kiện bắt đầu |
| 5. Build | Bản sao/dữ liệu giả, cấu hình tách riêng, kiểm tra lỗi | Bản chạy thử |
| 6. UAT | Khách kiểm tra các tình huống đã chốt | Danh sách đạt/chưa đạt, sửa theo scope |
| 7. Bàn giao | Tài nguyên thuộc khách, tài liệu và video | Khách tự chạy được |
| 8. Sau bàn giao | Sửa lỗi theo thời hạn, hỏi kết quả sử dụng, xin phép case study | Phản hồi và dữ liệu cải tiến |

**Năm câu hỏi discovery:** lần gần nhất làm việc này là khi nào; mỗi lần mất bao lâu; đầu vào có thay đổi cấu trúc không; ai sử dụng và duyệt mua; điều gì khiến khách muốn giải quyết bây giờ?

Không nhận dự án fixed-price trước khi xem mẫu đại diện. Không làm thử toàn bộ miễn phí; demo sẵn chỉ chứng minh năng lực, pilot là phần áp dụng cho khách.

### Checklist nghiệm thu hướng PDF

- [ ] Trường trên PDF khớp dữ liệu chuẩn; giá trị tổng lấy đúng từ Sheet, không mặc định xác nhận công thức nguồn.
- [ ] Chốt định dạng ngày, tiền và giới hạn độ dài trường; thử dữ liệu dài nhất; PDF không tràn/cắt chữ.
- [ ] Thiếu trường bắt buộc hoặc sai định dạng: dừng và báo rõ; không ghi trạng thái thành công.
- [ ] Chỉ tạo khi người dùng chủ động yêu cầu; không có email tự gửi.
- [ ] Chạy lại cùng bản ghi không sinh file trùng ngoài ý muốn; quy tắc phiên bản được ghi rõ.
- [ ] Hai lượt chạy gần nhau không trộn dữ liệu; có thể khóa chạy và báo đang xử lý.
- [ ] File chỉ vào thư mục đã thống nhất; không tự mở quyền công khai.
- [ ] Có link, thời gian, trạng thái và lỗi đủ để người dùng xử lý.
- [ ] Khách tự chạy bằng tài khoản của mình và hoàn thành theo tài liệu.

Nếu chuyển sang CSV, thay bằng kiểm tra: đủ số dòng hợp lệ, không trùng theo khóa, nhập lại an toàn, schema sai bị từ chối, log có thể đối chiếu và dữ liệu gốc được giữ lại.

## 9. Kỹ thuật vừa đủ cho giai đoạn dịch vụ

- Website tĩnh trên hosting phù hợp ngân sách; form nhận yêu cầu; email công việc; video demo đơn giản.
- Apps Script + Google Sheets/Drive là lựa chọn đầu cho hai pilot. Python/JS ngoài Google chỉ khi có yêu cầu rõ mà cách trên không đáp ứng.
- Cấu hình/mapping tách khỏi code; phiên bản hóa code; có bản sao trước thay đổi và cách khôi phục.
- Tài nguyên nằm trong tài khoản khách. Nếu dùng trigger, hướng dẫn tạo dưới tài khoản phù hợp của khách: installable trigger chạy theo tài khoản người tạo. [Google trigger documentation](https://developers.google.com/apps-script/guides/triggers/installable).
- Kiểm tra loại tài khoản và tải thực tế trước khi hứa công suất. Apps Script có quota theo người dùng/tài khoản và có thể dừng khi vượt giới hạn. [Google quotas](https://developers.google.com/apps-script/guides/services/quotas).
- Dùng quyền cần thiết, log tránh chứa nội dung khách và hướng dẫn thu hồi quyền. Không đưa dữ liệu thật vào AI hỗ trợ nếu chưa được khách cho phép.
- Khách cài/chạy trong môi trường của họ vẫn cần kiểm tra ủy quyền và chính sách quản trị. Đây không phải cách mặc định được miễn các yêu cầu OAuth.
- Chưa phát hành public Marketplace add-on. Nếu sau này chọn hướng này, đưa app review và OAuth phù hợp vào kế hoạch riêng; không hứa ngày phát hành trước khi biết yêu cầu. [Marketplace review](https://developers.google.com/workspace/marketplace/about-app-review).

AI dùng để hỗ trợ code, diễn đạt tiếng Anh, chuẩn bị tài liệu và rà soát. Người triển khai chịu trách nhiệm kiểm tra code, dữ liệu và cam kết với khách. Không cần thêm tính năng AI vào sản phẩm đầu tiên.

## 10. Kế hoạch 90 ngày theo tuần

Mỗi tuần tối đa 30 giờ. Đầu ra và dữ liệu quyết định bước tiếp theo; ngày trong bảng không thay thế điều kiện kiểm chứng.

| Tuần | Trọng tâm | Việc cụ thể | Đầu ra / điều kiện hoàn tất |
| --- | --- | --- | --- |
| 1 | Chọn bài toán | Screening tối đa 8h; chọn một hướng; xây demo tối đa 8h; website tối đa 8h; tracker/hồ sơ và review 6h | Một offer, một demo, một trang bán hàng; hoặc ghi chưa đủ tín hiệu và chuyển một phần build sang tìm hiểu |
| 2 | Mở hội thoại | Hoàn thiện hồ sơ; gửi proposal trong trần chi phí; trả lời yêu cầu phù hợp; khảo sát qua chat/call | Tracker có cơ hội thật, phản hồi và lý do loại; copy được sửa theo khách |
| 3 | Thử bán pilot | Demo theo vấn đề; lấy mẫu; xác định quyền mua; gửi 1–2 scope nếu có fit | Đề nghị mua cụ thể, phản đối được ghi lại; chưa có fit thì không ép gửi báo giá |
| 4 | Giao hoặc sửa thử nghiệm | Có khách: build/UAT/bàn giao. Chưa có: audit kênh, vấn đề và lời chào bán | Review ngày 30; phân biệt thiếu tiếp cận với khách từ chối |
| 5–6 | Củng cố offer | Tiếp tục cùng workflow nếu có tín hiệu; rút gọn onboarding; ghi giờ và lỗi | Pilot đầu được nghiệm thu nếu bán được; SOP phiên bản 1 |
| 7–8 | Tìm khách tiếp theo | Dùng demo/case study đã được phép; tìm thêm yêu cầu cùng loại; thử giới thiệu đối tác nhỏ | Cố gắng có khách thứ hai; review ngày 60; chưa mở thêm nhiều dịch vụ |
| 9–10 | Chuẩn hóa | Tách config, mẫu scope, checklist, video; so hai dự án nếu đã có | Bảng phần dùng lại và phần custom; điều chỉnh giá/scope |
| 11–12 | Lặp lại cách bán hiệu quả | Tập trung nguồn tạo hội thoại; cố gắng chốt khách thứ ba; theo dõi khách đã bàn giao | Số liệu bán/giao/hỗ trợ; bằng chứng khách dùng được |
| 13 | Review ngày 90 | Tổng kết khách, tiền, giờ, vấn đề lặp lại và nhu cầu sau bàn giao | Quyết định tiếp tục dịch vụ, đổi offer hoặc thử sản phẩm tiêu chuẩn nhỏ |

### Phân bổ tuần khi chưa có pilot

| Nhóm việc | Giờ/tuần |
| --- | ---: |
| Tìm cơ hội và proposal | 10 |
| Demo/tài sản bán hàng | 8 |
| Trao đổi và scope | 5 |
| Website, tracker và tổng kết | 4 |
| Dự phòng | 3 |
| **Tổng** | **30** |

Sau khi bản đầu đã đủ dùng, giảm giờ website/demo để tăng tìm khách; không tiếp tục làm đẹp cho đủ giờ. Khi có pilot, có thể chuyển thành: delivery 14h, tìm khách 8h, trao đổi/UAT 4h, review và dự phòng 4h. Nếu không đủ tải, dời lịch bắt đầu, không nhận nhiều dự án đồng thời.

## 11. Ngân sách và kiểm tra kinh tế

### 11.1. Trần chi tiền mỗi tháng

| Khoản | Trần dự toán | Quy tắc |
| --- | ---: | --- |
| Hosting | 10 USD | Dùng lựa chọn miễn phí nếu đáp ứng; chưa thuê backend riêng |
| Email công việc | 10 USD | Kiểm tra phí thực tế và kỳ thanh toán trước khi mua |
| Tìm khách / Connects | 40 USD | Chi theo đợt, review giữa kỳ; không boost |
| Dự phòng | 40 USD | Giữ lại cho nhu cầu thật; gồm domain/công cụ/AI nếu cần mua thêm |
| **Tổng** | **100 USD** | **Trần, không phải số phải tiêu hết** |

Đây là phân bổ ngân sách, không phải báo giá nhà cung cấp. Nếu domain gia hạn, AI hay công cụ trả năm làm chi vượt trần tiền mặt tháng đó, điều chỉnh các khoản trước khi mua. Không mua đồng thời nhiều công cụ automation.

Phí nền tảng/nhận tiền khấu trừ từ doanh thu được theo dõi riêng khi tính thu ròng. Hạ tầng hoặc API chuyên biệt của khách chỉ mua khi đã chốt ai trả.

### 11.2. Một pilot 450 USD có thực sự đáng làm?

Ước lượng sau khi có demo/code nền:

| Thành phần | Giờ giả thuyết/khách |
| --- | ---: |
| Discovery, scope, đề xuất và theo dõi khách đó | 2–3 |
| Build, kiểm tra, tài liệu | 5–8 |
| Onboarding, nghiệm thu, hỗ trợ | 2–3 |
| **Tổng trực tiếp** | **9–14** |

Giờ website/demo và các cơ hội tìm khách không thành công tính ở chi phí chung, không được bỏ đi. Dự án đầu có thể lâu hơn; ghi số thực, không coi bảng trên là cam kết.

Ví dụ nội bộ dùng **25 USD/giờ công founder**, **15% phí nền tảng** và **10 USD chi phí trực tiếp/đơn**. Mức 15% là kịch bản thận trọng, không phải phí cố định: Upwork hiện công bố khoảng 0–15% tùy hợp đồng và hiển thị mức cụ thể trước khi nhận. [Upwork service fee](https://support.upwork.com/hc/en-us/articles/211062538-Learn-about-the-Freelancer-Service-Fee).

| | 9 giờ | 14 giờ | 20 giờ, khi vượt scope |
| --- | ---: | ---: | ---: |
| Doanh thu | 450 | 450 | 450 |
| Phí giả định 15% | -67,50 | -67,50 | -67,50 |
| Chi phí trực tiếp | -10 | -10 | -10 |
| Công founder × 25 USD | -225 | -350 | -500 |
| **Còn lại trước chi phí chung** | **147,50** | **22,50** | **-127,50** |

Đơn vị: USD. Đây chưa phải lợi nhuận toàn bộ hoạt động. Pilot 450 USD có thể giúp học thị trường nhưng biên rất mỏng nếu mất 14 giờ; không chứng minh được mô hình bền vững.

Sau mỗi đơn, nếu cùng scope vượt 14 giờ, tìm nguyên nhân rồi thu hẹp phạm vi, cải thiện cách làm hoặc thử tăng giá. Không thêm thuê bao để che lỗ triển khai.

### 11.3. Ba kịch bản tiền mặt cho chu kỳ đầu

Giả định mọi pilot giá 450 USD đều đã hoàn tất và thu đủ; phí 15%; chi phí công cụ/tìm khách dùng hết trần 300 USD/3 tháng. Khoản 10 USD/đơn trong bảng trên giả định nằm trong tổng 300 USD này, không trừ thêm lần nữa.

| Kịch bản | 0 khách | 1 khách | 3 khách |
| --- | ---: | ---: | ---: |
| Doanh thu thực thu | 0 | 450 | 1.350 |
| Phí giả định | 0 | -67,50 | -202,50 |
| Chi tiền công cụ/tìm khách | -300 | -300 | -300 |
| **Dòng tiền còn lại trước công founder và nghĩa vụ thuế** | **-300** | **82,50** | **847,50** |

Không gọi dòng tiền còn lại là lợi nhuận. Để tính kết quả kinh tế toàn kỳ, trừ thêm **toàn bộ giờ founder thực làm × giá giờ nội bộ**, gồm học, demo, website, bán hàng, delivery và hỗ trợ. Mỗi giờ chỉ tính một lần; nếu đã tính phần công ở từng đơn thì không trừ lại phần đó.

Mục tiêu chu kỳ này là kiểm chứng người mua và cách giao hàng, chưa phải thay thế thu nhập chính. Không gọi doanh thu dự án một lần là MRR; nếu sau này có retainer dịch vụ, báo cáo riêng với subscription phần mềm.

## 12. Tracker và các điểm quyết định

Chỉ cần một bảng tính nội bộ, chưa xây CRM. Có thể dùng ba tab:

| Tab | Cột chính |
| --- | --- |
| Market scan | Ngày, URL, bài toán, trạng thái, budget, điểm fit, ngoài scope, hướng PDF/CSV |
| Sales | Nguồn, người mua, vấn đề, tần suất, stage, phản hồi, next action, giá đề xuất, giờ bán hàng |
| Delivery & cash | Khách, scope, tiền funded, đã giải ngân, thực thu, phí, chi phí, giờ build/UAT/support, nghiệm thu, kết quả sử dụng |

Stages: phù hợp → đang trao đổi → đủ thông tin → đã gửi scope → có thanh toán/funding → đang làm → nghiệm thu → thu đủ → theo dõi sau bàn giao.

**Đo hàng tuần:** số cơ hội phù hợp, proposal, hội thoại có vấn đề thật, scope, khách trả tiền, tiền thực thu, giờ thực tế và lý do từ chối. Traffic chỉ là chỉ số hỗ trợ.

| Tín hiệu | Cách xử lý |
| --- | --- |
| Chưa tìm đủ cơ hội phù hợp | Xem lại nơi tìm và độ hẹp scope; ghi chưa đủ dữ liệu, chưa kết luận thị trường không cần |
| 5–10 proposal phù hợp hoặc 20 USD chi mà chưa có hội thoại | Audit job fit, hồ sơ, thông điệp và demo; không tự tăng chi |
| Khoảng 5 cuộc trao đổi nhưng không có 2–3 trường hợp cùng vấn đề | Thu hẹp người mua hoặc đổi công việc cần giải quyết |
| Có vấn đề thật nhưng không tiến đến đề nghị mua | Kiểm tra độ cấp bách, quyền quyết định, tín nhiệm, scope và thời điểm |
| Ba scope cụ thể đều chưa chốt | Hỏi lý do, sửa một biến rồi thử lại; không mặc định giảm giá |
| Pilot vượt giờ hoặc sửa nhiều | Sửa scoping/acceptance, ghi phát sinh; chưa bán thêm cùng điều kiện |
| Khách dùng được nhưng không cần hỗ trợ định kỳ | Giữ doanh thu triển khai; không ép retainer |
| Ngày 90 chưa có khách | Review bằng dữ liệu: thiếu tiếp cận, chưa fit hay không ai chịu mua; chỉ thử chu kỳ mới khi có giả thuyết rõ và còn ngân sách |

Các ngưỡng này phục vụ quyết định nội bộ với mẫu nhỏ, không phải benchmark hay kết luận thống kê.

## 13. Khi nào đóng gói thành sản phẩm?

Sản phẩm hóa có thể bắt đầu bằng **gói lắp đặt tiêu chuẩn**, chưa cần SaaS.

Sau 1–3 pilot, kiểm tra:

- Khách có thực sự dùng workflow sau bàn giao không?
- Đầu vào, đầu ra và cách mua có giống nhau đủ để mô tả thành một gói không?
- Phần nào dùng lại được, phần nào vẫn cần người triển khai?
- Giờ setup, lỗi và hỗ trợ giảm hay tăng?
- Có người mua tiếp theo muốn đúng gói này, thay vì một dự án khác hoàn toàn không?

Nếu đủ tín hiệu, chuẩn hóa code, mẫu, hướng dẫn và giá gói; bán tiếp để kiểm tra. Chỉ thử sản phẩm tự phục vụ khi có bằng chứng thêm về khả năng tự cài, mức hỗ trợ thấp và khách chấp nhận mua phiên bản tiêu chuẩn.

Chỉ xem xét SaaS khi có nhu cầu lặp lại đủ rõ, khách muốn tiếp tục trả tiền, có cách phân phối và kinh tế vận hành khả thi. Ba dự án custom hoặc hết 90 ngày không tự động là lý do xây SaaS. Nếu dịch vụ có lãi và khó chuẩn hóa, tiếp tục làm dịch vụ vẫn là lựa chọn hợp lệ.

## 14. Checklist bắt đầu thực hiện

- [ ] Tạo tracker ba tab và bắt đầu ghi giờ thực tế.
- [ ] Kiểm tra domain, khả năng nhận liên hệ và kênh nhận tiền thực tế.
- [ ] Screening PDF/CSV trong tối đa hai ngày; lưu nguồn và lý do chọn.
- [ ] Chọn một offer; viết scope và checklist nghiệm thu trước khi build.
- [ ] Dựng một demo bằng dữ liệu giả, quay video ngắn; không quá 8 giờ bản đầu.
- [ ] Đưa landing page tiếng Anh lên website; không quá 8 giờ bản đầu.
- [ ] Chuẩn bị hồ sơ và proposal cho kênh chính; đặt trần chi tìm khách 40 USD/tháng.
- [ ] Mở hội thoại với người có nhu cầu; sửa offer bằng phản hồi, không bằng suy đoán.
- [ ] Chốt một pilot trả phí, giao theo scope và ghi toàn bộ công/chi phí.
- [ ] Review ngày 30, 60, 90 và chọn bước tiếp theo dựa trên bằng chứng.

**Đích đến của bản kế hoạch:** chứng minh SheetAutomate có thể bán và bàn giao một giải pháp nhỏ cho khách thật. Chưa cần xây một nền tảng lớn để đạt mục tiêu đó.

---

**Ghi chú quá trình:** đã dùng ba agent tích hợp để brainstorm và phản biện chéo. Skill [Herdr](/home/hungvu/.agents/skills/herdr/SKILL.md) đã được đọc theo yêu cầu, nhưng thao tác đọc phiên Herdr bị môi trường chặn và yêu cầu quyền mở rộng bị chính sách từ chối; không tạo được agent qua Herdr. Các nguồn bên ngoài được kiểm tra ngày 23/10/2026; giá, điều kiện nền tảng và trạng thái job cần kiểm tra lại khi thực hiện.
