<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Tests\TestCase;

class GoogleLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_google_callback_logs_in_existing_user(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);

        $abstractUser = new SocialiteUser();
        $abstractUser->id = '12345';
        $abstractUser->email = 'test@example.com';
        $abstractUser->name = 'Google User';

        Socialite::shouldReceive('driver->stateless->user')->andReturn($abstractUser);

        $response = $this->postJson('/api/auth/google/callback', [
            'code' => 'fake-code',
        ], [
            'Referer' => 'http://localhost',
        ]);

        $response->assertStatus(200);
        $this->assertAuthenticatedAs($user);
        $this->assertDatabaseHas('social_accounts', [
            'user_id' => $user->id,
            'provider_name' => 'google',
            'provider_id' => '12345',
        ]);
    }

    public function test_google_callback_returns_error_if_user_not_found(): void
    {
        $abstractUser = new SocialiteUser();
        $abstractUser->id = '12345';
        $abstractUser->email = 'new@example.com';
        $abstractUser->name = 'New User';

        Socialite::shouldReceive('driver->stateless->user')->andReturn($abstractUser);

        $response = $this->postJson('/api/auth/google/callback', [
            'code' => 'fake-code',
        ], [
            'Referer' => 'http://localhost',
        ]);

        // Should return 404 or a special status to indicate registration is required
        $response->assertStatus(404)
            ->assertJson([
                'message' => 'User not found. Please register.',
                'social_user' => [
                    'email' => 'new@example.com',
                    'name' => 'New User',
                    'provider_id' => '12345',
                ]
            ]);
    }
}
