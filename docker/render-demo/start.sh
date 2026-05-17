#!/bin/bash
set -e

export PORT="${PORT:-10000}"

envsubst '${PORT}' < /etc/nginx/templates/syncmind.conf.template > /etc/nginx/conf.d/default.conf

chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

if [ -z "$APP_KEY" ] || [ "$APP_KEY" = "base64:" ]; then
    php artisan key:generate --force
fi

php artisan config:clear
php artisan cache:clear
php artisan migrate --force

exec supervisord -c /etc/supervisor/supervisord.conf
