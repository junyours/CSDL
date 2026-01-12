<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, $role)
    {
        // If user is not logged in, redirect to login
        if (!auth()->check()) {
            return redirect()->route('login');
        }

        // If user role does not match
        if (auth()->user()->user_role !== $role) {
            return back()->with('error', 'You are not authorized to access this page.');
        }

        return $next($request);
    }
}
