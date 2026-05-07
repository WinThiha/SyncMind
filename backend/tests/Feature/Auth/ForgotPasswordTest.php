<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class ForgotPasswordTest extends TestCase
{
    use RefreshDatabase;

    public function test_reset_link_sent_for_registered_email()
    {
        Notification::fake();
        $user = User::factory()->create();

        $response = $this->postJson('/api/auth/forgot-password', [
            'email' => $user->email,
        ]);

        $response->assertStatus(200);
        Notification::assertSentTo($user, ResetPassword::class);
    }

    public function test_returns_200_for_unknown_email_without_revealing_existence()
    {
        Notification::fake();

        $response = $this->postJson('/api/auth/forgot-password', [
            'email' => 'nobody@example.com',
        ]);

        // Must not return 404 or 422 — prevents user enumeration
        $response->assertStatus(200);
        Notification::assertNothingSent();
    }

    public function test_email_field_is_required()
    {
        $response = $this->postJson('/api/auth/forgot-password', []);

        $response->assertStatus(422)->assertJsonValidationErrors(['email']);
    }

    public function test_password_reset_succeeds_with_valid_token()
    {
        $user = User::factory()->create();
        $token = Password::createToken($user);

        $response = $this->postJson('/api/auth/reset-password', [
            'token' => $token,
            'email' => $user->email,
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);

        $response->assertStatus(200)->assertJsonFragment(['message' => 'Password has been reset successfully.']);
        $this->assertDatabaseMissing('password_reset_tokens', ['email' => $user->email]);
    }

    public function test_password_reset_fails_with_invalid_token()
    {
        $user = User::factory()->create();

        $response = $this->postJson('/api/auth/reset-password', [
            'token' => 'badtoken',
            'email' => $user->email,
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);

        $response->assertStatus(422);
    }

    public function test_password_reset_requires_password_confirmation()
    {
        $user = User::factory()->create();
        $token = Password::createToken($user);

        $response = $this->postJson('/api/auth/reset-password', [
            'token' => $token,
            'email' => $user->email,
            'password' => 'NewPassword123!',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['password']);
    }

    public function test_password_reset_enforces_password_strength()
    {
        $user = User::factory()->create();
        $token = Password::createToken($user);

        $response = $this->postJson('/api/auth/reset-password', [
            'token' => $token,
            'email' => $user->email,
            'password' => '123',
            'password_confirmation' => '123',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['password']);
    }
}
