<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Laravel\Sanctum\PersonalAccessToken;

class UserSettingsController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user()->loadMissing('socialAccounts');
        $settings = is_array($user->settings) ? $user->settings : [];

        $preferences = $settings['preferences'] ?? [];
        $notifications = $settings['notifications'] ?? [];

        return response()->json([
            'data' => [
                'profile' => [
                    'name' => $user->name,
                    'email' => $user->email,
                ],
                'verification' => [
                    'email_verified' => $user->hasVerifiedEmail(),
                ],
                'security' => [
                    'has_password_credential' => !empty($user->password),
                    'has_social_login' => $user->socialAccounts->isNotEmpty(),
                ],
                'preferences' => [
                    'theme' => $preferences['theme'] ?? null,
                    'sidebar_collapsed_default' => $preferences['sidebar_collapsed_default'] ?? false,
                ],
                'notifications' => [
                    'email_mentions' => $notifications['email_mentions'] ?? true,
                    'email_issue_assigned' => $notifications['email_issue_assigned'] ?? true,
                    'email_comment_replies' => $notifications['email_comment_replies'] ?? true,
                    'in_app_mentions' => $notifications['in_app_mentions'] ?? true,
                    'in_app_issue_assigned' => $notifications['in_app_issue_assigned'] ?? true,
                    'in_app_comment_replies' => $notifications['in_app_comment_replies'] ?? true,
                ],
            ],
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'profile' => ['sometimes', 'array'],
            'profile.name' => ['sometimes', 'string', 'min:2', 'max:255'],
            'preferences' => ['sometimes', 'array'],
            'preferences.theme' => ['sometimes', 'in:light,dark,system'],
            'preferences.sidebar_collapsed_default' => ['sometimes', 'boolean'],
            'notifications' => ['sometimes', 'array'],
            'notifications.email_mentions' => ['sometimes', 'boolean'],
            'notifications.email_issue_assigned' => ['sometimes', 'boolean'],
            'notifications.email_comment_replies' => ['sometimes', 'boolean'],
            'notifications.in_app_mentions' => ['sometimes', 'boolean'],
            'notifications.in_app_issue_assigned' => ['sometimes', 'boolean'],
            'notifications.in_app_comment_replies' => ['sometimes', 'boolean'],
        ]);

        $user = $request->user();

        if (isset($validated['profile']['name'])) {
            $user->name = $validated['profile']['name'];
        }

        $settings = is_array($user->settings) ? $user->settings : [];

        if (isset($validated['preferences'])) {
            $settings['preferences'] = array_merge($settings['preferences'] ?? [], $validated['preferences']);
        }

        if (isset($validated['notifications'])) {
            $settings['notifications'] = array_merge($settings['notifications'] ?? [], $validated['notifications']);
        }

        $user->settings = $settings;
        $user->save();

        return $this->show($request);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string', 'current_password'],
            'new_password' => ['required', 'string', 'different:current_password', 'confirmed', Password::defaults()],
        ]);

        $user = $request->user();
        $currentAccessToken = $user?->currentAccessToken();

        if ($request->hasSession()) {
            Auth::guard('web')->logoutOtherDevices($validated['current_password']);
        }

        $user->password = Hash::make($validated['new_password']);
        $user->save();

        // Keep the active session/token, revoke all others.
        if ($currentAccessToken instanceof PersonalAccessToken) {
            $user->tokens()->whereKeyNot($currentAccessToken->id)->delete();
        } else {
            $user->tokens()->delete();
        }

        return response()->json([
            'message' => 'Password updated.',
        ]);
    }
}
