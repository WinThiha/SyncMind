<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Both seeders are idempotent and can also be run individually:
        //   php artisan db:seed --class=AITestEnvironmentSeeder
        //   php artisan db:seed --class=DemoSeeder
        $this->call([
            AITestEnvironmentSeeder::class,
            DemoSeeder::class,
        ]);
    }
}
