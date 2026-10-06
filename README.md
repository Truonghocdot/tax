# Tax Platform

Monorepo cho hệ thống Thuế điện tử:

~~~text
apps/api     Laravel 12 + Sanctum REST API
apps/client  React/Vite frontend người dùng
apps/admin   React/Vite frontend quản trị
~~~

Filament đã được loại bỏ. Admin dùng REST API dưới /api/admin.

## 1. Yêu cầu

- PHP 8.2+
- Composer 2.x
- Node.js 20+ và npm 10+
- MySQL 8+ hoặc SQLite cho local
- Nginx + PHP-FPM khi deploy API

~~~powershell
php -v
composer --version
node --version
npm --version
~~~

## 2. Cài đặt lần đầu

~~~powershell
cd C:\Users\truonghocdot\Workspace\tax\tax-platform
npm ci

cd apps/api
Copy-Item .env.example .env
composer install
php artisan key:generate
php artisan storage:link
php artisan migrate --seed
~~~

Seeder tạo Admin local:

~~~text
Username: admin
Email: admin@et.com
Phone: 0000000000
Password: password
~~~

Đổi password trước khi deploy thật.

Tạo apps/client/.env:

~~~env
VITE_API_URL=http://127.0.0.1:8000/api
VITE_DEMO_LOGIN=false
~~~

Tạo apps/admin/.env:

~~~env
VITE_API_URL=http://127.0.0.1:8000/api
~~~

## 3. Chạy local

API:

~~~powershell
cd apps/api
php artisan serve --host=127.0.0.1 --port=8000
~~~

Client:

~~~powershell
cd apps/client
npm run dev -- --host 127.0.0.1 --port 8080
~~~

Mở http://127.0.0.1:8080.

Admin:

~~~powershell
cd apps/admin
npm run dev -- --host 127.0.0.1 --port 8081
~~~

Mở http://127.0.0.1:8081.

## 4. Demo login local

Demo login cho phép nhập username/password bất kỳ để tạo hoặc cập nhật user thường local.

apps/client/.env:

~~~env
VITE_DEMO_LOGIN=true
~~~

apps/api/.env:

~~~env
DEMO_LOGIN_ENABLED=true
~~~

Sau khi đổi env:

~~~powershell
cd apps/api
php artisan config:clear
~~~

Endpoint là POST /api/demo/login. Endpoint bị khóa khi APP_ENV=production và không thể dùng cho tài khoản Admin. Không bật trên production.

## 5. Test, lint và build

Client:

~~~powershell
cd apps/client
npm run build
npm run test
npm run lint
~~~

Admin:

~~~powershell
cd apps/admin
npm run build
~~~

API:

~~~powershell
cd apps/api
composer validate --strict
php artisan test
php artisan route:list --path=api
~~~

Build frontend từ root:

~~~powershell
cd C:\Users\truonghocdot\Workspace\tax\tax-platform
npm run build:client
npm run build:admin
~~~

Output:

~~~text
apps/client/dist
apps/admin/dist
~~~

## 6. Environment production

apps/api/.env:

~~~env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.example.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=tax
DB_USERNAME=tax_user
DB_PASSWORD=CHANGE_ME

FILESYSTEM_DISK=public
QUEUE_CONNECTION=database
SESSION_DRIVER=database
CACHE_STORE=database
DEMO_LOGIN_ENABLED=false
CORS_ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com
~~~

apps/client/.env.production:

~~~env
VITE_API_URL=https://api.example.com/api
VITE_DEMO_LOGIN=false
~~~

apps/admin/.env.production:

~~~env
VITE_API_URL=https://api.example.com/api
~~~

Vite đọc env lúc build. Đổi env frontend thì phải build lại.

## 7. Build API production

~~~powershell
cd apps/api
composer install --no-dev --prefer-dist --optimize-autoloader
php artisan storage:link
php artisan migrate --force
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
~~~

Không chạy php artisan migrate:fresh trên production vì lệnh này xóa dữ liệu.

## 8. Deploy API với Nginx + PHP-FPM

~~~bash
sudo mkdir -p /var/www/tax-platform
cd /var/www/tax-platform
git clone <REPOSITORY_URL> .
cd apps/api
composer install --no-dev --prefer-dist --optimize-autoloader
cp .env.example .env
php artisan key:generate --force
php artisan migrate --force
php artisan storage:link
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
~~~

Quyền thư mục:

~~~bash
sudo chown -R www-data:www-data /var/www/html/hsdnvn/apps/api/storage /var/www/html/hsdnvn/apps/api/bootstrap/cache
sudo chmod -R ug+rwX /var/www/html/hsdnvn/apps/api/storage /var/www/html/hsdnvn/apps/api/bootstrap/cache
~~~

Nginx server block cho API:

~~~nginx
server {
    listen 80;
    server_name api.example.com;
    root /var/www/tax-platform/apps/api/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
~~~

Kiểm tra và reload:

~~~bash
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl restart php8.3-fpm
curl -i https://api.example.com/
curl -i https://api.example.com/up
~~~

## 9. Deploy Client và Admin dạng SPA static

~~~bash
cd /var/www/tax-platform
npm ci
npm run build:client
npm run build:admin
~~~

Nginx cho Client:

~~~nginx
server {
    listen 80;
    server_name app.example.com;
    root /var/www/tax-platform/apps/client/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
~~~

Nginx cho Admin:

~~~nginx
server {
    listen 80;
    server_name admin.example.com;
    root /var/www/tax-platform/apps/admin/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
~~~

Cấp HTTPS:

~~~bash
sudo certbot --nginx -d api.example.com -d app.example.com -d admin.example.com
~~~

## 10. Queue worker

~~~bash
cd /var/www/tax-platform/apps/api
php artisan queue:work --tries=3 --timeout=90
~~~

Chạy worker bằng Supervisor hoặc systemd. Sau mỗi lần deploy:

~~~bash
php artisan queue:restart
~~~

## 11. Quy trình deploy lại

~~~bash
cd /var/www/tax-platform
git pull --ff-only

cd apps/api
composer install --no-dev --prefer-dist --optimize-autoloader
php artisan migrate --force
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan queue:restart

cd ../..
npm ci
npm run build:client
npm run build:admin

sudo systemctl reload nginx
~~~

## 12. API Admin

~~~text
POST   /api/admin/login
GET    /api/admin/me
GET    /api/admin/stats
GET    /api/admin/users
POST   /api/admin/users
POST   /api/admin/users/bulk-delete
GET    /api/admin/users/{user}
POST   /api/admin/users/{user}       FormData + _method=PATCH
DELETE /api/admin/users/{user}
POST   /api/admin/users/{user}/approve
PUT    /api/admin/users/{user}/qr-bank
~~~

Endpoint Admin yêu cầu Bearer token Sanctum và role Admin. Password/CVV ngân hàng không được trả về API.
