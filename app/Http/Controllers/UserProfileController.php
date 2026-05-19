<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserInformation;
use App\Services\SisApiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class UserProfileController extends Controller
{
    public function index(SisApiService $sisApi)
    {
        $user = auth()->user();

        $avatar = $user->profile_photo;

        $studentData = null;
        $userInfoData = null;

        // =============================
        // STUDENT ROLE
        // =============================
        if ($user->user_role === 'student') {

            $studentData = $this->fetchStudentData($user->user_id_no, $sisApi);

        } else {

            $userInfoData = UserInformation::where('user_id_no', $user->user_id_no)
                ->select([
                    'first_name',
                    'middle_name',
                    'last_name',
                    'email_address',
                ])
                ->first();
        }

        // =============================
        // AVATAR RESOLVER LOGIC
        // =============================
        if ($avatar) {

            // If stored locally (profile-photos/...)
            if (str_starts_with($avatar, 'profile-photos/')) {
                $avatar = Storage::disk('public')->url($avatar) . '?t=' . time();
            }
            // Otherwise assume Google photo ID
            else {
                $avatar = "https://lh3.googleusercontent.com/d/" . $avatar;
            }
        }

        return Inertia::render('Profile/Index', [
            'studentData' => $studentData,
            'userInfoData' => $userInfoData,
            'avatar' => $avatar,
        ]);
    }


    private function fetchStudentData($userIdNo, SisApiService $sisApi)
    {
        $query = http_build_query([
            'user_id_no' => [$userIdNo]
        ]);

        $response = $sisApi->get("/api/student-enrollment?{$query}");

        if (!$response->ok()) {
            return null;
        }

        $student = collect($response->json())->first();

        if (!$student) {
            return null;
        }

        return [
            'first_name' => $student['first_name'] ?? null,
            'middle_name' => $student['middle_name'] ?? null,
            'last_name' => $student['last_name'] ?? null,
            'gender' => $student['gender'] ?? null,
            'birthday' => $student['birthday'] ?? null,
            'email_address' => $student['email_address'] ?? null,
            'contact_number' => $student['contact_number'] ?? null,
            'present_address' => $student['present_address'] ?? null,
            'zip_code' => $student['zip_code'] ?? null,
        ];
    }

    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|max:5120',
        ]);

        $user = auth()->user();

        $accessToken = $this->token();

        $folderId = $this->getOrCreateFolder($accessToken, 'UserProfile', config('services.google.folder_id'));

        $file = $request->file('avatar');
        $mimeType = $file->getMimeType();

        $metadata = [
            'name' => 'temp_' . time(),
            'parents' => [$folderId],
        ];

        $uploadResponse = Http::withToken($accessToken)
            ->attach('metadata', json_encode($metadata), 'metadata.json', ['Content-Type' => 'application/json'])
            ->attach('media', file_get_contents($file), $file->getClientOriginalName(), ['Content-Type' => $mimeType])
            ->post('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart');

        if ($uploadResponse->successful()) {
            $fileId = $uploadResponse->json()['id'];

            Http::withToken($accessToken)->patch("https://www.googleapis.com/drive/v3/files/{$fileId}", [
                'name' => $fileId,
            ]);

            Http::withToken($accessToken)->post("https://www.googleapis.com/drive/v3/files/{$fileId}/permissions", [
                'role' => 'reader',
                'type' => 'anyone',
            ]);

            $user->update([
                'profile_photo' => $fileId,
            ]);

        }

        return back();
    }

    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = auth()->user();
        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'message' => 'Password changed successfully',
        ]);
    }


}
