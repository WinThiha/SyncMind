<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_requests_are_rejected(): void
    {
        $response = $this->getJson('/api/user/settings');

        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_read_settings(): void
    {
        $user = User::factory()->create([
            'settings' => [
                'preferences' => [
                    'theme' => 'dark',
                    'sidebar_collapsed_default' => true,
                ],
                'notifications' => [
                    'email_mentions' => false,
                ],
            ],
        ]);

        $response = $this->actingAs($user, 'web')->getJson('/api/user/settings');

        $response->assertOk()
            ->assertJsonPath('data.profile.name', $user->name)
            ->assertJsonPath('data.preferences.theme', 'dark')
            ->assertJsonPath('data.preferences.sidebar_collapsed_default', true)
            ->assertJsonPath('data.notifications.email_mentions', false);
    }

    public function test_authenticated_user_without_saved_theme_returns_null_theme(): void
    {
        $user = User::factory()->create([
            'settings' => [],
        ]);

        $response = $this->actingAs($user, 'web')->getJson('/api/user/settings');

        $response->assertOk()
            ->assertJsonPath('data.preferences.theme', null)
            ->assertJsonPath('data.preferences.sidebar_collapsed_default', false);
    }

    public function test_user_can_update_settings_and_profile_name(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'web')->putJson('/api/user/settings', [
            'profile' => [
                'name' => 'Updated Name',
            ],
            'preferences' => [
                'theme' => 'dark',
                'sidebar_collapsed_default' => true,
            ],
            'notifications' => [
                'email_mentions' => false,
                'in_app_mentions' => false,
            ],
        ]);

        $response->assertOk()
            ->assertJsonPath('data.profile.name', 'Updated Name')
            ->assertJsonPath('data.preferences.theme', 'dark')
            ->assertJsonPath('data.preferences.sidebar_collapsed_default', true)
            ->assertJsonPath('data.notifications.email_mentions', false)
            ->assertJsonPath('data.notifications.in_app_mentions', false);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Name',
        ]);
    }

    public function test_user_can_save_system_theme_preference(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'web')->putJson('/api/user/settings', [
            'preferences' => [
                'theme' => 'system',
            ],
        ]);

        $response->assertOk()
            ->assertJsonPath('data.preferences.theme', 'system');
    }

    public function test_update_returns_validation_errors_for_invalid_profile_name(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'web')->putJson('/api/user/settings', [
            'profile' => [
                'name' => 'A',
            ],
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['profile.name']);
    }

    public function test_user_can_update_password_from_dedicated_endpoint(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('old-password'),
        ]);

        $response = $this->actingAs($user, 'web')->putJson('/api/user/settings/password', [
            'current_password' => 'old-password',
            'new_password' => 'new-password-123',
            'new_password_confirmation' => 'new-password-123',
        ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Password updated.');

        $this->assertTrue(Hash::check('new-password-123', $user->fresh()->password));
        $this->assertAuthenticatedAs($user->fresh(), 'web');
    }

    public function test_password_update_rejects_invalid_current_password(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('old-password'),
        ]);

        $response = $this->actingAs($user, 'web')->putJson('/api/user/settings/password', [
            'current_password' => 'wrong-password',
            'new_password' => 'new-password-123',
            'new_password_confirmation' => 'new-password-123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['current_password']);
    }

    public function test_password_update_requires_confirmation(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('old-password'),
        ]);

        $response = $this->actingAs($user, 'web')->putJson('/api/user/settings/password', [
            'current_password' => 'old-password',
            'new_password' => 'new-password-123',
            'new_password_confirmation' => 'mismatch',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['new_password']);
    }

    public function test_password_update_endpoint_is_rate_limited(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('old-password'),
        ]);

        foreach (range(1, 5) as $attempt) {
            $this->actingAs($user, 'web')->putJson('/api/user/settings/password', [
                'current_password' => 'wrong-password',
                'new_password' => 'new-password-123',
                'new_password_confirmation' => 'new-password-123',
            ])->assertStatus(422);
        }

        $this->actingAs($user, 'web')->putJson('/api/user/settings/password', [
            'current_password' => 'wrong-password',
            'new_password' => 'new-password-123',
            'new_password_confirmation' => 'new-password-123',
        ])->assertStatus(429);
    }

    public function test_password_update_revokes_other_api_tokens_but_keeps_current_token(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('old-password'),
        ]);

        $currentToken = $user->createToken('current-device');
        $otherToken = $user->createToken('other-device');
        $currentTokenId = (int) explode('|', $currentToken->plainTextToken)[0];
        $otherTokenId = (int) explode('|', $otherToken->plainTextToken)[0];

        $response = $this->withHeader('Authorization', 'Bearer '.$currentToken->plainTextToken)
            ->putJson('/api/user/settings/password', [
                'current_password' => 'old-password',
                'new_password' => 'new-password-123',
                'new_password_confirmation' => 'new-password-123',
            ]);

        $response->assertOk();

        $this->assertDatabaseHas('personal_access_tokens', ['id' => $currentTokenId]);
        $this->assertDatabaseMissing('personal_access_tokens', ['id' => $otherTokenId]);
    }
}
