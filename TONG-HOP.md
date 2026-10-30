# Website mới mpjsc.com — Bản tổng hợp trước khi code

Ngày: 29/10/2026. Nguồn: 2 file PDF hồ sơ năng lực (`company profile mp+tnt_ban full_web.pdf`, `Company_Profile_Combined.pdf`), web cũ http://mpjsc.com, ảnh đã tách sẵn trong `assets/img/`.

Phạm vi: chỉ Minh Phương (bỏ phần Thái Nhật Tân). Song ngữ, mặc định tiếng Anh. Không báo giá, không tuyển dụng, không tin tức.

---

## 1. Thông tin công ty dùng trên web

| Mục | Nội dung |
|---|---|
| Tên | Công ty Cổ phần In Minh Phương / Minh Phuong Printing Joint Stock Company (MPJSC) |
| MST | 0304706284 |
| Thành lập | 2006 |
| Mốc | 2012 đạt chứng nhận GMI → đủ điều kiện xuất khẩu Mỹ |
| Địa chỉ | Lô II-5, Đường CN11, KCN Tân Bình, P. Tây Thạnh, TP.HCM |
| Điện thoại | (028) 5435 6680 / 81 / 82 — Fax (028) 5435 6683 *(web cũ ghi (028) 2999 88816 — cần chốt)* |
| Email | contact@mpjsc.com |
| Facebook | facebook.com/mpjsc |

### Năng lực sản xuất (lấy từ hồ sơ)
- 3 máy in offset Heidelberg: **Speedmaster CX 102-6+L** (UV, 6 màu + tráng phủ), **CD 102-6+L**, **CD 102-5**
- Khổ in: tối thiểu 340 × 480 mm, tối đa 720 × 1020 mm
- Vật liệu: giấy, giấy metalize, giấy nhôm/hologram — 50–500 gsm
- Công suất: > 1.000.000 tờ/ngày
- Chế bản: Heidelberg Prinect Workflow, Prinect Signa Station (bình trang), CTP Heidelberg Suprasetter, máy in proof Epson SureColor P9080
- Quản lý màu: X-Rite, CIP4, thiết bị pha mực theo L·a·b·ΔE, lưu thông số màu cho lần in lại
- Làm mẫu: máy cắt Kongsberg X + phần mềm ArtiosCAD
- Sau in: cán màng, ép kim, dập nổi, UV định hình, chiết quang/hologram, drip-off, bế, gấp dán
- Kiểm phẩm tự động sau bế

