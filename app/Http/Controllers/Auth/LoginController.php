<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\SisApiService;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
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

    public function registerShowForm()
    {
        // If user is already logged in, redirect them based on their role
        if (Auth::check()) {
            return $this->redirectBasedOnRole();
        }

        return Inertia::render('Auth/Register');
    }


    public function register(Request $request, SisApiService $sisApi)
    {
        $request->validate([
            'user_id_no' => 'required|string',
            'last_name' => 'required|string',
            'birthdate' => [
                'required',
                'date_format:Y-m-d',
                'before_or_equal:today'
            ],
            'email' => 'required|email',
            'password' => 'required|string|min:8',
        ]);

        // Fetch student data from SIS API
        $students = $this->fetchStudentData($request->user_id_no, $sisApi);

        if ($students->isEmpty()) {
            throw ValidationException::withMessages([
                'user_id_no' => 'Student not found in the system.'
            ]);
        }

        // Match student with form data and check for current school year
        $matchedStudent = $students->first(function ($student) use ($request) {
            $enrolledCurrent = collect($student['enrolled_students'] ?? [])
                ->contains(fn($enroll) => ($enroll['year_section']['school_year']['is_current'] ?? 0) == 1);

            return $student['last_name'] === strtoupper($request->last_name)
                && $student['birthday'] === $request->birthdate
                && $enrolledCurrent;
        });

        if (!$matchedStudent) {
            return back()->withErrors(['user_id_no' => 'No matching current enrollment found for this student.'])->withInput();
        }

        try {
            // Create the user in the database
            $user = User::create([
                'user_id_no' => $matchedStudent['user_id_no'],
                'user_role' => 'student',
                'password' => Hash::make($request->password),
                'email' => $request->email,
                'profile_photo' => null,
                'face_enrolled' => 0,
            ]);
        } catch (QueryException $e) {
            // Handle duplicate user_id_no
            if ($e->getCode() === '23000') { // Unique constraint violation
                return back()->withErrors(['user_id_no' => 'This ID Number is already registered.'])->withInput();
            }

            // Other DB exceptions
            return back()->withErrors(['error' => 'Something went wrong. Please try again.'])->withInput();
        }

        // Log the user in after registration
        auth()->login($user);

        return redirect()->route('student.dashboard')->with('success', 'Registration successful!');
    }


    private function fetchStudentData($userIdNo, SisApiService $sisApi)
    {
        $query = http_build_query(['user_id_no' => [$userIdNo]]);

        $response = $sisApi->get("/api/student-enrollment?{$query}");

        if (!$response->ok()) {
            return collect();
        }

        return collect($response->json());
    }

}
