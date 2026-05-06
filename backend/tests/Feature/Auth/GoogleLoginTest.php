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

    public function test_google_callback_logs_in_existing_user_with_code(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);

        $abstractUser = new SocialiteUser;
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
        $response->assertJsonPath('user.email', $user->email);
        $response->assertJsonPath('token', null);
        $this->assertAuthenticatedAs($user);
    }

    public function test_google_callback_logs_in_existing_user_with_token(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);

        $abstractUser = new SocialiteUser;
        $abstractUser->id = '12345';
        $abstractUser->email = 'test@example.com';
        $abstractUser->name = 'Google User';

        Socialite::shouldReceive('driver->userFromToken')->with('fake-token')->andReturn($abstractUser);

        $response = $this->postJson('/api/auth/google/callback', [
            'token' => 'fake-token',
        ], [
            'Referer' => 'http://localhost',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('user.email', $user->email);
        $response->assertJsonPath('token', null);
        $this->assertAuthenticatedAs($user);
    }

    public function test_google_callback_returns_error_if_user_not_found(): void
    {
        $abstractUser = new SocialiteUser;
        $abstractUser->id = '12345';
        $abstractUser->email = 'new@example.com';
        $abstractUser->name = 'New User';

        Socialite::shouldReceive('driver->userFromToken')->andReturn($abstractUser);

        $response = $this->postJson('/api/auth/google/callback', [
            'token' => 'fake-token',
        ], [
            'Referer' => 'http://localhost',
        ]);

        $response->assertStatus(404)
            ->assertJson([
                'message' => 'User not found. Please register.',
            ]);
    }
}
