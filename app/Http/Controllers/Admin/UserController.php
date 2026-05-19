<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CampusClubUser;
use App\Models\User;
use App\Models\UserInformation;
use App\Models\UserViolationRecord;
use App\Models\Violation;
use App\Services\SisApiService;
use Illuminate\Support\Facades\Cache;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Str;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $users = User::query()
            ->select([
                'id',
                'user_id_no',
                'user_role',
                'created_at',
            ])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('user_id_no', 'like', "%{$search}%")
                        ->orWhere('user_role', 'like', "%{$search}%");
                });
            })

            ->orderByRaw("
            CASE 
                WHEN user_role = 'admin' THEN 1
                WHEN user_role = 'guidance_counselor' THEN 2
                WHEN user_role = 'security' THEN 3 
                WHEN user_role = 'student' THEN 4 
                ELSE 4 
            END ASC
        ")
            ->orderBy('created_at', 'desc')
            ->paginate(16)
            ->withQueryString();

        // Transform users
        $users->getCollection()->transform(function ($user) {
            return [
                'id' => $user->id,
                'user_id_no' => $user->user_id_no,
                'user_role' => $user->user_role,
                'created_at' => $user->created_at
            ];
        });

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }


    public function show(Request $request, $id, SisApiService $sisApi)
    {
        $userIdNos = $request->query('user_id_no', []);

        if (is_string($userIdNos)) {
            $userIdNos = [$userIdNos];
        }

        if (empty($userIdNos)) {
            $user = User::findOrFail($id);
            $userIdNos = [$user->user_id_no];
        }

        $query = http_build_query(['user_id_no' => $userIdNos]);
        $response = $sisApi->get("/api/student-enrollment?{$query}");

        if (!$response->ok()) {
            return back()->with('error', 'Failed to fetch student enrollment data');
        }

        $data = collect($response->json())->map(function ($student) {

            $user = User::where('user_id_no', $student['user_id_no'])->first();

            $currentEnrollment = collect($student['enrolled_students'])->first(function ($enrollment) {
                return data_get($enrollment, 'year_section.school_year.is_current') == 1;
            });

            $violationsData = [];

            if ($user) {

                $records = UserViolationRecord::where('user_id', $user->id)
                    ->where('status', 'unsettled')
                    ->get();

                $violationsData = $records->map(function ($record) {

                    $ids = is_array($record->violation_ids)
                        ? $record->violation_ids
                        : json_decode($record->violation_ids, true);

                    if (!is_array($ids)) {
                        $ids = explode(',', $record->violation_ids);
                    }

                    $violations = Violation::whereIn('id', $ids)
                        ->get(['id', 'violation_code']);

                    return [
                        'id' => $record->id,
                        'reference_no' => $record->reference_no,
                        'violations' => $violations,
                        'issued_date_time' => $record->issued_date_time,
                        'status' => $record->status
                    ];
                });
            }

            // CLUBS
            $clubs = [];

            if ($user) {

                $clubs = CampusClubUser::with('club')
                    ->where('user_id', $user->id)
                    ->where('is_active', true)

                    // ONLY ACTIVATED CLUBS
                    ->whereHas('club', function ($query) {
                        $query->where('status', 'Activated');
                    })

                    ->get()
                    ->map(function ($clubUser) {

                        return [
                            'id' => $clubUser->id,
                            'position' => $clubUser->position,
                            'is_admin' => $clubUser->is_admin,

                            'club' => [
                                'id' => $clubUser->club?->id,
                                'club_name' => $clubUser->club?->club_name,
                                'club_logo_path' => $clubUser->club?->club_logo_path,
                                'status' => $clubUser->club?->status,
                            ]
                        ];
                    });
            }
            $student['current_enrollment'] = $currentEnrollment;

            unset($student['enrolled_students']);

            $student['avatar'] = $user ? $user->profile_photo : null;
            $student['created_at'] = $user ? $user->created_at : null;
            $student['violation_records'] = $violationsData;

            // ADD CLUBS
            $student['clubs'] = $clubs;

            return $student;
        });

        return Inertia::render('Admin/Users/Show', [
            'studentData' => $data,
        ]);
    }

    public function getUserDetailsAPI(Request $request, SisApiService $sisApi)
    {
        $inputIds = $request->query('user_id_no', []);

        if (is_string($inputIds)) {
            $inputIds = [$inputIds];
        }

        if (empty($inputIds)) {
            return response()->json(['error' => 'user_id_no[] is required'], 400);
        }

        $userIdNos = collect($inputIds)->map(function ($value) {

            if (preg_match('/^\d{4}-\d-\d{5}$/', $value)) {
                return $value;
            }

            $resolved = Cache::get("qr:$value");

            return $resolved ?: null; // null if invalid/expired

        })->filter()->values()->toArray();

        if (empty($userIdNos)) {
            return response()->json(['error' => 'Invalid or expired QR / user_id_no'], 400);
        }

        $query = http_build_query([
            'user_id_no' => $userIdNos
        ]);

        $response = $sisApi->get("/api/student-enrollment?{$query}");

        if (!$response->ok()) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch student enrollment data'
            ], 500);
        }

        $data = $response->json();

        $users = User::whereIn('user_id_no', $userIdNos)
            ->get()
            ->keyBy('user_id_no');

        $data = collect($data)->map(function ($student) use ($users) {

            $user = $users->get($student['user_id_no']);

            $currentEnrollment = collect($student['enrolled_students'] ?? [])
                ->first(
                    fn($enrollment) =>
                    data_get($enrollment, 'year_section.school_year.is_current') == 1
                );

            $hasViolationToday = false;

            if ($user) {
                $hasViolationToday = UserViolationRecord::where('user_id', $user->id)
                    ->whereDate('issued_date_time', now())
                    ->exists();
            }

            $student['enrolled_students'] = $currentEnrollment ? [$currentEnrollment] : [];
            $student['current_enrollment'] = $currentEnrollment;
            $student['user_exists'] = $user ? true : false;
            $student['avatar'] = $user ? $user->profile_photo : null;
            $student['has_violation_today'] = $hasViolationToday;

            return $student;
        });

        return response()->json($data);
    }

    public function getStudentInformation(
        Request $request,
        SisApiService $sisApi
    ) {

        $userIdNos = $request->query('user_id_no', []);

        if (is_string($userIdNos)) {
            $userIdNos = [$userIdNos];
        }

        if (empty($userIdNos)) {
            return response()->json([
                'message' => 'No user_id_no provided'
            ], 422);
        }

        $query = http_build_query([
            'user_id_no' => $userIdNos
        ]);

        $response = $sisApi->get(
            "/api/student-enrollment?{$query}"
        );

        if (!$response->ok()) {

            return response()->json([
                'message' => 'Failed to fetch student data'
            ], 500);
        }

        $data = collect($response->json())->map(function ($student) {

            $user = User::where(
                'user_id_no',
                $student['user_id_no']
            )->first();

            $currentEnrollment = collect(
                $student['enrolled_students'] ?? []
            )->first(function ($enrollment) {

                return data_get(
                    $enrollment,
                    'year_section.school_year.is_current'
                ) == 1;
            });

            return [
                'user_id_no' => $student['user_id_no'] ?? null,

                'full_name' => trim(
                    ($student['first_name'] ?? '') . ' ' .
                    ($student['last_name'] ?? '')
                ),

                'avatar' => $user?->profile_photo,

                'current_enrollment' => $currentEnrollment,

                'created_at' => $user?->created_at,
            ];
        });

        return response()->json($data->values());
    }

    public function store(Request $request)
    {
        $request->merge([
            'user_id_no' => strtoupper($request->user_id_no),
        ]);

        $validated = $request->validate([
            'user_id_no' => 'required|string|max:50|unique:users,user_id_no',
            'first_name' => 'required|string|max:100',
            'middle_name' => 'nullable|string|max:100',
            'last_name' => 'required|string|max:100',
            'email_address' => 'required|email|max:150|unique:user_information,email_address',
            'user_role' => 'required',
        ]);

        DB::beginTransaction();

        try {
            // Create User (authentication table)
            $user = User::create([
                'user_id_no' => $validated['user_id_no'],
                'password' => Hash::make($validated['user_id_no']),
                'user_role' => $validated['user_role'],
                'face_enrolled' => false,
            ]);

            // Create User Information (details table)
            UserInformation::create([
                'user_id_no' => $validated['user_id_no'],
                'first_name' => $validated['first_name'],
                'middle_name' => $validated['middle_name'],
                'last_name' => $validated['last_name'],
                'email_address' => $validated['email_address'],
            ]);

            DB::commit();

            return response()->json([
                'message' => 'User created successfully.'
            ], 201);

        } catch (\Exception $e) {

            DB::rollBack();

            return response()->json([
                'message' => 'Failed to create user.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'user_id_no' => 'required|exists:users,user_id_no',
        ]);

        $user = User::where('user_id_no', $request->user_id_no)->firstOrFail();

        $newPassword = Str::random(8);
        $user->password = Hash::make($newPassword);
        $user->save();

        return response()->json([
            'message' => 'Password reset successfully.',
            'new_password' => $newPassword,
        ]);
    }

    /**
     * Deactivate account (future feature)
     */
    public function deactivate(Request $request)
    {
        return response()->json([
            'message' => 'Account deactivation feature coming soon.'
        ]);
    }
}