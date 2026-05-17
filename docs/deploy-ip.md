# Deploy SyncMind — EC2 Public IP / DNS Name (No Custom Domain)

This guide deploys SyncMind on an Ubuntu EC2 instance using only the public IP address or the default EC2 DNS name (e.g. `ec2-54-123-45-67.ap-southeast-1.compute.amazonaws.com`). No purchased domain or SSL is required.

---

## Architecture

```
Browser
  └── http://<EC2-IP>          → Nginx (port 80)
        ├── /api/*             → Laravel (PHP-FPM)
        ├── /sanctum/*         → Laravel (PHP-FPM)
        └── /*                 → Next.js (port 3000, PM2)

PostgreSQL 16 running locally (port 5432, internal only)
```

Both the frontend and API share **the same origin** (`http://<EC2-IP>`) so Sanctum session cookies work without cross-origin configuration.

---

## 1. Launch EC2 Instance

| Setting | Value |
|---|---|
| AMI | Ubuntu 24.04 LTS |
| Instance type | `t3.small` (minimum) |
| Storage | 20 GB gp3 |

**Security Group inbound rules:**

| Port | Protocol | Source |
|---|---|---|
| 22 | TCP | Your IP only |
| 80 | TCP | 0.0.0.0/0 |
| 5432 | TCP | — (blocked, local only) |

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@<EC2-PUBLIC-IP>
```

---

## 2. System Packages

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl unzip ufw

sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw enable
```

---

## 3. PHP 8.2 + Extensions

```bash
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install -y php8.2 php8.2-fpm php8.2-cli php8.2-pgsql \
  php8.2-mbstring php8.2-xml php8.2-curl php8.2-zip php8.2-bcmath php8.2-intl

# Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

---

## 4. Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

---

## 5. PostgreSQL 16 + pgvector

```bash
sudo apt install -y postgresql postgresql-contrib postgresql-16-pgvector

sudo systemctl enable postgresql && sudo systemctl start postgresql

sudo -u postgres psql <<EOF
CREATE USER syncmind WITH PASSWORD 'change_this_password';
CREATE DATABASE syncmind_prod OWNER syncmind;
GRANT ALL PRIVILEGES ON DATABASE syncmind_prod TO syncmind;
EOF
```

---

## 6. Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
```

Create `/etc/nginx/sites-available/syncmind`:

```nginx
server {
    listen 80;
    server_name _;          # matches any hostname / IP

    # ── Laravel API routes ──────────────────────────────────────
    location ~ ^/(api|sanctum|storage)(/.*)?$ {
        root /var/www/syncmind/backend/public;
        try_files $uri $uri/ /index.php?$query_string;

        location ~ \.php$ {
            fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
            fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
            include fastcgi_params;
        }
    }

    # ── Next.js frontend ────────────────────────────────────────
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo rm /etc/nginx/sites-enabled/default
sudo ln -s /etc/nginx/sites-available/syncmind /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## 7. Clone & Configure

```bash
sudo mkdir -p /var/www/syncmind
sudo chown ubuntu:ubuntu /var/www/syncmind
git clone https://github.com/your-org/SyncMind.git /var/www/syncmind
```

### Backend `.env`

```bash
cd /var/www/syncmind/backend
composer install --no-dev --optimize-autoloader
cp .env.example .env
nano .env
```

```env
APP_NAME=SyncMind
APP_ENV=production
APP_DEBUG=false
APP_URL=http://<EC2-PUBLIC-IP>

FRONTEND_URL=http://<EC2-PUBLIC-IP>

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=syncmind_prod
DB_USERNAME=syncmind
DB_PASSWORD=change_this_password

SESSION_DRIVER=cookie
SESSION_DOMAIN=<EC2-PUBLIC-IP>
SANCTUM_STATEFUL_DOMAINS=<EC2-PUBLIC-IP>

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://<EC2-PUBLIC-IP>/api/auth/google/callback

OPENAI_API_KEY=your_openai_key
OPENAI_BASE_URI=https://openrouter.ai/api/v1
```

```bash
php artisan key:generate
php artisan migrate --force
php artisan storage:link
php artisan config:cache && php artisan route:cache && php artisan view:cache

sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

### Frontend `.env.local`

```bash
cd /var/www/syncmind/frontend
cp .env.local.example .env.local
nano .env.local
```

```env
NEXT_PUBLIC_BACKEND_URL=http://<EC2-PUBLIC-IP>
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

```bash
npm install
npm run build
```

---

## 8. Start Frontend with PM2

```bash
cd /var/www/syncmind/frontend
pm2 start npm --name "syncmind-frontend" -- start
pm2 save
pm2 startup    # run the command it prints to auto-start on reboot
```

---

## 9. Verify

```bash
# Check services
sudo systemctl status nginx
sudo systemctl status php8.2-fpm
sudo systemctl status postgresql
pm2 status

# Test API
curl http://<EC2-PUBLIC-IP>/api/health     # or any public route

# View logs
tail -f /var/www/syncmind/backend/storage/logs/laravel.log
pm2 logs syncmind-frontend
sudo tail -f /var/log/nginx/error.log
```

Open `http://<EC2-PUBLIC-IP>` in a browser — the SyncMind login page should load.

---

## 10. Deploy Updates

```bash
cd /var/www/syncmind
git pull

# Backend
cd backend
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache && php artisan route:cache && php artisan view:cache

# Frontend
cd ../frontend
npm install
npm run build
pm2 restart syncmind-frontend
```

---

## Notes

- HTTP only — no SSL. Suitable for development/testing, not for production user data.
- Google OAuth may reject `http://` redirect URIs. Add the IP to Google Cloud Console as an authorised redirect.
- If you stop/start the instance the public IP changes — use an **Elastic IP** to keep it fixed.
