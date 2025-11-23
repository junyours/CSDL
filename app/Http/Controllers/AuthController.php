<?php
namespace App\Http\Controllers;

use App\Models\EventAttendanceModeConfig;
use App\Models\UserModerator;
use Auth;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AuthController extends Controller
{

    // WEB
    public function showLoginForm()
    {
        // If user is already logged in, redirect to dashboard
        if (auth()->check()) {
            return redirect()->route('dashboard.events');
        }

        return view('auth.login');
    }

    public function loginWeb(Request $request)
    {
        $request->validate([
            'user_id_no' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('user_id_no', $request->user_id_no)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return back()->withErrors(['user_id_no' => 'Invalid credentials'])->withInput();
        }

        if ($user->user_role !== 'admin') {
            return back()->withErrors(['user_id_no' => 'You are not authorized to login'])->withInput();
        }

        Auth::login($user); // login the user

        return redirect()->route('dashboard.events'); // redirect to dashboard
    }

    public function logoutWeb()
    {
        Auth::logout();
        return redirect()->route('login');
    }

    public function dashboard()
    {
        return view('dashboard');
    }


    //MOBILE
    public function login(Request $request)
    {
        $request->validate([
            'user_id_no' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('user_id_no', $request->user_id_no)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // Check strict mode if user is a student
        if ($user->user_role === 'student') {
            $strictMode = EventAttendanceModeConfig::latest()->first()?->is_strict_mode ?? 0;

            if ($strictMode) {
                $moderator = UserModerator::where('user_id', $user->id)
                    ->where('is_removed', false)
                    ->first();

                if (!$moderator) {
                    return response()->json([
                        'message' => 'You are not allowed to login in strict mode'
                    ], 403);
                }
            }
        }

        $token = $user->createToken('mobile-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'user_id_no' => $user->user_id_no,
                'role' => $user->user_role,
                'face_enrolled' => $user->face_enrolled,
            ]
        ]);
    }

    public function updateFaceEnrolled(Request $request)
    {
        $user = $request->user();
        $user->face_enrolled = 1;
        $user->save();

        return response()->json([
            'message' => 'Face enrollment completed',
            'user' => [
                'id' => $user->id,
                'user_id_no' => $user->user_id_no,
                'role' => $user->user_role,
                'face_enrolled' => $user->face_enrolled,
            ]
        ]);
    }

    public function updateProfilePhoto(Request $request)
    {
        try {
            $user = auth()->user();
            if (!$user) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }

            // Validate the incoming request
            $request->validate([
                'photo' => 'required|image|mimes:jpeg,png,jpg|max:2048', // Max 2MB
            ]);

            // Delete old photo if exists
            if ($user->profile_photo && Storage::disk('public')->exists($user->profile_photo)) {
                Storage::disk('public')->delete($user->profile_photo);
            }

            // Generate unique filename: user_id_no_timestamp_random.extension
            $extension = $request->file('photo')->getClientOriginalExtension();
            $randomString = Str::random(6); // 6-character random string
            $fileName = $user->user_id_no . '_' . time() . '_' . $randomString . '.' . $extension;
            $path = $request->file('photo')->storeAs('users', $fileName, 'public');

            // Update user profile_photo
            $user->profile_photo = $path;
            $user->save();

            // Generate full URL with cache-busting query parameter
            $fullUrl = Storage::disk('public')->url($path) . '?t=' . time();

            return response()->json([
                'message' => 'Profile photo updated successfully',
                'profile_photo' => $path,
                'full_url' => $fullUrl,
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Profile photo upload error: ' . $e->getMessage(), [
                'user_id' => auth()->id(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'message' => 'Failed to update profile photo',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function changePassword(Request $request)
    {
        $user = auth()->user();

        $request->validate([
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        // Update password
        $user->password = Hash::make($request->new_password);
        $user->save();

        // Optional: Revoke all tokens to force re-login
        $user->tokens()->delete();

        return response()->json([
            'message' => 'Password changed successfully'
        ], 200);
    }



    public function logout(Request $request)
    {
        // Revoke current access token
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }

    // optional: get authenticated user
    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}
