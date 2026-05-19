<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        // Not logged in
        if (!Auth::check()) {
            return Inertia::render('WelcomePage');
        }

        $user = Auth::user();

        return match ($user->user_role) {
            'super_admin' => redirect()->route('superadmin.dashboard'),

            'admin' => redirect()->route('admin.dashboard'),

            'security' => redirect()->route('security.dashboard'),

            'student' => redirect()->route('student.dashboard'),

            'guidance_counselor' => redirect()->route('guidancecounselor.dashboard'),

            default => Inertia::render('WelcomePage'),
        };
    }
}