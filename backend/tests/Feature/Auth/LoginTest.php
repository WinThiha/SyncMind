<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_users_can_login_with_correct_credentials(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('password'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ], [
            'Referer' => 'http://localhost',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('user.email', $user->email);
        $response->assertJsonPath('token', null);
        $this->assertAuthenticatedAs($user);
    }

    public function test_users_cannot_login_with_incorrect_password(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('password'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ], [
            'Referer' => 'http://localhost',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);

        $this->assertGuest();
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'web')->postJson('/api/auth/logout', [], [
            'Referer' => 'http://localhost',
        ]);

        $response->assertStatus(204);
        $this->assertGuest('web');
    }

    public function test_token_auth_users_can_logout_without_breaking_session_logout(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-device');

        $response = $this->withHeader('Authorization', 'Bearer '.$token->plainTextToken)
            ->postJson('/api/auth/logout', [], [
                'Referer' => 'http://localhost',
            ]);

        $response->assertStatus(204);
        $this->assertDatabaseMissing('personal_access_tokens', [
            'id' => $token->accessToken->id,
        ]);
    }
}
