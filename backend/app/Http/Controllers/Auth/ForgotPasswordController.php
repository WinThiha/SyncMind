<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;

class ForgotPasswordController extends Controller
{
    public function sendLink(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        // Always send the same response to prevent email enumeration.
        Password::sendResetLink($request->only('email'));

        return response()->json([
            'message' => 'If that email address is registered, you will receive a password reset link shortly.',
        ]);
    }
}
