# Deploy SyncMind — Docker on EC2 with Custom Domain + HTTPS

This guide runs the full SyncMind stack inside Docker containers with a custom domain, automatic HTTPS (Let's Encrypt via Certbot), and an Nginx reverse proxy container.

---

## Architecture

```
Browser
  └── https://yourdomain.com        → Nginx container (443)
        └── /*                      → frontend container (port 3000)
  └── https://api.yourdomain.com    → Nginx container (443)
        └── /api/* /sanctum/*       → backend container (PHP-FPM 9000)

db container: PostgreSQL 16 + pgvector (internal only)
SSL certificates stored in a shared Docker volume, renewed by certbot container
```

---

## Prerequisites

- Registered domain (e.g. `yourdomain.com`)
- Two DNS A records pointing to your EC2 **Elastic IP**:
  - `yourdomain.com` → `<EC2-ELASTIC-IP>`
  - `api.yourdomain.com` → `<EC2-ELASTIC-IP>`
- DNS must be fully propagated before issuing certificates

---

## 1. Launch EC2 Instance

| Setting | Value |
|---|---|
| AMI | Ubuntu 24.04 LTS |
| Instance type | `t3.small` (minimum) |
| Storage | 25 GB gp3 |

**Attach an Elastic IP** to the instance so the IP never changes on reboot.

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

## 2. Install Docker & Docker Compose

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y ca-certificates curl gnupg ufw

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

sudo usermod -aG docker ubuntu && newgrp docker

sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

---

## 3. Clone the Repository

```bash
git clone https://github.com/your-org/SyncMind.git /home/ubuntu/syncmind
cd /home/ubuntu/syncmind
```

---

## 4. Backend Environment

```bash
cp backend/.env.example backend/.env
nano backend/.env
```

```env
APP_NAME=SyncMind
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.yourdomain.com

FRONTEND_URL=https://yourdomain.com

DB_CONNECTION=pgsql
DB_HOST=db
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

---

## 5. Frontend Environment

```bash
cp frontend/.env.local.example frontend/.env.local
nano frontend/.env.local
```

```env
NEXT_PUBLIC_BACKEND_URL=https://api.yourdomain.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 6. Nginx Configuration Files

Create the directory and config files that Nginx will use inside Docker.

```bash
mkdir -p nginx/conf.d
```

### `nginx/conf.d/frontend.conf` — HTTP only (used before SSL is issued)

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Required for Let's Encrypt domain verification
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        proxy_pass http://frontend:3000;
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

### `nginx/conf.d/api.conf` — HTTP only (used before SSL is issued)

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        root /var/www/html/public;
        try_files $uri $uri/ /index.php?$query_string;

        location ~ \.php$ {
            fastcgi_pass backend:9000;
            fastcgi_param SCRIPT_FILENAME /var/www/html/public$fastcgi_script_name;
            fastcgi_param DOCUMENT_ROOT /var/www/html/public;
            include fastcgi_params;
        }
    }

    location ~ /\.(?!well-known).* { deny all; }
}
```

---

## 7. Production `docker-compose.yml`

Create `docker-compose.prod.yml`:

```yaml
services:
  db:
    image: pgvector/pgvector:pg16
    restart: unless-stopped
    environment:
      POSTGRES_DB: syncmind_prod
      POSTGRES_USER: syncmind
      POSTGRES_PASSWORD: strong_secure_password
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - syncmind

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: unless-stopped
    depends_on:
      - db
    env_file: ./backend/.env
    volumes:
      - backend_storage:/var/www/html/storage
    networks:
      - syncmind

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_BACKEND_URL: https://api.yourdomain.com
        NEXT_PUBLIC_GOOGLE_CLIENT_ID: your_google_client_id
    restart: unless-stopped
    depends_on:
      - backend
    networks:
      - syncmind

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - certbot_www:/var/www/certbot:ro
      - certbot_certs:/etc/letsencrypt:ro
      - backend_storage:/var/www/html/storage:ro
    depends_on:
      - frontend
      - backend
    networks:
      - syncmind

  certbot:
    image: certbot/certbot
    volumes:
      - certbot_www:/var/www/certbot
      - certbot_certs:/etc/letsencrypt
    # Run on-demand only (see step 8)
    entrypoint: /bin/sh -c "trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done"

volumes:
  pgdata:
  backend_storage:
  certbot_www:
  certbot_certs:

