<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;
use App\Models\User;
use App\Services\SisApiService;

class ForgotPasswordController extends Controller
{
    public function showLinkRequestForm()
    {
        return Inertia::render('Auth/ForgotPassword');
    }

    public function getEmail(Request $request, SisApiService $sisApi)
    {
        $request->validate([
            'user_id_no' => 'required|string',
        ]);

        try {
            // 1. Local user check
            $user = User::where('user_id_no', $request->user_id_no)->first();

            if (!$user) {
                return response()->json([
                    'errors' => ['user_id_no' => ['User not found.']]
                ], 422);
            }

            // 2. SIS API call
            $students = $this->fetchStudentData($request->user_id_no, $sisApi);

            if ($students->isEmpty()) {
                return response()->json([
                    'errors' => ['user_id_no' => ['ID number not found in SIS records.']]
                ], 422);
            }

            $student = $students->first();

            // 3. Extract SIS email safely
            $apiEmail = strtolower(trim($student['email_address'] ?? ''));

            if (empty($apiEmail)) {
                return response()->json([
                    'errors' => ['email' => ['No email found in SIS records.']]
                ], 422);
            }

            $user->email = $apiEmail;
            $user->save();

            return response()->json([
                'user_id_no' => $request->user_id_no,
                'email' => $apiEmail,
            ]);

        } catch (\Exception $e) {
            \Log::error('Forgot Password Error: ' . $e->getMessage());

            return response()->json([
                'message' => 'Internal server error',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Step 2: send reset link
    public function sendResetLink(Request $request)
    {
        $request->validate([
            'user_id_no' => 'required|string',
        ]);

        // Find user locally
        $user = User::where('user_id_no', $request->user_id_no)->first();

        if (!$user) {
            return response()->json([
                'errors' => ['user_id_no' => ['User not found.']]
            ], 422);
        }

        // Make sure user has email
        if (empty($user->email)) {
            return response()->json([
                'errors' => ['email' => ['No email found for this user.']]
            ], 422);
        }

        // Send reset link directly
        $status = Password::sendResetLink([
            'email' => $user->email
        ]);

        return $status === Password::RESET_LINK_SENT
            ? response()->json([
                'message' => __($status),
                'email' => $user->email
            ])
            : response()->json([
                'errors' => ['email' => [__($status)]]
            ], 422);
    }

    private function fetchStudentData($userIdNo, SisApiService $sisApi)
    {
        try {
            $query = http_build_query(['user_id_no' => [$userIdNo]]);

            $response = $sisApi->get("/api/student-enrollment?{$query}");

            if (!$response->ok()) {
                return collect();
            }

            $json = $response->json();

            // FIX: handle both possible structures
            $data = $json['data'] ?? $json ?? [];

            return collect($data);

        } catch (\Exception $e) {
            \Log::error('SIS API Error: ' . $e->getMessage());
            return collect();
        }
    }
}
