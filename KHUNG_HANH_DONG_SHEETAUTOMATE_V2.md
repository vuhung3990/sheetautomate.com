# SheetAutomate — Khung hành động sau phản biện, phiên bản 2

**Ngày:** 23/10/2026. **Nguồn lực:** 30 giờ/tuần, tối đa 100 USD/tháng; mục tiêu ban đầu 1–3 khách trả tiền. **Điều kiện bổ sung đang áp dụng:** chưa có review và không chi tiền mua Upwork Connects.

Tài liệu này thay các quyết định về offer, tìm khách, onboarding, stop-loss và UAT trong bản kế hoạch đầu. Không áp dụng đồng thời mức 40 USD/tháng mua Connects của bản cũ. Các giá và ngưỡng dưới đây là quy tắc thử nghiệm, không phải benchmark hoặc lời bảo đảm bán được.

## 1. Đổi offer: bán một quy trình hoàn tất, không bán nút xuất PDF

### 1.1. Khách và vấn đề để kiểm chứng trước

Tìm người phụ trách vận hành tại doanh nghiệp dịch vụ nhỏ đã dùng Google Forms/Sheets, có mẫu tài liệu và đang nhập lại dữ liệu hoặc sửa một luồng document merge không ổn định. Ưu tiên doanh nghiệp mà chủ hoặc người phụ trách có thể xác nhận quyền mua và phối hợp với quản trị viên Workspace.

Đây là nhóm khởi điểm cần thử, chưa phải ngách đã xác nhận. Tìm yêu cầu mua thật trước khi chọn thêm ngành dọc.

**Offer tiếng Anh:**

> I set up or repair one Google Workspace document workflow: from a form submission or approved Sheet record to a checked PDF, with its file link and status recorded. Your team gets a tested workflow in your account and a clear handover.

Khách mua việc hoàn thành quy trình: input → kiểm tra → tạo tài liệu → lưu/link/trạng thái → người chịu trách nhiệm kiểm tra. Không hứa tiết kiệm bao nhiêu giờ trước khi đo.

**Bốn điều kiện nhận khảo sát sâu:** có quy trình đang chạy thật; có tần suất/chi phí hoặc lỗi cụ thể; có người duyệt khoản triển khai; có người cung cấp mẫu và phối hợp quyền truy cập. Nếu chỉ cần xuất PDF vài lần, hướng dẫn tính năng có sẵn thay vì ép thành dự án.

### 1.2. Dùng đối thủ như công cụ triển khai

