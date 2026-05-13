# Deploy SyncMind — Custom Domain with HTTPS (No Docker)

This guide deploys SyncMind on an Ubuntu EC2 instance using a custom domain (`yourdomain.com`) with automatic HTTPS via Let's Encrypt.

---

## Architecture

```
Browser
  └── https://yourdomain.com        → Nginx → Next.js (PM2, port 3000)
  └── https://api.yourdomain.com    → Nginx → Laravel (PHP-FPM)

PostgreSQL 16 running locally (port 5432, internal only)
```

---

## Prerequisites

- A registered domain (e.g. `yourdomain.com`)
- Two DNS A records pointing to your EC2 Elastic IP:
  - `yourdomain.com` → `<EC2-ELASTIC-IP>`
  - `api.yourdomain.com` → `<EC2-ELASTIC-IP>`
- An Elastic IP attached to your instance (so the IP doesn't change on reboot)

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
| 443 | TCP | 0.0.0.0/0 |

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@<EC2-ELASTIC-IP>
```

---

## 2. System Packages

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl unzip ufw

sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

---

## 3. PHP 8.2 + Extensions

```bash
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install -y php8.2 php8.2-fpm php8.2-cli php8.2-pgsql \
  php8.2-mbstring php8.2-xml php8.2-curl php8.2-zip php8.2-bcmath php8.2-intl

curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

---

## 4. Node.js 20 + PM2

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
CREATE USER syncmind WITH PASSWORD 'strong_secure_password';
CREATE DATABASE syncmind_prod OWNER syncmind;
GRANT ALL PRIVILEGES ON DATABASE syncmind_prod TO syncmind;
EOF
```

---

## 6. Nginx (HTTP — temporary before SSL)

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo rm /etc/nginx/sites-enabled/default
```

**`/etc/nginx/sites-available/syncmind-frontend`**

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**`/etc/nginx/sites-available/syncmind-api`**

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    root /var/www/syncmind/backend/public;
    index index.php;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/syncmind-frontend /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/syncmind-api /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## 7. SSL with Let's Encrypt

> DNS records must be propagated before running certbot.

```bash
sudo apt install -y certbot python3-certbot-nginx

sudo certbot --nginx \
  -d yourdomain.com \
  -d www.yourdomain.com \
  -d api.yourdomain.com

# Certbot rewrites Nginx configs to add HTTPS + HTTP → HTTPS redirect
sudo systemctl reload nginx
```

Auto-renewal is set up automatically. Test it:

```bash
sudo certbot renew --dry-run
```

---

## 8. Clone & Configure

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
APP_URL=https://api.yourdomain.com

FRONTEND_URL=https://yourdomain.com

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=syncmind_prod
DB_USERNAME=syncmind
DB_PASSWORD=strong_secure_password

SESSION_DRIVER=cookie
SESSION_DOMAIN=.yourdomain.com
SANCTUM_STATEFUL_DOMAINS=yourdomain.com,www.yourdomain.com

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://api.yourdomain.com/api/auth/google/callback

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

### Backend CORS (`config/cors.php`)

```php
'allowed_origins' => ['https://yourdomain.com', 'https://www.yourdomain.com'],
'supports_credentials' => true,
```

### Frontend `.env.local`

```bash
cd /var/www/syncmind/frontend
cp .env.local.example .env.local
nano .env.local
```

```env
NEXT_PUBLIC_BACKEND_URL=https://api.yourdomain.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

```bash
npm install
npm run build
```

---

## 9. Start Frontend with PM2

```bash
cd /var/www/syncmind/frontend
pm2 start npm --name "syncmind-frontend" -- start
pm2 save
pm2 startup    # run the command it prints
```

---

## 10. Verify

```bash
pm2 status
sudo systemctl status nginx php8.2-fpm postgresql

# Test HTTPS
curl https://api.yourdomain.com/api/health
```

Open `https://yourdomain.com` — the SyncMind login page should load over HTTPS.

---

## 11. Deploy Updates

```bash
cd /var/www/syncmind && git pull

# Backend
cd backend
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache && php artisan route:cache && php artisan view:cache

# Frontend
cd ../frontend
npm install && npm run build
pm2 restart syncmind-frontend
```

---

## 12. Useful Commands

| Task | Command |
|---|---|
| Laravel logs | `tail -f /var/www/syncmind/backend/storage/logs/laravel.log` |
| Frontend logs | `pm2 logs syncmind-frontend` |
| Nginx errors | `sudo tail -f /var/log/nginx/error.log` |
| Reload Nginx | `sudo systemctl reload nginx` |
| Restart PHP-FPM | `sudo systemctl restart php8.2-fpm` |
| SSL renewal test | `sudo certbot renew --dry-run` |
