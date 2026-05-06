<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\SocialAccount;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class RegisterController extends Controller
{
    /**
     * Handle an incoming registration request.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // If this is a social registration completion
        if ($request->has('social_id') && $request->has('social_provider')) {
            SocialAccount::create([
                'user_id' => $user->id,
                'provider_name' => $request->social_provider,
                'provider_id' => $request->social_id,
                'provider_email' => $user->email,
            ]);

            // Social registration automatically verifies the email
            $user->markEmailAsVerified();
        }

        Auth::login($user);

        event(new Registered($user));

        return response()->json([
            'message' => 'User registered successfully.',
            'user' => $user,
        ], 201);
    }
}