Autocrat và Document Studio đã hỗ trợ document merge, Forms và các bước tự động hóa. Phương án mặc định là kiểm tra công cụ có sẵn, sau đó mới quyết định viết code. Không tạo sự khác biệt bằng lời hứa có tính năng mà đối thủ đã có. [Autocrat](https://cloudlab.newvisions.org/autocrat), [Document Studio](https://digitalinspiration.com/product/document-studio).

Lý do trả tiền cần kiểm chứng: khách muốn được cấu hình đúng, xử lý dữ liệu lỗi, kiểm tra trong môi trường của họ và bàn giao sử dụng được. Mọi license trả phí thuộc chi phí khách đã chấp thuận, không giấu trong giá triển khai. Nếu thay thế bằng công cụ sẵn hoàn toàn, vẫn mô tả trung thực là dịch vụ cài đặt công cụ đó.

### 1.3. Hai mức triển khai, không hai sản phẩm cần xây

| | Setup/Repair — giá thử 450 USD | Custom bounded — từ 750 USD, chỉ báo sau preflight |
| --- | --- | --- |
| Cách làm | Cấu hình/sửa công cụ sẵn, ít code bổ trợ | Code cho một khoảng trống đã xác định |
| Đầu vào | Một Form hoặc một bảng dữ liệu đã duyệt | Một nguồn đã chốt schema |
| Đầu ra | Một mẫu, PDF lưu Drive, link/trạng thái | Một mẫu và cùng cơ chế ghi nhận |
| Trigger | Một trigger Form gốc hoặc một thao tác duyệt/chạy trong Sheet | Chọn một phần mở rộng: trigger Form hoặc bảng dòng hàng đơn giản |
| Phạm vi kiểm soát | Kiểm tra trường bắt buộc, chống chạy lại ngoài ý muốn, hiển thị lỗi, hướng dẫn | Các kiểm soát tương tự, có xử lý phục hồi phù hợp |
| Giờ trực tiếp dự toán | Tối đa 7 giờ, gồm khảo sát kỹ thuật, build, UAT, tài liệu và hỗ trợ dự kiến | Tối đa 12 giờ theo các đầu việc tương tự |
| Điểm cảnh báo nội bộ | Dùng 5,5 giờ mà chưa gần đạt nghiệm thu | Dùng 9,5 giờ mà chưa gần đạt nghiệm thu |

Các mức giờ là giới hạn để quyết định nhận và định giá dự án mới, không phải quyền ngừng sửa lỗi thuộc trách nhiệm sau khi đã nhận tiền. Nếu ước lượng không đủ, từ chối, chia nhỏ hoặc báo giá khác trước khi cam kết. Chưa dựng thư viện custom chỉ để lấp đủ bảng giá.

### 1.4. Phần nên thêm và giới hạn an toàn

**Ưu tiên thêm một trigger Google Form gốc** khi đó là điểm bắt đầu thật của quy trình. Tạo PDF sau dữ liệu hợp lệ, ghi trạng thái và lưu link; người dùng vẫn kiểm tra trước khi gửi ra ngoài. Một thông báo cho người phụ trách có thể nằm trong scope nếu được chốt. Không mặc định bật email gửi khách hay thêm Gmail scopes khi không cần.

**Dynamic row items là phương án thay thế**, không tự cộng vào cùng pilot mới có Form trigger: một bảng với 1–10 dòng, cột cố định, một tiền tệ, giá trị thương mại đã được khách xác nhận/tính trong Sheet, mẫu tối đa hai trang. Chốt giới hạn độ dài, phép làm tròn nếu có và trường hợp từ chối. Không bảng lồng, nhóm động, phân trang tùy ý, định giá hay thuế. Nếu công cụ sẵn đáp ứng thì dùng công cụ sẵn.

**Webhook chưa thuộc ba pilot đầu theo mặc định.** Chỉ báo giá riêng khi có nhu cầu mua rõ, một nguồn và schema cố định, cơ chế xác thực/kiểm tra nguồn, chống trùng, retry và lỗi đã được thống nhất. Ưu tiên hạ tầng nhận webhook được khách phê duyệt sẵn; không biến một Apps Script web app công khai thành lối tắt thiếu kiểm soát.

Nguyên tắc: chỉ thêm khả năng giúp hoàn thành công việc khách cần; không thêm tính năng để biện hộ cho giá. Nếu scope an toàn loại bỏ phần giá trị chính, không nhận job đó theo gói này.

## 2. Tìm khách khi chưa có review và không mua Connects

### 2.1. Thứ tự tiếp cận

1. **Kênh chính:** phản hồi yêu cầu thuê có vấn đề rõ, ngân sách hoặc dấu hiệu người mua sẵn sàng chi, được đăng ngoài Upwork qua kênh cho phép ứng tuyển. Có thể là bài tuyển triển khai, mục jobs/hiring hoặc form nhận nhà thầu của doanh nghiệp.
2. **Kênh thứ hai:** đề nghị làm một đầu việc trả phí cho đơn vị triển khai Workspace/no-code/operations có nhu cầu thuê ngoài và có kênh nhận hợp tác. Đây là kiểm chứng đối tác, chưa giả định họ sẽ giao khách.
3. **Cộng đồng:** tìm vấn đề và trả lời hữu ích; chỉ đăng offer/nhắn thương mại khi quy định và ngữ cảnh cho phép. Chưa thấy nơi phù hợp thì không tính thành nguồn lead.
4. **Upwork:** hoàn thiện hồ sơ tối đa hai giờ, rồi giữ ở trạng thái cơ hội bổ sung. Không dự báo nguồn khách từ proposal khi chưa có Connects. Nếu có lời mời hoặc Connects thực tế đủ dùng, mới thử và ghi số liệu.

Nguồn từ Upwork vẫn theo quy định của Upwork. Không tìm email người đăng job để né chi phí hoặc chuyển trao đổi ra ngoài trước hợp đồng. [Upwork pre-contract communication](https://support.upwork.com/hc/en-us/articles/17995658941843--Get-to-know-each-other-before-a-contract).

Connects thưởng là phần bổ sung không chắc chắn, không là giả định của kế hoạch. [Upwork Connects](https://support.upwork.com/hc/en-us/articles/211062898-Understanding-and-using-Connects).

### 2.2. Budget có sẵn hay pitch offer?

Ưu tiên người đã mô tả vấn đề và có ý định thuê. Với họ, pitch một kết quả phù hợp với yêu cầu, không gửi danh sách tính năng chung. Không coi budget hiển thị là mức chắc chắn được chi; xác nhận phạm vi và người quyết định.

Direct offer chủ yếu dùng cho đối tác triển khai có lý do hợp tác cụ thể hoặc người đã có ngữ cảnh nhu cầu. Chưa gửi hàng loạt cho các doanh nghiệp được chọn chỉ vì đang dùng Sheets.

Lượt đầu: tối đa 20 đối tượng được nghiên cứu, khoảng 15 yêu cầu/người mua phù hợp và 5 đối tác có kênh hợp tác. Không tìm đủ thì ghi số thực, không bù bằng người không phù hợp. Mỗi đối tượng một thông điệp liên quan và tối đa một follow-up sau 5 ngày làm việc nếu kênh cho phép; dừng khi bị từ chối.

### 2.3. Bằng chứng thay thế review

- Một demo bằng dữ liệu giả cho đúng quy trình, dài 60–90 giây.
- Một ảnh/video lỗi được phát hiện và cách chạy lại; không chỉ happy path.
- Một mẫu checklist nghiệm thu và ví dụ tài liệu bàn giao.
- Mốc khảo sát kỹ thuật nhỏ có trả phí, với đầu ra cụ thể ngay cả khi kết luận không khả thi.
- Mô tả trung thực kinh nghiệm; không đổi demo thành case study giả.

Website chỉ cần một trang liên hệ và các bằng chứng trên; trần ban đầu 2–3 giờ. Demo bản đầu tối đa 4 giờ, chưa làm tùy biến miễn phí cho từng lead.

**Mẫu phản hồi yêu cầu mua:**

> Hi [Name], I saw your request to [specific task]. I can assess a focused workflow using your existing [Form/Sheet/template], including validation, PDF creation and a clear error/status trail. I first check account permissions and a redacted sample, then confirm the implementation scope. I have a short fictional-data demo if useful. Who will use the workflow, and is there an approved budget for the first version?

**Mẫu đề nghị hợp tác:**

> Hi [Name], I build and repair small Google Workspace document workflows. I’m looking to take on one clearly scoped implementation task for a partner, with testing and handover included. Do you currently subcontract this kind of work? I can share a short sample and a proposed acceptance checklist.

Chỉ sử dụng qua kênh phù hợp; tài liệu này không tự cho phép thực hiện outreach bằng công cụ.

## 3. Onboarding kỹ thuật: kiểm tra khả thi trước cam kết build

### 3.1. Các bước bắt buộc

| Bước | Cách làm | Điều kiện chuyển tiếp |
| --- | --- | --- |
| 0. Lọc miễn phí | Tối đa 15 phút; mô tả việc, dữ liệu mẫu đã ẩn thông tin, tài khoản và người mua | Có nhu cầu, scope dự kiến và quyền mua; không viết giải pháp riêng miễn phí |
| 1. Mốc khảo sát trả phí | Lập danh sách owner, người chạy, người nhận file, tài khoản Gmail/Workspace, admin, vị trí Drive | Có môi trường đại diện và người phối hợp |
| 2. Xác định công cụ/quyền | Chọn addon hay code, chức năng và scopes; kiểm tra chính sách quản trị | Khách hiểu quyền cần cấp; admin phê duyệt khi cần |
| 3. Chạy thử quyền | Trong môi trường khách, dùng dữ liệu giả; tạo/lưu một file, ghi link; kiểm tra người chạy thực tế | Có bằng chứng chạy được; không chỉ chạy bằng tài khoản founder |
| 4. Thử dữ liệu/giới hạn | Mẫu dài nhất, locale, ID, dòng thiếu; chạy lại và lỗi giữa chừng; tải đại diện | Có giới hạn công suất/layout và cách xử lý lỗi |
| 5. Go / No-go | Báo cáo ngắn về kết quả, rào cản, scope, chi phí và đầu ra nghiệm thu | Chỉ chốt giá build khi đường triển khai đã khả thi |
| 6. Build/UAT | Bản sao và quyền tối thiểu đáp ứng; kiểm tra trong môi trường đã thống nhất | Không đổi kiến trúc ngầm giữa dự án |
| 7. Bàn giao độc lập | Khách chạy sau khi thu hồi quyền founder; kiểm tra trigger và lỗi | Khách có thể vận hành và khôi phục theo tài liệu |

### 3.2. Xử lý OAuth và Admin

Không hứa rằng mọi Apps Script đều hiện cảnh báo, cũng không hứa chuyển sang tài khoản khách sẽ luôn hết cảnh báo. Google phân biệt theo scopes và quan hệ tài khoản; có ngoại lệ nội bộ cùng Workspace, trong khi một số luồng bên ngoài có cảnh báo ứng dụng chưa xác minh. [Google OAuth client verification](https://developers.google.com/apps-script/guides/client-verification).

Nếu bị chặn: ghi lỗi và nguyên nhân, làm việc với admin theo chính sách khách. Có thể chọn công cụ đã được chấp thuận hoặc kiến trúc khác sau khi đánh giá lại. Không hướng dẫn tắt bảo vệ của tổ chức để giữ lời hứa triển khai. Không có đường được phép thì kết luận No-go, giao báo cáo khảo sát và không thu phần build chưa làm.

Nếu cần verification riêng, đó là phần ước lượng mới; không coi mặc định nằm trong pilot. Không dùng sao chép project để né giới hạn hoặc chính sách.

Trigger cài dưới tài khoản phù hợp thuộc khách; chủ tài khoản phối hợp tạo và kiểm tra. Installable trigger chạy theo người tạo, nên kiểm tra owner file riêng chưa đủ. [Google installable triggers](https://developers.google.com/apps-script/guides/triggers/installable).

### 3.3. Khả năng phục hồi tối thiểu

Mỗi bản ghi có ID ổn định; phân biệt chưa xử lý/đang xử lý/đã xong/lỗi. Chỉ ghi thành công sau các bước cần thiết; có cách nhận biết file đã tạo nếu ghi link thất bại. Có khóa chạy khi dùng tài nguyên chung và quy tắc retry không tạo trùng. Không hứa giao dịch nguyên tử giữa Sheet và Drive.

Chốt loại tài khoản, số tài liệu/lượt, tần suất và kích thước dữ liệu trước báo giá. Các quota và thời gian thực thi của Google phải được kiểm tra cho phương án thực tế; không quảng cáo unlimited. [Google quotas](https://developers.google.com/apps-script/guides/services/quotas).

## 4. Stop-loss và kinh tế học founder

### 4.1. Giải ngân thời gian theo đợt

Các giờ sau là tổng công thật, gồm nghiên cứu, tìm khách, website, demo, trao đổi và báo giá. Chưa có khách không phải lý do dùng đủ 30 giờ/tuần vào xây dựng.

| Đợt | Trần giờ bổ sung | Lũy kế | Bằng chứng cần có | Khi không đạt |
| --- | ---: | ---: | --- | --- |
| A — chọn việc | 12 | 12 | Khoảng 10 yêu cầu mua được đọc, ít nhất 3 ứng viên có scope phù hợp; một giả thuyết người mua | Chưa build; đổi nơi tìm hoặc bài toán trong giới hạn này |
| B — tiếp cận | 20 | 32 | Tối đa 20 đối tượng hợp lệ; mục tiêu 3 phản hồi có ý nghĩa, trong đó 2 trường hợp có vấn đề phù hợp | Review sau thời gian phản hồi hợp lý; sửa danh sách/kênh nếu ít phản hồi, không kết luận ngay offer sai |
| C — thử chốt | 20 | 52 | Tối đa 3 đề xuất có nhu cầu/phạm vi rõ; mục tiêu một mốc khảo sát có trả phí | Ghi lý do, chỉ sửa một biến; không mở thêm tính năng để trì hoãn đánh giá |
| D — đánh giá quyết định | 8 | 60 | Ít nhất một M1 đã thu tiền/funded, hoặc quyết định dừng được ghi lại | Không có giao dịch thì dừng offer hiện tại; lời hứa mua chưa phải thanh toán |

Trần tiền mặt tự bỏ cho vòng kiểm chứng đầu: 100 USD, tối đa khoảng 30 ngày lịch trước review. Không mua Connects; ưu tiên 0–10 USD hosting, 0–10 USD email và giữ phần còn lại dự phòng. Đây là trần nội bộ, không phải báo giá nhà cung cấp.

**Chốt dừng cứng:** chạm 60 giờ hoặc ngày 30 mà chưa có M1 được trả tiền/funded thì tạm dừng bán và xây cho offer hiện tại. Các lần đổi thông điệp/kênh trong vòng đầu vẫn tính chung 60 giờ, không đặt lại đồng hồ. Một chu kỳ mới chỉ bắt đầu sau khi ghi rõ bằng chứng mới, giả thuyết khác và trần đầu tư mới; không kéo dài vì nhận xét tích cực hoặc lời hứa sắp mua.

Đạt mốc khảo sát 75 USD chưa đồng nghĩa đạt một pilot triển khai thành công. Theo dõi riêng: người trả tiền khảo sát, người mua build, người nghiệm thu, người sử dụng sau bàn giao.

Nếu đã có hợp đồng và nhận tiền, phải hoàn thành nghĩa vụ hoặc thống nhất thay đổi/dừng và thanh toán/hoàn tiền phù hợp. Stop-loss không phải quyền bỏ khách giữa dự án.

### 4.2. Gate theo kênh và theo phản đối

- Sau 10 tiếp cận hợp lệ: kiểm tra địa chỉ/kênh, quy định, đúng người và thông điệp; không đổi offer chỉ vì chưa có phản hồi.
- Sau tối đa 20 tiếp cận, đã chờ ít nhất 5 ngày làm việc và follow-up hợp lệ mà chỉ 0–1 phản hồi có ý nghĩa: tạm dừng kênh/thông điệp để sửa. Không xem đây là bằng chứng thống kê rằng thị trường không tồn tại.
- Có ít nhất 5 cuộc trao đổi đúng đối tượng nhưng dưới 2 người có cùng vấn đề đáng xử lý: đổi bài toán/nhóm khách.
- Ba đề xuất phù hợp đều không mua: phân loại lý do thành ngân sách, độ cấp bách, niềm tin hoặc scope; thử một thay đổi rõ trong phần giờ còn lại, không giảm giá tự động.
- Có sẵn Connects và chọn thử Upwork: 5 proposal chưa view sau khoảng 5 ngày làm việc → audit; 10 proposal phù hợp vẫn 0 view → tạm dừng thử nghiệm đó, không chi thêm. Đây là chốt bảo vệ nguồn lực, không phải benchmark thuật toán. Không có Connects/không gửi proposal thì gate này không áp dụng.
- Không theo dõi email-open để suy ra nhu cầu; với direct channel đo phản hồi có ý nghĩa, scope và giao dịch.

### 4.3. Định giá có tính công tìm khách

Giữ giá giờ nội bộ ban đầu 25 USD để so sánh. Công thức giá sàn nội bộ:

`Giá sàn = [25 × (giờ trực tiếp + giờ thu hút khách phân bổ) + chi phí trực tiếp + chi phí cố định phân bổ] / (1 − tỷ lệ phí)`

Giờ trực tiếp gồm khảo sát kỹ thuật, build, UAT, tài liệu và hỗ trợ dự kiến. Giờ thu hút khách gồm cả các cơ hội không mua. Mỗi giờ và khoản tiền chỉ phân bổ một lần.

Ví dụ giả định phí 15%, không phải mức phí áp dụng mọi hợp đồng:

| | Setup 450 USD | Custom 750 USD |
| --- | ---: | ---: |
| Giờ trực tiếp dự toán | 7 | 12 |
| Giờ thu hút khách phân bổ để kiểm tra tính lặp lại | 4 | 6 |
| Phí giả định | 67,50 | 112,50 |
| Chi phí trực tiếp + cố định phân bổ giả định | 40 | 45 |
| Công founder × 25 USD | 275 | 450 |
| Còn lại sau các khoản trên | 67,50 | 142,50 |

Đây là điều kiện kinh tế để thử, chưa là kết quả dự báo. Lấy phí thực tế thay vào. Vòng học đầu có thể tiêu nhiều giờ tìm khách hơn và lỗ kinh tế; phải ghi khoản lỗ đó trong giới hạn 60 giờ, không thay bằng mức phân bổ 4–6 giờ để làm đẹp số.

Sau mỗi pilot ghi công thật. Hai pilot liên tiếp có kinh tế lặp lại dưới mức công nội bộ sau phân bổ tìm khách/chi phí → dừng bán cùng giá và scope, thiết kế lại trước khi nhận đơn mới. Không gọi retainer là cách bù lỗ triển khai.

## 5. Milestone, UAT và bàn giao

Đây là mẫu thương mại để thỏa thuận bằng văn bản, không tự thay thế điều khoản nền tảng hoặc tạo bảo đảm thu tiền. Không lấy tiền build khi chưa chứng minh đường triển khai khả thi.

### 5.1. Ba mốc với đầu ra có thể kiểm tra

| Mốc | Gói 450 | Gói 750 | Đầu ra |
| --- | ---: | ---: | --- |
| M1 — feasibility & scope | 75 | 75 | Kết quả kiểm tra quyền/mẫu, Go/No-go, scope và checklist. Báo cáo là đầu ra hợp lệ kể cả No-go nếu đã thỏa thuận trước |
| M2 — build & test | 300 | 525 | Luồng chạy trong môi trường khách, kết quả test, bản hướng dẫn nháp để UAT |
| M3 — acceptance & handover | 75 | 150 | Nghiệm thu, tài liệu/video cuối, chạy độc lập và kiểm tra sau thu hồi quyền founder |
| **Tổng** | **450** | **750** | **75 USD M1 đã nằm trong tổng; không cộng thêm lần nữa** |

Khách trực tiếp: đề xuất thu M1 trước khảo sát, M2 trước build sau khi xác nhận Go, M3 khi đạt nghiệm thu/bàn giao theo mốc đã chốt. Nếu M1 là No-go, khách chỉ mua phần khảo sát đã giao; không coi tiền M1 mặc định là khoản cọc cho phần mềm chắc chắn chạy được. Cách xử lý đầu ra không đạt hoặc phần chưa làm phải được ghi trước.

Upwork: từng milestone cần funded trước khi làm; không đồng nhất tiền escrow với tiền thực thu. Hoàn thành thì Submit Work đúng quy trình. Khách có 14 ngày xem xét; yêu cầu sửa rồi nộp lại có thể mở kỳ xem xét mới. Quy trình nội bộ ba ngày phản hồi không thay thế quy trình nền tảng. [Upwork milestones](https://support.upwork.com/hc/en-us/articles/44564821903763-Understanding-milestones-on-fixed-price-contracts), [Upwork review](https://support.upwork.com/hc/en-us/articles/17974824831507--Review-and-pay-for-fixed-price-contracts-and-milestones).

Tài nguyên thuộc khách nên phần lớn giá trị có thể đã được giao trong UAT. Bảo vệ founder bằng thu tiền theo mốc và giữ khoản cuối nhỏ, không bằng cơ chế vô hiệu hóa từ xa, xóa dữ liệu hoặc ngăn khách dùng file của họ.

### 5.2. Freeze scope trước build

Ghi rõ một đầu mối được quyền duyệt; template và phiên bản mẫu; schema và trường bắt buộc; tài khoản/người chạy; locale; giới hạn dòng/độ dài/tải; cách retry; bộ dữ liệu nghiệm thu và các điều không bao gồm. Khách xác nhận trước M2.

Một vòng chỉnh giao diện gồm một danh sách tổng hợp, tối đa năm thay đổi nhỏ trong mẫu đã duyệt và khoảng một giờ dự kiến. Thêm nguồn, quy tắc, template hoặc bước nghiệp vụ là change request có tác động giá/lịch được chấp thuận trước. Lỗi không đáp ứng đặc tả không bị tính là vòng chỉnh hoặc dùng giới hạn năm mục để né sửa lỗi.

### 5.3. UAT theo bộ tình huống

- Bộ chuẩn khớp dữ liệu và tài liệu được duyệt.
- Trường thiếu/sai định dạng bị xử lý đúng.
- Văn bản dài nhất, locale, số 0 đầu và tối đa dòng hàng không phá mẫu.
- Chạy lại, hai người/lượt gần nhau và lỗi giữa chừng không gây nhầm dữ liệu/file.
- Người dùng thật chạy trong môi trường thật; quyền file đúng.
- Khách chạy sau khi founder mất quyền; có cách xem lỗi và phục hồi.
- Quy trình tuần có ít nhất hai lượt chạy thử đại diện; quy trình tháng giả lập bộ kỳ tiếp theo và thống nhất lần chạy thật đầu trong thời gian theo dõi.

Đề nghị khách tổng hợp phản hồi trong ba ngày làm việc. Nếu chưa phản hồi hoặc thiếu đầu vào quá ba ngày, tạm dừng lịch và sắp xếp lại; không tự coi im lặng là nghiệm thu. Chỉ áp dụng cơ chế chấp thuận tự động khi điều khoản áp dụng đã quy định, như quy trình nền tảng.

### 5.4. Thay cam kết bảy ngày bằng định nghĩa bảo hành rõ

- Thời gian báo lỗi: đề xuất 30 ngày lịch từ nghiệm thu bằng văn bản. Chốt lần chạy thật đầu trong khoảng này; chu kỳ dài hơn cần thỏa thuận riêng.
- Sửa không thu thêm đối với sai lệch tái hiện được so với đặc tả trong môi trường đã duyệt. Không tính bug vào giới hạn chỉnh layout.
- Sai đầu ra/quyền truy cập: hướng dẫn dừng luồng, phản hồi trong một ngày làm việc. Lỗi khác: phản hồi trong hai ngày làm việc. Đây là thời gian phản hồi, không hứa mọi lỗi được giải quyết trong thời gian đó.
- Sau chẩn đoán, xác nhận kế hoạch sửa, phần việc khách cần hỗ trợ và thời hạn phù hợp. Phụ thuộc admin/Google hoặc thay đổi do khách cần được phân loại bằng bằng chứng, không quy lỗi mặc định.
- Thêm tính năng hoặc đổi dữ liệu/schema ngoài baseline: báo giá thay đổi. Sửa lỗi do triển khai của mình vẫn là trách nhiệm đã cam kết.
- Không hứa giám sát 24/7. Không bắt buộc mua retainer để nhận phần sửa lỗi đã bao gồm.

## 6. Ma trận rủi ro và phản ứng

Mức nghiêm trọng mô tả tác động nếu xảy ra, không phải xác suất đã đo. Founder chịu trách nhiệm ghi nhận và hành động; khách/admin chịu phần đầu vào và quyền đã thống nhất.

| Rủi ro / dấu hiệu | Mức tác động | Phòng ngừa | Khi xảy ra / quyết định |
| --- | --- | --- | --- |
| Không ai cần mua scope đã đóng gói | Nghiêm trọng | Tìm yêu cầu mua và khảo sát công việc thật | Sau gate 5 hội thoại/3 đề xuất, đổi một biến hoặc dừng offer |
| Add-on đáp ứng đủ, custom không có giá trị | Cao | So sánh công cụ trước báo giá | Bán setup trung thực hoặc hướng dẫn tự làm; không viết lại |
| Không có Connects / proposal không được xem | Cao | Kênh ngoài Upwork có nhu cầu và đối tác | Không chi ngầm; tạm dừng thử nghiệm theo gate, không kết luận toàn thị trường |
| Cộng đồng không cho chào dịch vụ | Cao | Đọc quy định trước hoạt động | Bỏ nơi đó khỏi nguồn lead; chuyển kênh được phép |
| OAuth/admin chặn môi trường | Nghiêm trọng | M1 chạy thử quyền bằng tài khoản đại diện | Tạm dừng, admin xem xét hoặc No-go; không bắt đầu build |
| Sai dữ liệu hoặc mở quyền file không đúng | Nghiêm trọng | Dữ liệu chuẩn, validation, quyền tối thiểu, UAT | Dừng luồng, khoanh vùng, thông báo và sửa; xác nhận lại trước chạy |
| Quota/timeout hoặc lỗi sau khi đã tạo file | Cao | Benchmark, ID, log, trạng thái và retry an toàn | Đối chiếu rồi khôi phục; hạ tải/chia lượt trong scope đã thống nhất |
| PDF tràn trang / sai locale | Cao | Mẫu dài nhất, giới hạn trường/dòng | Sửa bug trong baseline; thay mẫu/giới hạn mới cần change request |
| Vượt giờ, biên lợi nhuận âm | Cao | Cảnh báo 5,5/9,5h, ghi mọi công và chi phí | Xử lý nghĩa vụ hiện tại; dừng bán cùng giá nếu lặp lại |
| Khách không phản hồi / thay scope | Cao | Người duyệt, thời hạn, baseline và danh sách chỉnh rõ | Pause lịch; ghi change request; không làm thêm ngầm |
| Không nghiệm thu / chậm tiền / tranh chấp | Nghiêm trọng | Mốc nhỏ, funded/thu trước, bằng chứng test | Dừng mốc chưa tài trợ; dùng quy trình thỏa thuận/nền tảng, không phá tài nguyên |
| Khách không tự vận hành sau bàn giao | Cao | Kiểm tra sau thu hồi quyền founder | Chưa đánh dấu bàn giao xong; sửa ownership/trigger/tài liệu |

## 7. Giữ, bỏ và thay trước ngày thứ nhất

**Giữ:** dịch vụ trước, mục tiêu 1–3 khách, một quy trình tại một thời điểm, demo trung thực, tài nguyên khách sở hữu, ghi giờ và tiền thật.

**Bỏ:** Upwork như kênh chủ động chính khi không có Connects; ưu tiên PDF chỉ vì dễ demo; giá 450 cho mọi yêu cầu; chốt build trước preflight; cam kết bảy ngày mơ hồ; giả định phải dành đủ 390 giờ; kỳ vọng ba khách tự động dẫn đến SaaS.

**Thay:** bán kết quả quy trình thay cho nút tạo PDF; công cụ sẵn trước code; M1 trả phí kiểm tra quyền; hai mức triển khai có trần công; tìm nhu cầu mua trước pitch chung; giải ngân từng đợt tối đa 60 giờ chưa được tài trợ; milestone và UAT có bằng chứng.

### Việc làm ngay trước khi đầu tư xây dựng

1. Chọn một giả thuyết người mua và viết offer trong ba câu.
2. Tạo tracker cho cơ hội, trạng thái phản hồi, tiền từng mốc, mọi giờ công và lý do từ chối.
3. Ghi trần vòng đầu 60 giờ/100 USD và ngày review, trước khi bắt đầu tính giờ.
4. Chuẩn bị checklist M1 và scope/UAT một trang; chưa cần tài liệu nhiều trang cho khách.
5. Tìm yêu cầu thuê đầu tiên và kênh hợp tác hợp lệ; không bắt đầu bằng tám giờ làm website.
6. Chỉ làm demo sau khi đã thấy vài nhu cầu phù hợp; một demo, tối đa bốn giờ bản đầu.
7. Chỉ chuyển sang build khách sau khi có mốc đầu được tài trợ và kết quả Go.

**Tiêu chí kiểm chứng:** người mua chấp nhận trả tiền cho kết quả xác định, môi trường chạy được, khách nghiệm thu và dùng được, còn kinh tế lặp lại đủ trả công tìm khách lẫn giao hàng. Thêm tính năng hoặc hoàn thành website không thay thế các bằng chứng này.
