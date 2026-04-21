#!/bin/sh
set -e

PUID=${PUID:-1000}
PGID=${PGID:-1000}

if [ "$(id -u)" = "0" ]; then
    echo "==> Fixing ownership of writable directories..."
    chown -R "${PUID}:${PGID}" /app/.next /app/node_modules/.cache 2>/dev/null || true
    mkdir -p /app/.next /app/node_modules/.cache
    chown "${PUID}:${PGID}" /app/.next /app/node_modules/.cache

    echo "==> Dropping privileges to ${PUID}:${PGID}..."
    exec su-exec "${PUID}:${PGID}" "$@"
fi

echo "==> Running as non-root user ($(id -u))"
exec "$@"