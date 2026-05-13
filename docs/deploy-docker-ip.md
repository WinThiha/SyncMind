# Deploy SyncMind — Docker on EC2 Public IP / DNS Name (No Custom Domain)

This guide runs the full SyncMind stack (Laravel + Next.js + PostgreSQL + Nginx) inside Docker containers using only an EC2 public IP or default DNS name. No purchased domain or SSL is required.

---

## Architecture

```
Browser
  └── http://<EC2-IP>               → Nginx container (port 80)
        ├── /api/* and /sanctum/*   → backend container (PHP-FPM)
        └── /*                      → frontend container (port 3000)

db container: PostgreSQL 16 + pgvector (internal network only)
```

All containers share a private Docker network. Only Nginx exposes port 80 to the internet.

---

## 1. Launch EC2 Instance

| Setting | Value |
|---|---|
| AMI | Ubuntu 24.04 LTS |
| Instance type | `t3.small` (minimum) |
| Storage | 25 GB gp3 |

**Security Group inbound rules:**

| Port | Protocol | Source |
|---|---|---|
| 22 | TCP | Your IP only |
| 80 | TCP | 0.0.0.0/0 |

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@<EC2-PUBLIC-IP>
```

---

## 2. Install Docker & Docker Compose

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y ca-certificates curl gnupg ufw

# Docker GPG key + repo
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Run Docker without sudo
sudo usermod -aG docker ubuntu
newgrp docker

# Firewall
sudo ufw allow OpenSSH
sudo ufw allow 80
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
APP_URL=http://<EC2-PUBLIC-IP>

FRONTEND_URL=http://<EC2-PUBLIC-IP>

DB_CONNECTION=pgsql
DB_HOST=db                          # Docker service name
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

---

## 5. Frontend Environment

```bash
cp frontend/.env.local.example frontend/.env.local
nano frontend/.env.local
```

```env
NEXT_PUBLIC_BACKEND_URL=http://<EC2-PUBLIC-IP>
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 6. Production `docker-compose.yml`

Create `docker-compose.prod.yml` in the project root:

```yaml
services:
  db:
    image: pgvector/pgvector:pg16
    restart: unless-stopped
    environment:
      POSTGRES_DB: syncmind_prod
      POSTGRES_USER: syncmind
      POSTGRES_PASSWORD: change_this_password
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
        NEXT_PUBLIC_BACKEND_URL: http://<EC2-PUBLIC-IP>
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
    volumes:
      - ./nginx/prod-ip.conf:/etc/nginx/conf.d/default.conf:ro
      - backend_storage:/var/www/html/storage:ro
    depends_on:
      - frontend
      - backend
    networks:
      - syncmind

volumes:
  pgdata:
  backend_storage:

networks:
  syncmind:
    driver: bridge
```

---

## 7. Nginx Config for Docker

Create `nginx/prod-ip.conf`:

```nginx
upstream frontend {
    server frontend:3000;
}

upstream backend_php {
    server backend:9000;
}

server {
    listen 80;
    server_name _;

    # API and Sanctum routes → Laravel
    location ~ ^/(api|sanctum|storage)(/.*)?$ {
        root /var/www/html/public;
        try_files $uri $uri/ /index.php?$query_string;

        location ~ \.php$ {
            fastcgi_pass backend_php;
            fastcgi_param SCRIPT_FILENAME /var/www/html/public$fastcgi_script_name;
            fastcgi_param DOCUMENT_ROOT /var/www/html/public;
            include fastcgi_params;
        }
    }

    # Everything else → Next.js
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 8. Build & Start

```bash
cd /home/ubuntu/syncmind

# Build all images
docker compose -f docker-compose.prod.yml build

# Start in detached mode
docker compose -f docker-compose.prod.yml up -d

# Run initial migrations and cache
docker compose -f docker-compose.prod.yml exec backend php artisan key:generate
docker compose -f docker-compose.prod.yml exec backend php artisan migrate --force
docker compose -f docker-compose.prod.yml exec backend php artisan storage:link
docker compose -f docker-compose.prod.yml exec backend \
  sh -c 'php artisan config:cache && php artisan route:cache && php artisan view:cache'
```

---

## 9. Verify

```bash
# Check all containers are running
docker compose -f docker-compose.prod.yml ps

# Test API
curl http://<EC2-PUBLIC-IP>/api/health

# Logs
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f nginx
```

Open `http://<EC2-PUBLIC-IP>` in a browser.

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
```

---

## 11. Useful Commands

| Task | Command |
|---|---|
| All container status | `docker compose -f docker-compose.prod.yml ps` |
| Laravel logs | `docker compose -f docker-compose.prod.yml logs -f backend` |
| Frontend logs | `docker compose -f docker-compose.prod.yml logs -f frontend` |
| Nginx logs | `docker compose -f docker-compose.prod.yml logs -f nginx` |
| Shell into backend | `docker compose -f docker-compose.prod.yml exec backend bash` |
| Shell into db | `docker compose -f docker-compose.prod.yml exec db psql -U syncmind syncmind_prod` |
| Stop all | `docker compose -f docker-compose.prod.yml down` |
| Stop + remove volumes | `docker compose -f docker-compose.prod.yml down -v` |

---

## Notes

- HTTP only — suitable for development/testing.
- If the EC2 instance is stopped and restarted, the public IP changes. Attach an **Elastic IP** to keep it fixed.
- Google OAuth may reject `http://` redirect URIs in production mode. Use IP-only for internal testing.
