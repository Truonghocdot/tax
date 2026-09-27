# Tax Platform

Monorepo mới cho hệ thống Thuế điện tử, gồm API Laravel, frontend người dùng và frontend quản trị độc lập.

## Cấu trúc

- `apps/api`: Laravel 12 + Sanctum. Filament đã được loại bỏ; Admin dùng REST API dưới `/api/admin`.
- `apps/client`: frontend người dùng được chuyển từ `tax-mobile`.
- `apps/admin`: frontend React/Vite quản trị thay thế toàn bộ giao diện Filament.

## Chạy local

### API

```powershell
cd apps/api
copy .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

### Frontend

```powershell
npm install
npm run dev:client  # http://localhost:8080
npm run dev:admin   # http://localhost:8081
```

Đặt `VITE_API_URL=http://127.0.0.1:8000/api` trong file `.env.local` của từng frontend nếu API không chạy ở địa chỉ mặc định.

Sau khi chạy `php artisan migrate --seed`, tài khoản quản trị phát triển mặc định là `admin` / `password`. Hãy đổi mật khẩu trước khi đưa lên môi trường thật.

## API quản trị

Admin đăng nhập tại `POST /api/admin/login`. Các endpoint còn lại yêu cầu Bearer token Sanctum và vai trò Admin:

`/api/admin/me`, `/api/admin/stats`, `/api/admin/users`, `/api/admin/users/{user}/approve`, `/api/admin/users/{user}/qr-bank`.

Không lưu hoặc trả password/CVV ngân hàng qua API.
