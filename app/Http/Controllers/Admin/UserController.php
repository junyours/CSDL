<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserInformation;
use App\Services\SisApiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
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
                WHEN user_role = 'security' THEN 2 
                WHEN user_role = 'student' THEN 3 
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
                'created_at' => $user->created_at->format('M d, Y'), // Bonus: Cleaner date for UI
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
            // 1. Find the local user for the avatar
            $user = User::where('user_id_no', $student['user_id_no'])->first();

            // 2. Filter the enrolled_students array to only include the current one
            $currentEnrollment = collect($student['enrolled_students'])->first(function ($enrollment) {
                return data_get($enrollment, 'year_section.school_year.is_current') == 1;
            });

            // 3. Attach the filtered enrollment and avatar to the student object
            $student['current_enrollment'] = $currentEnrollment;
            $student['avatar'] = $user ? $user->profile_photo : null;
            $student['created_at'] = $user ? $user->created_at : null;

            return $student;
        });

        return Inertia::render('Admin/Users/Show', [
            'studentData' => $data,
        ]);
    }

    public function getUserDetailsAPI(Request $request, SisApiService $sisApi)
    {
        $userIdNos = $request->query('user_id_no', []);

        if (is_string($userIdNos)) {
            $userIdNos = [$userIdNos];
        }

        if (empty($userIdNos)) {
            return response()->json(['error' => 'user_id_no[] is required'], 400);
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

            $student['user_exists'] = $user ? true : false;

            $student['avatar'] = $user ? $user->profile_photo : null;

            return $student;
        });

        return response()->json($data);
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
            'user_role' => 'required|in:admin,security,student',
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