networks:
  syncmind:
    driver: bridge
```

---

## 8. First-Time SSL Certificate

### Step 1 — Start with HTTP-only configs

```bash
docker compose -f docker-compose.prod.yml up -d db backend frontend nginx

# Run initial setup
docker compose -f docker-compose.prod.yml exec backend php artisan key:generate
docker compose -f docker-compose.prod.yml exec backend php artisan migrate --force
docker compose -f docker-compose.prod.yml exec backend php artisan storage:link
docker compose -f docker-compose.prod.yml exec backend \
  sh -c 'php artisan config:cache && php artisan route:cache && php artisan view:cache'
```

### Step 2 — Issue SSL certificates

```bash
# Request certificates (Nginx must be running for ACME challenge)
docker compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email your@email.com \
  --agree-tos \
  --no-eff-email \
  -d yourdomain.com \
  -d www.yourdomain.com \
  -d api.yourdomain.com
```

### Step 3 — Switch to HTTPS Nginx configs

Replace `nginx/conf.d/frontend.conf`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    location /.well-known/acme-challenge/ { root /var/www/certbot; }
    location / { return 301 https://$host$request_uri; }
}

server {
    listen 443 ssl;
    server_name yourdomain.com www.yourdomain.com;
    http2 on;

    ssl_certificate     /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    location / {
        proxy_pass http://frontend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Replace `nginx/conf.d/api.conf`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    location /.well-known/acme-challenge/ { root /var/www/certbot; }
    location / { return 301 https://$host$request_uri; }
}

server {
    listen 443 ssl;
    server_name api.yourdomain.com;
    http2 on;

    ssl_certificate     /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    location / {
        root /var/www/html/public;
        try_files $uri $uri/ /index.php?$query_string;

        location ~ \.php$ {
            fastcgi_pass backend:9000;
            fastcgi_param SCRIPT_FILENAME /var/www/html/public$fastcgi_script_name;
            fastcgi_param DOCUMENT_ROOT /var/www/html/public;
            include fastcgi_params;
            fastcgi_hide_header X-Powered-By;
        }
    }

    location ~ /\.(?!well-known).* { deny all; }
}
```

### Step 4 — Reload Nginx with HTTPS config

```bash
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

### Step 5 — Start the certbot auto-renewal service

```bash
docker compose -f docker-compose.prod.yml up -d certbot
```

The certbot container checks for renewal every 12 hours automatically.

---

## 9. Verify

```bash
docker compose -f docker-compose.prod.yml ps

# Test HTTPS
curl https://api.yourdomain.com/api/health
curl https://yourdomain.com
```

---

## 10. Deploy Updates

```bash
cd /home/ubuntu/syncmind
git pull

docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

docker compose -f docker-compose.prod.yml exec backend php artisan migrate --force
docker compose -f docker-compose.prod.yml exec backend \
  sh -c 'php artisan config:cache && php artisan route:cache && php artisan view:cache'

docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

---

## 11. Useful Commands

| Task | Command |
|---|---|
| All container status | `docker compose -f docker-compose.prod.yml ps` |
| Laravel logs | `docker compose -f docker-compose.prod.yml logs -f backend` |
| Frontend logs | `docker compose -f docker-compose.prod.yml logs -f frontend` |
| Nginx logs | `docker compose -f docker-compose.prod.yml logs -f nginx` |
| Force cert renewal | `docker compose -f docker-compose.prod.yml run --rm certbot renew --force-renewal` |
| Shell into backend | `docker compose -f docker-compose.prod.yml exec backend bash` |
| Shell into db | `docker compose -f docker-compose.prod.yml exec db psql -U syncmind syncmind_prod` |
| Stop all | `docker compose -f docker-compose.prod.yml down` |
| Stop + remove volumes | `docker compose -f docker-compose.prod.yml down -v` |

---

## File Structure Summary

```
syncmind/
├── backend/
│   ├── .env                         ← production env
│   └── Dockerfile
├── frontend/
│   ├── .env.local                   ← production env
│   └── Dockerfile
├── nginx/
│   └── conf.d/
│       ├── frontend.conf            ← HTTP → HTTPS redirect + proxy
│       └── api.conf                 ← HTTP → HTTPS redirect + PHP-FPM
├── docker-compose.prod.yml          ← production compose file
└── docker-compose.yml               ← development compose file (unchanged)
```
