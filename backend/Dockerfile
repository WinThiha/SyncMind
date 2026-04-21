FROM php:8.2-cli

RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpq-dev \
    libsqlite3-dev \
    libzip-dev \
    zip \
    unzip \
    gosu \
    && docker-php-ext-install pdo pdo_pgsql pgsql pdo_sqlite zip bcmath \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Install PHP dependencies first (layer cache)
COPY composer.json composer.lock ./
RUN composer install --no-interaction --prefer-dist --optimize-autoloader --no-scripts

# Copy source
COPY . .

# Run post-install scripts
RUN composer run-script post-autoload-dump 2>/dev/null || true

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
