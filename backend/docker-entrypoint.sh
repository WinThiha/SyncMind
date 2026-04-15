#!/bin/bash
set -e

echo "==> Fixing storage permissions..."
if [ "$(id -u)" = "0" ]; then
    chmod -R 775 storage bootstrap/cache
    chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || true
else
    echo "    (running as non-root, skipping chown/chmod)"
fi

echo "==> Generating APP_KEY if missing..."
if [ -z "$APP_KEY" ] || [ "$APP_KEY" = "base64:" ]; then
    php artisan key:generate --force
    echo "    APP_KEY generated."
else
    echo "    APP_KEY already set."
fi

echo "==> Running database migrations..."
php artisan migrate --force

echo "==> Clearing config/cache..."
php artisan config:clear
php artisan cache:clear

echo "==> Starting Laravel server..."
exec "$@"
