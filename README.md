# VN Investment Dashboard

Dashboard tự động cập nhật giá ETF, Vàng nhẫn và BĐS TP.HCM hằng ngày.

## Deploy lên Vercel (5 bước)

### 1. Push lên GitHub
```bash
git init
git add .
git commit -m "init dashboard"
git remote add origin https://github.com/YOUR_USERNAME/vn-dashboard.git
git push -u origin main
```

### 2. Kết nối Vercel
- Vào [vercel.com](https://vercel.com) → Sign in with GitHub
- New Project → Import repo `vn-dashboard`
- Framework Preset: **Other**
- Root Directory: để trống (dùng root)

### 3. Thêm API Key
Trong Vercel project settings → **Environment Variables**:
```
ANTHROPIC_API_KEY = sk-ant-...
```
Lấy API key tại: https://console.anthropic.com/

### 4. Deploy
Nhấn **Deploy** — Vercel tự build và cấp link dạng `vn-dashboard.vercel.app`

### 5. Dùng
Mở link → nhấn **Cập nhật** → Claude tự search và điền dữ liệu.

## Cấu trúc
```
/
├── api/
│   └── update.js      # Serverless function — gọi Anthropic API
├── public/
│   └── index.html     # Frontend dashboard
├── vercel.json        # Config timeout 60s cho API
└── package.json
```

## Tự động cập nhật mỗi sáng (tùy chọn)
Thêm vào `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/update",
    "schedule": "0 1 * * *"
  }]
}
```
(Chạy lúc 8h sáng GMT+7 mỗi ngày — cần Vercel Pro)
