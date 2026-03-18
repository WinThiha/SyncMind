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

### 3. SSL Certificate Setup (Windows/PHP)
To make secure requests to Google's APIs, you must configure a CA certificate bundle in PHP:
1. Download `cacert.pem` from [curl.se/ca/cacert.pem](https://curl.se/ca/cacert.pem) and save it to your PHP directory (e.g., `C:\Users\<User>\scoop\apps\php82\current\cacert.pem`).
2. Edit your `php.ini` file:
   - Uncomment and set `curl.cainfo = "C:\path\to\cacert.pem"`
   - Uncomment and set `openssl.cafile = "C:\path\to\cacert.pem"`
   - Ensure `extension=pdo_pgsql` is uncommented.
3. Restart your development server.

## Google OAuth Setup
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project and configure the **OAuth consent screen**.
3. Create **OAuth 2.0 Client IDs**:
   - Application type: Web application
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:8000/api/auth/google/callback`
4. Copy the **Client ID** and **Client Secret**.

## Backend (Laravel 12) Setup
1. Navigate to the `backend` directory.
2. Install dependencies: `composer install`
3. Copy `.env.example` to `.env`.
4. Configure PostgreSQL database credentials in `.env`.
5. Configure Google Socialite credentials in `.env`:
   ```env
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_REDIRECT_URI="${APP_URL}/api/auth/google/callback"
   ```
6. Set frontend URL for Sanctum and CORS in `.env`:
   ```env
   FRONTEND_URL=http://localhost:3000
   SANCTUM_STATEFUL_DOMAINS=localhost,localhost:3000,127.0.0.1:3000
   SESSION_DOMAIN=localhost
   ```
7. Run migrations: `php artisan migrate`
8. Serve the API: `php artisan serve`

## Frontend (Next.js 16) Setup
1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install`
3. Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
   ```
4. Run development server: `npm run dev`

The application will be available at `http://localhost:3000`.
