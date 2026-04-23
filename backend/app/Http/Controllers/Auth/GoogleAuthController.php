<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\SocialAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    /**
     * Handle the callback from Google.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function callback(Request $request)
    {
        $socialUser = null;
        $errorDetails = null;

        try {
            if ($request->has('token')) {
                try {
                    $socialUser = Socialite::driver('google')->userFromToken($request->token);
                } catch (\Exception $e) {
                    $response = Http::get("https://www.googleapis.com/oauth2/v3/userinfo", [
                        'access_token' => $request->token
                    ]);

                    if ($response->successful()) {
                        $data = $response->json();
                        $socialUser = new \stdClass();
                        $socialUser->token = $request->token;
                        $socialUser->id = $data['sub'] ?? null;
                        $socialUser->email = $data['email'] ?? null;
                        $socialUser->name = $data['name'] ?? null;
                        
                        $socialUser->getEmail = fn() => $data['email'] ?? null;
                        $socialUser->getName = fn() => $data['name'] ?? null;
                        $socialUser->getId = fn() => $data['sub'] ?? null;
                    } else {
                        $errorDetails = 'Google API verification failed: ' . $response->body();
                    }
                }
            } else {
                $socialUser = Socialite::driver('google')->stateless()->user();
            }
        } catch (\Exception $e) {
            $errorDetails = $e->getMessage();
        }

        if (!$socialUser || (is_object($socialUser) && method_exists($socialUser, 'getEmail') && !$socialUser->getEmail())) {
            return response()->json([
                'message' => 'Google authentication failed.',
                'error' => $errorDetails ?: 'Could not retrieve user details.'
            ], 401);
        }

        $email = method_exists($socialUser, 'getEmail') ? $socialUser->getEmail() : ($socialUser->email ?? null);
        $name = method_exists($socialUser, 'getName') ? $socialUser->getName() : ($socialUser->name ?? null);
        $id = method_exists($socialUser, 'getId') ? $socialUser->getId() : ($socialUser->id ?? null);

        if (!$email) {
            return response()->json(['message' => 'Email not found in Google response.'], 401);
        }

        $user = User::where('email', $email)->first();

        if (! $user) {
            return response()->json([
                'message' => 'User not found. Please register.',
                'social_user' => [
                    'email' => $email,
                    'name' => $name,
                    'provider_id' => $id,
                    'provider_name' => 'google',
                ]
            ], 404);
        }

        // AUTO-VERIFY: If the user exists but is not verified, verify them now (FR-004)
        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        // Link/Update the social account
        SocialAccount::updateOrCreate(
            [
                'provider_name' => 'google',
                'provider_id' => $id,
            ],
            [
                'user_id' => $user->id,
                'provider_email' => $email,
            ]
        );

        Auth::login($user, true);
        
        $token = null;
        if ($request->has('device_name')) {
            $token = $user->createToken($request->device_name)->plainTextToken;
        } else {
            $request->session()->regenerate();
        }

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token,
        ]);
    }
}