### Chứng nhận
- ISO 9001:2015 (IQS)
- GMI (Graphic Measures International) — dùng cho khách Mỹ (Lowe's)
- FSC Chain of Custody — SCS-COC-009049 / FSC-C176695, hiệu lực 25/04/2022 → 24/04/2027

### Nhóm sản phẩm
1. **Hộp cứng & túi giấy** — hộp quà, hộp bánh trung thu, hộp trà, túi giấy (ảnh: `assets/img/work/`)
2. **Hộp giấy & bao bì** — hộp duplex/ivory/couché, hộp metalize, bao bì thuốc lá (ảnh: `assets/img/products/`)
3. **Nhãn** — couché, decal giấy
4. **Ấn phẩm** — tạp chí, catalogue *(lịch, sách: hồ sơ chưa có ảnh)*

### Khách hàng (logo có trong hồ sơ)
Wahl, Chivas Regal, Ford, W Gourmet, Mori, Hallmark, DIC, Giraldo, Hanes, Vinataba, L'Officiel, Neonlis, One2Fly

### Quy trình sản xuất (5 giai đoạn, trang 8 hồ sơ)
1. Phát triển sản phẩm — đặt hàng, thiết kế cấu trúc, cắt mẫu, khách duyệt
2. Chuẩn bị sản xuất — kiểm file, quản trị màu, bình trang, ghi kẽm CTP
3. In — in offset + tráng phủ, kiểm soát màu
4. Thành phẩm — ép kim, cán màng, dập nổi, UV, bế, gấp dán, kiểm phẩm
5. Giao hàng — đóng gói, xếp pallet, giao

---

## 2. Cấu trúc trang

Một trang dài (dễ bảo trì, không cần CMS), có menu nhảy tới từng phần. Tiếng Anh ở `/`, tiếng Việt ở `/vi/`.

| # | Phần | Nội dung |
|---|---|---|
| 1 | Hero | Tên + một câu: "Offset printing and paper packaging, Ho Chi Minh City, since 2006" |
| 2 | About | Đoạn giới thiệu ngắn, ảnh nhà xưởng, vài con số thật (2006, 3 máy Heidelberg, >1 triệu tờ/ngày, 720 × 1020 mm) |
| 3 | What we print | 4 nhóm sản phẩm, mỗi nhóm 1 ảnh + 2–3 dòng vật liệu/gia công |
| 4 | Work | Thư viện mẫu, lọc theo nhóm, bấm vào xem ảnh lớn |
| 5 | How a job runs | 5 bước quy trình (đây là chuỗi thật nên đánh số) |
| 6 | Equipment | Bảng thông số máy móc |
| 7 | Finishes | Danh sách kỹ thuật gia công, rê chuột thấy ảnh mẫu |
| 8 | Certificates | ISO 9001, GMI, FSC — bấm xem bản chứng nhận |
| 9 | Clients | Lưới logo |
| 10 | Contact | Địa chỉ, điện thoại, email, bản đồ Google, Facebook |

---

## 3. Hướng thiết kế: "Tờ in trên máy"

Ý tưởng: cả trang được dàn như một **tờ in chạy qua máy Heidelberg** — dùng đúng những thứ có thật trên tờ in (dấu cắt, dấu chồng màu, thanh kiểm màu, chữ chạy lề), không trang trí kiểu landing page.

### Màu
| Tên | Hex | Dùng cho |
|---|---|---|
| Giấy | `#F7F8F6` | nền chính (trắng giấy couché, không ngả kem) |
| Mực K | `#231F20` | chữ, đường kẻ (đúng màu đen process khi in) |
| Teal Minh Phương | `#19B5B1` | màu thương hiệu (lấy từ logo), link, nút |
| Cyan / Magenta / Yellow | `#00A0E3` / `#E5007D` / `#FFED00` | chỉ dùng trong hiệu ứng chồng màu và thanh kiểm màu |
| Xám bản kẽm | `#8A9399` | chữ phụ, dấu cắt |

### Chữ
- **Archivo** (Google Fonts, có tiếng Việt, có trục độ rộng). Một họ chữ duy nhất:
  - Tiêu đề: bản giãn rộng (width 115–125), đậm — gợi cảm giác chữ công nghiệp in trên thùng/máy
  - Nội dung: bản thường, cỡ 17–18px, dòng ≤ 72 ký tự
  - Số liệu: chữ số đều nhau (tabular) cho bảng máy móc

### Bố cục
- Căn trái, lưới 12 cột. Lề trái có một dải hẹp như **lề kẹp giấy** của tờ in: chứa dấu cắt và dòng chữ chạy nhỏ ("Minh Phuong Printing / 03 / Equipment"), như slug line trên tờ in thật.
- Ảnh sản phẩm đặt trong khung có **dấu cắt ở 4 góc** thay vì bo góc + đổ bóng.
- Giữa các phần dùng **thanh kiểm màu** (color control bar) mỏng thay cho đường kẻ ngang.

```
┌─┬───────────────────────────────────────────┐
│+│  MINH PHUONG PRINTING          EN | VI    │
│ │                                            │
│ │  Offset printing                          │  ← chữ C/M/Y/K lệch nhau
│ │  and paper packaging.                     │    rồi khớp lại khi tải trang
│ │                                            │
│ │  [ảnh hộp quà lớn trong khung dấu cắt]    │
│+│▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇ (thanh kiểm màu) │
└─┴───────────────────────────────────────────┘
```

### Hiệu ứng (ít, bền, không theo trend)
1. **Chồng màu khi tải trang (điểm nhấn duy nhất):** tiêu đề hero hiện ra thành 4 bản C, M, Y, K lệch nhau rồi trượt khớp thành chữ đen — đúng như căn chồng màu trên máy in. Chạy 1 lần, ~1,2 giây.
2. **Thanh kiểm màu = thanh tiến trình:** dải ô màu ở mép trên tô dần khi cuộn trang.
3. **Phủ UV khi rê chuột:** rê vào ảnh sản phẩm thấy một vệt bóng lướt qua như lớp UV định hình. Chỉ khi người dùng tác động.
4. **Lưới tram (halftone):** ảnh nền mờ ở phần Finishes dùng hạt tram, rê chuột ra ảnh thật.
5. **Quy trình 5 bước:** một "tờ in" nhỏ chạy qua 5 trạm khi cuộn tới phần đó.

Tất cả bằng CSS + JavaScript thuần, tự tắt nếu máy người xem bật "giảm chuyển động". Không dùng 3D/WebGL, không chiếm thanh cuộn, không hiệu ứng kính mờ — những thứ dễ lỗi thời.

### Vì sao không giống landing page thường
- Không có nền kem + chữ serif, không thẻ bo góc đổ bóng, không chữ in hoa giãn cách phía trên mỗi tiêu đề.
- Mọi chi tiết trang trí đều là vật thật của nghề in (dấu cắt, dấu chồng màu, thanh kiểm màu, tram) — nên đổi trend vẫn không lỗi thời.

---

## 4. Kỹ thuật

- HTML/CSS/JS thuần, không framework, không cần build → host ở đâu cũng được (Cloudflare Pages, Netlify, Vercel hoặc hosting hiện tại), chi phí ~0đ.
- Ảnh WebP, tải lười, kích thước responsive; mục tiêu Lighthouse ≥ 95.
- SEO: thẻ meta 2 ngôn ngữ, `hreflang`, schema `Organization`/`LocalBusiness`, sitemap.
- Ảnh đã tách sẵn: 22 ảnh mẫu hộp, 17 ảnh sản phẩm, 12 ảnh nhà xưởng/máy, 3 chứng nhận, 13 logo khách hàng.

---

## 5. Đã chốt (29/10/2026)

- Điện thoại: (028) 5435 6680
- Tên miền: mpjsc.com (user sẽ kiểm tra lại quyền quản lý)
- Được đăng logo khách hàng; ISO 12647 còn hiệu lực; bao bì thuốc lá được đưa vào thư viện mẫu
- Font đổi sang **Fraunces** in nghiêng (trục SOFT/WONK, mềm và bay hơn) cho tiêu đề, **Archivo** cho nội dung — theo yêu cầu "bay bổng, đừng cứng"
- Bản đồ dùng đúng địa điểm "Minh Phuong Printing" lấy từ trang liên hệ web cũ

## 5b. Bản 2 (29/10/2026, sau góp ý "nền trắng đơn điệu, chưa có wow")

- Nền đổi sang **giấy xanh teal đậm** (`#12312f`, màu teal Minh Phương nhuộm sẫm), chữ màu giấy ngà. Bỏ nền trắng.
- **Hero mới**: một tờ in thật chạy qua xưởng ngay trên màn hình: in lần lượt 4 bản C, M, Y, K (tách màu thật bằng SVG filter, bản sau chồng lên bản trước) → ép kim vàng → bế theo khuôn → lột phần giấy thừa → lật tấm phôi → gấp thành hộp quà 3D có nắp, nắp in hoa sen và chữ "Minh Phương" ép kim. Chạy một lần (~7,5 giây) khi tờ in hiện trên màn hình, có nút "In lại tờ khác"; xong thì rê chuột làm hộp nghiêng và ánh kim chạy theo. Code ở `assets/js/press.js`.
- Gọn bớt: bỏ thanh màu chạy dọc mép trái, dấu chồng màu cạnh tiêu đề, dấu cắt quanh ảnh, phiếu "job ticket" và con dấu. Gộp "Giới thiệu" và "Máy móc" thành một phần "Nhà xưởng". Thư viện mẫu hiện 9 ảnh đầu, có nút "Xem tất cả".
- Chứng nhận và logo khách hàng đặt trên thẻ giấy sáng như giấy tờ để trên bàn.
- Skill `ui-ux` (anh dán vào) đã cài ở `.claude/skills/ui-ux`. Skill viết cho màn hình app, chưa dạy landing page, nên chỉ lấy các luật hợp: thứ bậc chữ trên nền tối bằng độ sáng, ảnh có viền mờ 1px, không giãn chữ có dấu, không dùng gạch dài trong câu.

## 5c. Bản 3 (29/10/2026)

- Góp ý: sếp thích hoa văn **đồng tiền phong thủy**; hộp còn sơ sài, lỗi viền; cần thấy được dập nổi và UV; nút "In lại" không bấm được; các phần trang rời rạc, chưa sang, giống lướt slide; **chủ đạo là bao bì giấy**, hộp cứng và sách chỉ là phụ.
- Hộp: hoa văn đồng tiền đan nhau hai lớp, đồng tiền lỗ vuông ép kim + dập nổi ở giữa mỗi thành hộp, vòng 8 đồng tiền quanh hoa sen trên nắp, khung viền kim hai nét, lưới đồng tiền phủ UV bóng chỉ hiện khi có ánh sáng lướt qua. Quy trình trên màn hình thêm bước dập nổi và phủ UV. Tai gấp gập quá 90° để không chìa mép ra ngoài thành hộp. Sửa nút "In lại" (lớp 3D đè lên nút).
- Cả trang dùng chung một ý: **khách cầm đèn soi lên bàn đồ in**. Nền dập chìm hoa văn đồng tiền sáng lên quanh con trỏ; mọi ảnh, mẫu gia công, chứng nhận, logo khách đều bắt sáng và nghiêng nhẹ theo chuột; tiêu đề hiện ra như in chồng 3 màu; ảnh hiện dần bằng chấm tram; quy trình 5 bước có vạch in màu khi cuộn tới; giữa các phần có dải kim kèm đồng tiền; cuối trang là chữ "Minh Phương" ép kim lớn.
- Nội dung đưa bao bì giấy lên đầu: lời giới thiệu, thứ tự sản phẩm (hộp giấy đứng đầu), bộ lọc và thư viện mẫu.

## 5d. Bản 4 (30/10/2026)

- Góp ý: đồng tiền dùng quá nhiều ("công ty in chứ không phải cái chùa"); vòng tròn vàng và kim loại vàng lẫn nâu đen nhìn cũ, quê; hoa sen lệch màu với hộp đỏ; đỏ hơi chói; tờ in đè lên dòng chữ các bước khi bấm In lại.
- Nền trang: bỏ đồng tiền, thay bằng **lưới chấm tram ẩn**; quanh con trỏ chấm to dần như một mảng tô đậm nhạt khi in (chỉ trên máy tính có chuột). Dải chia giữa các phần dùng dấu canh màu thay đồng tiền.
- Hộp: đỏ trầm `#9b1d28`; bỏ hết đồng tiền và vòng tròn vàng; kim loại đổi sang vàng champagne sáng, không còn nâu đen; giữa nắp là chữ lồng **MP ép kim + dập nổi** trong khung kim mảnh. Hoa văn đồng tiền chỉ còn là lớp UV bóng chìm trên thân hộp.
- Thêm phần **"Màu chuẩn, đo bằng máy"** với quạt mẫu màu xoè ra khi cuộn tới: giấy trắng, C, M, Y, đỏ, xanh lá, xanh dương, đen, kèm thông số L*a*b* chuẩn ISO 12647-2:2004 giấy couché (**cần xưởng xác nhận đang chạy theo bản chuẩn nào**).
- Tối ưu: font tải không chặn trang; hộp sau khi gấp xong chỉ còn cập nhật góc nhìn và ánh sáng; hiệu ứng theo chuột ghi trực tiếp lên phần tử thay vì cả trang; tiêu đề chỉ nhân bản lúc đang hiện hiệu ứng rồi gỡ ra; ảnh xem sản phẩm tải lười; menu thu vào nút Menu dưới 1240px để không rớt dòng bản tiếng Việt.

## 5e. Bản 5 (30/10/2026)

- Góp ý: mặt hộp chỉ có chữ nên đơn giản, quê; không dùng hiệu ứng mờ đậm; nền chấm tram làm đậm một mảng nhìn khó chịu, muốn kiểu bắt sáng UV như trước; trang còn gò bó, đóng khung, rời rạc như slide; muốn phóng khoáng, liền mạch như web cũ (ảnh nền lớn); quạt màu đơn giản; chữ tên cuối trang quê; EN viết "Minh Phuong", VI viết "Minh Phương". **Không dùng lại nguyên ảnh của web cũ.**
- Mực loang tự tạo (khói, vân marble) đã thử ở bản này và **bị bỏ hẳn ở bản 6**.
- **Hộp**: in vân mực marble hồng tím (`ink-marble.webp`), chữ "Minh Phuong"/"Minh Phương" ép kim champagne với dập nổi nét mảnh (không mờ), lớp UV dạng chấm tram bắt sáng.
- **Nền**: các đám mực loang (cam, tím, xanh) nằm vắt qua ranh giới các phần, trôi chậm khi cuộn; đèn soi giờ là chấm tram bóng UV lấp lánh quanh con trỏ, không làm đậm.
- **Bố cục thoáng**: bỏ các vạch chia; tiêu đề so le; ảnh như tờ in đặt nghiêng trên bàn (thư viện, khung xem sản phẩm thành chồng tờ in, ảnh nhà xưởng chồng lên nhau, 5 bước quy trình bậc thang, chứng nhận và logo nghiêng nhẹ).
- **Quạt màu**: rê vào lá nào thì mực màu đó loang ra bên dưới.
- **Tên cuối trang**: chữ rất lớn chạy tràn mép, ruột chữ là vân mực của hộp.

## 5f. Bản 6 (30/10/2026)

- Góp ý: khói mực và vân mực loang "ghê, xấu" → **bỏ hết**. Giữ bố cục thoáng của bản 5.
- Hộp: trở lại **màu đỏ**, lưới đồng tiền trên thân và nắp có **phủ UV bắt sáng**, hoa sen trên nền tròn xanh ngọc, chữ "Minh Phuong"/"Minh Phương" viết tay (font **Great Vibes**, có dấu tiếng Việt) ép kim champagne. **Không dập nổi**; dòng các bước còn: in 4 màu, ép kim, phủ UV, bế, gấp dán.
- Nền: hoa văn đồng tiền dập chìm trở lại nhưng **mờ hơn**; quanh con trỏ các đường đồng tiền **phát sáng ánh vàng ấm**.
- Quạt màu: rê vào lá nào, màu đó loang **rộng khắp phần**, nhạt hơn màu gốc (khoảng 40%), hai lớp thay phiên nên màu cũ tan dần khi màu mới loang ra.
- Tên cuối trang: chữ viết tay rất lớn, cùng tông với nền như in chìm; rê chuột qua thì chữ sáng lên.
- Sửa lỗi: bản tiếng Việt mất chữ "Ép kim" và thẻ đóng ở dòng các bước (lỗi từ bản 3); hiệu ứng loang bị khai báo trùng làm màu đậm gấp đôi.

## 5g. Bản 7 (30/10/2026)

- Hộp: hoa sen và chữ bị mờ, vỡ vì mặt hộp được vẽ nhỏ rồi phóng to 2,15 lần; nay dựng ở đúng kích thước lúc hộp gấp xong, lúc tờ in thì thu nhỏ lại → nét. Hoa sen đổi thành **cành hoa mai nét mảnh ép kim** vắt ngang nắp; chữ trên hộp luôn là **"Minh Phuong"** (không dấu, kể cả bản tiếng Việt).
- Thêm **hộp giấy cao màu xanh ngọc** (cùng bộ: lưới đồng tiền tông xanh, dải đỏ, chữ ép kim) hạ xuống đứng cạnh hộp quà sau khi nắp đóng, để phần đầu kết thúc bằng một bộ sản phẩm.
- Nền: ánh vàng nhạt quanh con trỏ giảm còn khoảng một nửa, chỉ gợi hoa văn chứ không thấy rõ từng đồng tiền.
- Quạt màu: sửa lỗi lúc nào cũng loang màu trắng (gradient lấy màu từ khung định nghĩa chung); nay đúng màu từng lá, pha thêm khoảng 40% trắng cho nhạt hơn màu gốc.
- Chữ "Minh Phuong" cuối trang giữ nguyên (user đã duyệt).

## 5h. Bản 8 (30/10/2026) — hộp giấy cao đổi hẳn bộ nhận diện

- User chê hộp giấy cao (bản 7) trùng hoa văn với hộp quà. Đổi thành **hộp cà phê**: nền nâu đất kẻ sọc chéo (khác hẳn lưới đồng tiền), dải nẹp xanh đậm + kem, nhãn kem có hạt cà phê vẽ tay và chữ "Minh Phuong" chữ thường (không ép kim, không viết tay — vì đây là bao bì hàng ngày, không phải hộp quà cao cấp).

## 5i. Đưa lên mạng (30/10/2026)

- `git init` riêng cho thư mục `minh-phuong-website` (trước đó git nằm chung ở thư mục home, chưa commit được); đã commit bản đầy đủ.
- Lần đầu `gh repo create` bị bộ lọc an toàn chặn; dùng Artifact để demo nhanh trong lúc chờ: https://claude.ai/artifact/QEAib9ToQpb2NLfXWDcAUS (link riêng tư, chỉ xem được qua Share).
- Bản đồ Google Maps nhúng ở mục Liên hệ sẽ hiện trống trên link Artifact (chính sách bảo mật của khung xem chặn iframe ngoài); link "Open in Google Maps" bên dưới vẫn hoạt động bình thường.
- User xác nhận muốn đẩy GitHub → thử lại `gh repo create --private --source=. --remote=origin --push`, lần này thành công: https://github.com/nguyenphuckhang-work/minh-phuong-website.
- GitHub Pages không bật được trên repo private ở gói miễn phí (lỗi "current plan does not support GitHub Pages"). User chọn chuyển repo sang **public** để dùng Pages miễn phí → đã đổi visibility + bật Pages.
- **Link web chính thức (live):** https://nguyenphuckhang-work.github.io/minh-phuong-website/ — đã kiểm tra chạy đúng (hộp quà + hộp cà phê 3D, không lỗi console).
- Lưu ý: repo giờ là public, nghĩa là mã nguồn ai cũng xem được trên GitHub (không phải chỉ trang web). Nếu sau này muốn domain mpjsc.com trỏ vào, chỉ cần thêm CNAME trỏ vào GitHub Pages này.

## 6. Còn chờ

- Logo bản gốc dạng vector (đang dùng PNG 307×76)
- Ảnh mẫu lịch và sách (hiện chỉ nhắc trong chữ)
- Nơi deploy (Cloudflare Pages / Netlify / hosting hiện tại)
