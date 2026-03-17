<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\SocialAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
        try {
            $socialUser = Socialite::driver('google')->stateless()->user();
        } catch (\Exception $e) {
            return response()->json(['message' => 'Google authentication failed.'], 401);
        }

        $user = User::where('email', $socialUser->getEmail())->first();

        if (! $user) {
            // User not found by email - need registration with a password
            return response()->json([
                'message' => 'User not found. Please register.',
                'social_user' => [
                    'email' => $socialUser->getEmail(),
                    'name' => $socialUser->getName(),
                    'provider_id' => $socialUser->getId(),
                    'provider_name' => 'google',
                ]
            ], 404);
        }

        // Link the social account if not already linked
        $socialAccount = SocialAccount::firstOrCreate(
            [
                'provider_name' => 'google',
                'provider_id' => $socialUser->getId(),
            ],
            [
                'user_id' => $user->id,
                'provider_email' => $socialUser->getEmail(),
            ]
        );

        // Log the user in
        Auth::login($user, true);
        $request->session()->regenerate();

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
        ]);
    }
}
