<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\SisApiService;
use Carbon\Carbon;
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
        return redirect('/');
    }

    public function login(Request $request, SisApiService $sisApi)
    {
        $validated = $request->validate([
            'user_id_no' => 'required|string',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($validated, true)) {
            return response()->json([
                'errors' => [
                    'user_id_no' => ['Invalid login credentials.']
                ]
            ], 422);
        }

        $request->session()->regenerate();

        $user = auth()->user();

        if ($user->user_role === 'student') {

            $students = $this->fetchStudentData($user->user_id_no, $sisApi);

            if ($students->isEmpty()) {
                Auth::logout();

                return response()->json([
                    'errors' => [
                        'user_id_no' => ['Student record not found.']
                    ]
                ], 422);
            }

            $student = $students->first();

            $enrolledCurrent = collect($student['enrolled_students'] ?? [])
                ->contains(function ($enroll) {
                    return data_get($enroll, 'year_section.school_year.is_current') == 1;
                });

            if (!$enrolledCurrent) {
                Auth::logout();

                return response()->json([
                    'errors' => [
                        'user_id_no' => ['You are not enrolled in the current school year.']
                    ]
                ], 403);
            }
        }

        $redirect = match ($user->user_role) {
            'guidance_counselor' => route('guidancecounselor.dashboard'),
            'admin' => route('admin.dashboard'),
            'security' => route('security.dashboard'),
            'student' => route('student.dashboard'),
            default => '/',
        };

        return response()->json([
            'message' => 'Login successful',
            'redirect' => $redirect
        ]);
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/');
    }

    /**
     * Redirect the user to the appropriate route based on their role.
     */
    private function redirectBasedOnRole()
    {
        return match (auth()->user()->user_role) {
            'super_admin' => Inertia::location(route('superadmin.dashboard')),
            'admin' => Inertia::location(route('admin.dashboard')),
            'security' => Inertia::location(route('security.dashboard')),
            'student' => Inertia::location(route('student.dashboard')),
            default => Inertia::location('/'), // Redirect to home or other fallback route
        };
    }

    public function registerShowForm()
    {
        if (Auth::check()) {
            return $this->redirectBasedOnRole();
        }

        return Inertia::render('Auth/Register');
    }


    public function register(Request $request, SisApiService $sisApi)
    {
        $validated = $request->validate([
            'user_id_no' => 'required|string',
            'last_name' => 'required|string',
            'birthdate' => ['required', 'date', 'before_or_equal:today'],
            'email' => 'required|email',
            'password' => 'required|string|min:8',
        ]);

        $students = $this->fetchStudentData($request->user_id_no, $sisApi);

        if ($students->isEmpty()) {
            return response()->json([
                'errors' => [
                    'user_id_no' => ['ID number not found in the system.']
                ]
            ], 422);
        }

        $student = $students->first();

        $inputLastName = strtoupper(trim($request->last_name));
        $apiLastName = strtoupper(trim($student['last_name'] ?? ''));

        $inputEmail = strtolower(trim($request->email));
        $apiEmail = strtolower(trim($student['email_address'] ?? ''));

        try {
            $inputBirthdate = Carbon::parse($request->birthdate)->format('Y-m-d');
            $apiBirthdate = isset($student['birthday'])
                ? Carbon::parse($student['birthday'])->format('Y-m-d')
                : null;
        } catch (\Exception $e) {
            return response()->json([
                'errors' => [
                    'birthdate' => ['Invalid birthdate format.']
                ]
            ], 422);
        }

        if ($inputLastName !== $apiLastName) {
            return response()->json([
                'errors' => [
                    'last_name' => ['Last name does not match our records.']
                ]
            ], 422);
        }

        if (!$apiBirthdate || $inputBirthdate !== $apiBirthdate) {
            return response()->json([
                'errors' => [
                    'birthdate' => ['Birthdate does not match our records.']
                ]
            ], 422);
        }

        if ($inputEmail !== $apiEmail) {
            return response()->json([
                'errors' => [
                    'email' => ['Email does not match our records.']
                ]
            ], 422);
        }

        $enrolledCurrent = collect($student['enrolled_students'] ?? [])
            ->contains(function ($enroll) {
                return ($enroll['year_section']['school_year']['is_current'] ?? 0) == 1;
            });

        if (!$enrolledCurrent) {
            return response()->json([
                'errors' => [
                    'user_id_no' => ['Student is not enrolled in the current school year.']
                ]
            ], 422);
        }

        try {
            $user = User::create([
                'user_id_no' => $student['user_id_no'],
                'user_role' => 'student',
                'password' => Hash::make($request->password),
                'email' => $request->email,
                'profile_photo' => null,
                'face_enrolled' => 0,
            ]);
        } catch (QueryException $e) {

            if ($e->getCode() === '23000') {
                return response()->json([
                    'errors' => [
                        'user_id_no' => ['This ID Number is already registered.']
                    ]
                ], 422);
            }

            return response()->json([
                'errors' => [
                    'user_id_no' => ['Something went wrong. Please try again.']
                ]
            ], 422);
        }

        auth()->login($user);

        return response()->json([
            'message' => 'Registration successful',
            'redirect' => route('student.dashboard')
        ]);
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
