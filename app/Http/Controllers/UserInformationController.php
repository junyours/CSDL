<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserInformation;
use DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Mail\SendUserCredentialsMail;

class UserInformationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id_no' => 'required|string|unique:users,user_id_no',
            'user_role' => 'required|in:admin,security,student',
            'email_address' => 'required|email',
            'first_name' => 'required|string',
        ]);

        // Generate a secure random 8-character password
        $password = Str::random(8);

        // Store the new user
        $user = User::create([
            'user_id_no' => $validated['user_id_no'],
            'user_role' => $validated['user_role'],
            'password' => Hash::make($password),
        ]);

        $name = $validated['first_name'];

        // Deep link to your React Native app
        $appLink = url("/open-app?user_id_no={$user->user_id_no}");

        try {
            // Send credentials via email
            Mail::to($validated['email_address'])->send(
                new SendUserCredentialsMail($user->user_id_no, $name, $password, $appLink)
            );
        } catch (\Exception $e) {
            \Log::error('Mail sending failed: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'User created successfully and credentials sent via email.',
            'user' => $user,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($user_id_no)
    {
        $info = DB::table('user_information as ui')
            ->join('users as u', 'ui.user_id_no', '=', 'u.user_id_no')
            ->select(
                'ui.*',
                'u.profile_photo'
            )
            ->where('ui.user_id_no', $user_id_no)
            ->first();

        if (!$info) {
            return response()->json(['message' => 'User info not found'], 404);
        }

        return response()->json([
            'message' => 'User info retrieved successfully',
            'data' => $info
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(UserInformation $userInformation)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, UserInformation $userInformation)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(UserInformation $userInformation)
    {
        //
    }

    public function fetchSchoolStructureAPI(Request $request)
    {
        try {
            $query = $request->query(); // forward all filters

            $response = Http::withToken(env('API_ENROLLMENT_SYSTEM_TOKEN'))
                ->get(env('API_ENROLLMENT_SYSTEM_URL') . '/api/school-structure', $query);

            if ($response->ok()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Successfully communicated with the API',
                    'data' => $response->json(),
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'API responded with an error',
                ], 500);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to communicate with the API: ' . $e->getMessage(),
            ], 500);
        }
    }


    public function fetchAllStudentAPI(Request $request)
    {
        try {
            // Build query parameters dynamically for remote API
            $queryParams = [];
            foreach (['school_year_id', 'semester_id', 'department_id', 'course_id', 'year_level_id', 'year_section_id'] as $param) {
                if ($request->filled($param)) {
                    $values = $request->input($param);
                    if (!is_array($values)) {
                        $values = [$values];
                    }
                    foreach ($values as $value) {
                        $queryParams["{$param}[]"] = $value;
                    }
                }
            }

            // Call remote API
            $response = Http::withToken(env('API_ENROLLMENT_SYSTEM_TOKEN'))
                ->get(env('API_ENROLLMENT_SYSTEM_URL') . '/api/student-enrollment', $queryParams);

            if (!$response->ok()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to fetch student enrollment from API',
                ], 500);
            }

            $remoteData = $response->json();
            $userIds = $remoteData['user_id_no'] ?? [];

            // Initialize counts
            $registeredCount = 0;
            $unregisteredCount = 0;
            $faceRegisteredCount = 0;

            // Prepare full student array (before pagination)
            $students = [];

            if (!empty($userIds)) {
                $localUsers = DB::table('users')
                    ->whereIn('user_id_no', $userIds)
                    ->where('user_role', 'student')
                    ->get()
                    ->keyBy('user_id_no');

                foreach ($userIds as $uid) {
                    $isRegistered = isset($localUsers[$uid]);
                    $faceRegistered = false;
                    $profilePhoto = null;

                    if ($isRegistered) {
                        $user = $localUsers[$uid];
                        $faceRegistered = $user->face_enrolled == 1;
                        $profilePhoto = $user->profile_photo;
                        $registeredCount++;
                        if ($faceRegistered)
                            $faceRegisteredCount++;
                    } else {
                        $unregisteredCount++;
                    }

                    $students[] = [
                        'user_id_no' => $uid,
                        'registered' => $isRegistered,
                        'face_registered' => $faceRegistered,
                        'profile_photo' => $profilePhoto,
                    ];

                    // ---- SORT: registered first ----
                    usort($students, function ($a, $b) {
                        return $a['registered'] === $b['registered']
                            ? 0
                            : ($a['registered'] ? -1 : 1);
                    });
                }
            }

            // ---------- PAGINATION ----------
            $total = count($students);
            $perPage = (int) $request->input('per_page', 30);
            $currentPage = max(1, (int) $request->input('page', 1));
            $offset = ($currentPage - 1) * $perPage;
            $paginatedStudents = array_slice($students, $offset, $perPage);

            $lastPage = $perPage > 0 ? ceil($total / $perPage) : 1;
            $from = $total > 0 ? $offset + 1 : null;
            $to = $total > 0 ? $offset + count($paginatedStudents) : null;

            return response()->json([
                'success' => true,
                'data' => array_values($paginatedStudents), // re-index
                'summary' => [
                    'total' => $total,
                    'registered_count' => $registeredCount,
                    'unregistered_count' => $unregisteredCount,
                    'face_registered_count' => $faceRegisteredCount,
                ],
                'pagination' => [
                    'current_page' => $currentPage,
                    'last_page' => $lastPage,
                    'per_page' => $perPage,
                    'total' => $total,
                    'from' => $from,
                    'to' => $to,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function getStudentEnrollmentAPI(Request $request)
    {
        // Accept user_id_no[] as array
        $userIdNos = $request->query('user_id_no', []);

        // Convert single string to array if needed
        if (is_string($userIdNos)) {
            $userIdNos = [$userIdNos];
        }

        if (empty($userIdNos) || !is_array($userIdNos)) {
            return response()->json(['error' => 'user_id_no[] is required'], 400);
        }

        // 1. Call external enrollment API with array
        $apiToken = env('API_ENROLLMENT_SYSTEM_TOKEN');
        $apiUrl = env('API_ENROLLMENT_SYSTEM_URL');

        $response = Http::withToken($apiToken)
            ->get("{$apiUrl}/api/student-enrollment", [
                'user_id_no' => $userIdNos  // Laravel auto-converts to user_id_no[]=...
            ]);

        if (!$response->successful()) {
            return response()->json([
                'error' => 'Failed to fetch enrolled students',
                'status' => $response->status(),
            ], 500);
        }

        $payloads = $response->json(); // Array of student objects

        if (empty($payloads)) {
            return response()->json([], 200); // Empty array instead of 404
        }

        // 2. Fetch local data for ALL user_id_no in one query
        $localUsers = User::select('user_id_no', 'profile_photo', 'face_enrolled')
            ->whereIn('user_id_no', $userIdNos)
            ->get()
            ->keyBy('user_id_no'); // Fast lookup: user_id_no → user

        // 3. Merge local data into each payload
        foreach ($payloads as &$student) {
            $local = $localUsers->get($student['user_id_no']);

            $student['profile_photo'] = $local?->profile_photo ?? null;
            $student['face_enrolled'] = $local?->face_enrolled ?? 0;
        }

        return response()->json($payloads);
    }

    public function countStudentUsers()
    {
        $count = User::where('user_role', 'student')
            ->where('face_enrolled', 1)
            ->count();

        return response()->json([
            'success' => true,
            'count' => $count,
        ]);
    }

}
