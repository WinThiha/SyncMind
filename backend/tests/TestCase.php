<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use RuntimeException;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->assertSafeTestingEnvironment();
        // Disable CSRF for tests to avoid 419 errors
        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
    }

    private function assertSafeTestingEnvironment(): void
    {
        $appEnv = (string) config('app.env');
        $defaultConnection = (string) config('database.default');
        $databaseName = (string) config("database.connections.{$defaultConnection}.database");
        $configCached = app()->configurationIsCached();
        $isTestDbName = str_ends_with($databaseName, '_test') || str_contains($databaseName, 'test');

        if (! $configCached && $appEnv === 'testing' && $isTestDbName) {
            return;
        }

        throw new RuntimeException(sprintf(
            "Unsafe Laravel test environment detected.\n".
            "- config_cached: %s\n".
            "- app_env: %s\n".
            "- db_connection: %s\n".
            "- db_database: %s\n\n".
            "Refusing to run tests to protect local data.\n".
            "Recovery steps:\n".
            "1) php artisan config:clear\n".
            "2) Ensure phpunit.xml/.env.testing points to a test database\n".
            "3) Re-run php artisan test\n",
            $configCached ? 'true' : 'false',
            $appEnv,
            $defaultConnection,
            $databaseName !== '' ? $databaseName : '(empty)'
        ));
    }
}
