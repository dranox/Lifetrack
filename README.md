# Lifetrack

Ứng dụng quản lý chi tiêu và lịch trình cá nhân với AI Assistant.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)

## Tính năng

### Chi tiêu & Thu nhập
- Ghi nhận chi tiêu/thu nhập nhanh chóng
- Phân loại tự động theo danh mục (ăn uống, di chuyển, mua sắm, v.v.)
- Biểu đồ thống kê chi tiêu theo danh mục
- Theo dõi số dư tổng và theo tháng

### Lịch trình
- Quản lý sự kiện với calendar view
- Phân loại sự kiện (công việc, cá nhân, họp, học tập, v.v.)
- Đánh dấu hoàn thành sự kiện

### AI Chat Assistant
- Hỗ trợ ngôn ngữ tự nhiên tiếng Việt
- Tích hợp Ollama AI (local LLM)
- Rule-based fallback khi không có AI
- Ví dụ:
  - "chi 50k ăn trưa"
  - "nhận 10tr lương"
  - "họp 3h chiều mai"
  - "chiều nay 3 giờ có cuộc họp"

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand (với localStorage persistence)
- **Charts**: Recharts
- **Date**: date-fns
- **Icons**: Lucide React
- **AI**: Ollama (optional)

## Cài đặt

```bash
# Clone repo
git clone https://github.com/dranox/Lifetrack.git
cd Lifetrack

# Cài dependencies
npm install

# Chạy development server
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

## Cài đặt Ollama (Optional)

Để sử dụng AI chat thực sự:

1. Cài đặt [Ollama](https://ollama.com)
2. Pull model:
   ```bash
   ollama pull qwen2.5-coder
   ```
3. Chạy Ollama server (mặc định port 11434)

Nếu không có Ollama, ứng dụng sẽ tự động dùng rule-based parser.

## Cấu trúc thư mục

```
src/
├── app/
│   ├── api/chat/       # Ollama API route
│   ├── chat/           # Chat page
│   ├── expense/        # Expense page
│   ├── schedule/       # Schedule page
│   └── page.tsx        # Dashboard
├── components/
│   ├── chat/           # Chat components
│   ├── dashboard/      # Dashboard components
│   ├── expense/        # Expense components
│   ├── schedule/       # Schedule components
│   └── ui/             # Shared UI components
├── store/              # Zustand store
└── types/              # TypeScript types
```

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```
