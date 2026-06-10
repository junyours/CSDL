<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ResetPasswordController extends Controller
{
    public function showResetForm(Request $request, $token)
    {
        $email = $request->email;

        $record = DB::table('password_reset_tokens')
            ->where('email', $email)
            ->first();

        $tokenValid = false;

        if ($record) {

            $expireMinutes = config('auth.passwords.users.expire');

            $notExpired = Carbon::parse($record->created_at)
                ->addMinutes($expireMinutes)
                ->isFuture();

            $tokenMatches = Hash::check($token, $record->token);

            $tokenValid = $notExpired && $tokenMatches;
        }

        return Inertia::render('Auth/ResetPassword', [
            'token' => $token,
            'email' => $email,
            'tokenValid' => $tokenValid,
        ]);
    }

    public function reset(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();
            }
        );

        return $status === Password::PASSWORD_RESET
            ? response()->json(['message' => __($status)])
            : response()->json([
                'errors' => ['email' => [__($status)]]
            ], 422);
    }
}
