# Quickstart: User Authentication and Social Login

## Prerequisites & Environment Setup

This project uses **Scoop** (Windows) for PHP and **nvs** for Node.js. 

### 1. PHP Setup (Scoop)
Ensure Scoop is installed, then install PHP and Composer:
```powershell
scoop install php
scoop install composer
```

### 2. Node.js Setup (nvs)
Ensure `nvs` is installed:
```powershell
nvs add lts
nvs use lts
```

### 3. Package Mirrors (Asia)
If you experience slow installations, configure mirrors:

**NPM:**
```bash
npm config set registry https://registry.npmmirror.com/
```

**Composer:**
```bash
composer config -g repo.packagist composer https://packagist.jp
```

## Backend (Laravel 12) Setup
1. Navigate to the `backend` directory.
2. Install dependencies: `composer install`
3. Copy `.env.example` to `.env`.
4. Configure PostgreSQL database credentials in `.env`.
5. Configure Google Socialite credentials in `.env`:
   ```env
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```
6. Set frontend URL for Sanctum in `.env`:
   ```env
   SANCTUM_STATEFUL_DOMAINS=localhost:3000
   SESSION_DOMAIN=localhost
   ```
7. Run migrations: `php artisan migrate`
8. Serve the API: `php artisan serve`

## Frontend (Next.js 16) Setup
1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install`
3. Copy `.env.local.example` to `.env.local`.
4. Configure environment variables:
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id
   ```
5. Run development server: `npm run dev`

The application will be available at `http://localhost:3000`.