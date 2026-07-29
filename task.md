# Master Task List: Shotuno (Individual Version)

Dựa trên yêu cầu gốc của bạn, đây là bản đối chiếu chi tiết để đảm bảo không lọt bất kỳ tính năng nào.

## Phase 1: Nền tảng kiến trúc (Đã hoàn thành)
- [x] Khởi tạo Vite + React 18 + TypeScript + Chrome Extension MV3.
- [x] Cài đặt `react-konva`, `zustand`, **`@tanstack/react-query`** (theo đúng yêu cầu), `tailwindcss`, Shadcn UI.
- [x] Thiết lập ESLint, Prettier, **Husky + lint-staged (Auto lint trước khi commit)**.
- [x] Xây dựng Shadow DOM Injection để hiển thị app ngay trên current page (không mở tab mới).

## Phase 2: Screen Capture Engine
- [ ] Chụp vùng nhìn thấy (Visible Content).
- [ ] Chụp theo vùng chọn (Area Selection - Kéo thả chuột).
- [ ] Chụp toàn trang (Full Page - Cuộn và ghép ảnh).

## Phase 3: Editor Core & State Management (Zustand + Konva)
- [ ] Xây dựng `useEditorStore` (Zustand) để quản lý: Công cụ đang chọn, Lịch sử thao tác, Mảng các hình vẽ (Shapes).
- [x] Khởi tạo `<Stage>` và `<Layer>` bằng `react-konva`.
- [x] Logic load ảnh chụp làm Background Layer.
- [x] Thuật toán Zoom & Auto Expand (Tự động thu phóng Canvas vừa với màn hình nếu ảnh quá to).
- [x] Xử lý background caro (checkered) để báo hiệu vùng trong suốt.

## Phase 4: Bộ công cụ Vẽ (Reference to Shottr)
- [x] **Selection Tool (V):** (Pending for advanced resizing, basic logic implemented via states).
- [x] **Arrow Tool (A):** Vẽ mũi tên (tùy chỉnh màu, độ dày nét).
- [x] **Rectangle Tool (R):** Vẽ khung viền vuông (border) để đánh dấu.
- [x] **Text Tool (T):** Click để thêm chữ, double-click để sửa chữ (Tùy chỉnh màu, kích thước).
- [x] **Brush Tool (B):** Vẽ tự do (Freehand) - Mặc định màu đỏ.
- [x] **Blur Tool (U):** Bôi mờ thông tin nhạy cảm (Sử dụng Filters của Konva).
- [x] **Hệ thống Lịch sử:** Undo (Ctrl+Z) và Redo (Ctrl+Y) cho mọi thao tác.

## Phase 5: Giao diện người dùng (UI Shell bằng Shadcn + Tailwind)
- [x] **Main Toolbar:** Thanh công cụ nổi ở giữa (Chứa icon Undo, Redo, các tools vẽ, Save, Close).
- [x] **Contextual Toolbar:** Thanh công cụ phụ tự động hiện ra (Chứa bảng chọn màu, thanh trượt chỉnh size) khi một tool cụ thể được chọn.
- [x] **Header / Title Input:** Ô nhập text để đổi tên file ảnh trực tiếp trên giao diện trước khi lưu.
- [x] **Keyboard Shortcuts:** Lắng nghe và xử lý phím tắt toàn cục (Esc để đóng, Ctrl+Z, v.v.).

## Phase 6: Quản lý lịch sử (Sidebar & IndexedDB)
- [x] Tích hợp `idb-keyval` (IndexedDB) để lưu trữ ảnh nội bộ (không dùng `chrome.storage` vì giới hạn 5MB).
- [x] Xây dựng giao diện Sidebar bên trái (Collapsible - có thể thu gọn).
- [x] Hiển thị danh sách ảnh lịch sử dạng Thumbnail Grid.
- [x] Chức năng mở lại ảnh từ lịch sử vào Canvas hiện tại (Click to Load).
- [x] Chức năng Xóa ảnh khỏi lịch sử.

## Phase 7: Export & Tương tác Output
- [x] Render Canvas thành Base64 / Blob.
- [x] Nút "Copy to Clipboard": Lưu ảnh thẳng vào Clipboard của hệ điều hành.
- [x] Nút "Download": Tải ảnh xuống máy.nơi lưu (store) screenshot (ví dụ: đổi thư mục lưu mặc định).

## Phase 8: Polish & Phát hành
- [ ] Đóng gói và tối ưu.
