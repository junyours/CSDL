<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LoginController extends Controller
{
    public function show()
    {
        // If user is already logged in, redirect them based on their role
        if (Auth::check()) {
            return $this->redirectBasedOnRole();
        }

        return Inertia::render('Auth/Login');
    }

    public function login(Request $request)
    {
        $request->validate([
            'user_id_no' => 'required',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('user_id_no', 'password'), true)) {
            return back()->withErrors([
                'error' => 'Invalid login credentials.',
            ]);
        }

        $request->session()->regenerate();

        // Redirect the user based on their role after successful login
        return $this->redirectBasedOnRole();
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/login');
    }

    /**
     * Redirect the user to the appropriate route based on their role.
     */
    private function redirectBasedOnRole()
    {
        return match (auth()->user()->user_role) {
            'admin' => Inertia::location(route('admin.dashboard')),
            'security' => Inertia::location(route('security.dashboard')),
            'student' => Inertia::location(route('student.dashboard')),
            default => Inertia::location('/'), // Redirect to home or other fallback route
        };
    }
}
