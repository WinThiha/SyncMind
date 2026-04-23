#!/bin/bash
set -e

PUID=${PUID:-1000}
PGID=${PGID:-1000}

if [ "$(id -u)" = "0" ]; then
    echo "==> Fixing ownership of writable directories..."
    chown -R "${PUID}:${PGID}" storage bootstrap/cache

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

    echo "==> Dropping privileges to ${PUID}:${PGID}..."
    exec gosu "${PUID}:${PGID}" "$@"
fi

echo "==> Running as non-root user ($(id -u))"
exec "$@"
