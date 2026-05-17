#!/bin/sh
set -e

PUID=${PUID:-1000}
PGID=${PGID:-1000}

if [ "$(id -u)" = "0" ]; then
    echo "==> Fixing ownership of writable directories..."
    mkdir -p /app/.next /app/node_modules/.cache
    chown -R "${PUID}:${PGID}" /app/.next /app/node_modules

    echo "==> Checking for dependency changes..."
    HASH_FILE="/app/node_modules/.package-hash"
    CURRENT_HASH=$(cat /app/package.json /app/package-lock.json | sha256sum | awk '{print $1}')

    if [ ! -f "$HASH_FILE" ] || [ "$CURRENT_HASH" != "$(cat "$HASH_FILE")" ]; then
        echo "==> Dependencies changed. Running npm install..."
        su-exec "${PUID}:${PGID}" npm install
        cat /app/package.json /app/package-lock.json | sha256sum | awk '{print $1}' > "$HASH_FILE"
        echo "==> npm install complete."
    else
        echo "==> Dependencies up to date."
    fi

    echo "==> Dropping privileges to ${PUID}:${PGID}..."
    exec su-exec "${PUID}:${PGID}" "$@"
fi

echo "==> Running as non-root user ($(id -u))"
exec "$@"