<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserViolationRecord;
use App\Models\Violation;
use App\Services\SisApiService;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    // public function index(Request $request, SisApiService $sisApi)
    // {
    //     $totalUsers = User::where('user_role', 'student')->count();

    //     $usersWithProfilePhoto = User::whereNotNull('profile_photo')
    //         ->where('profile_photo', '!=', '')
    //         ->count();

    //     $usersWithFaceEnrolled = User::where('face_enrolled', 1)->count();

    //     $unsettledViolations = UserViolationRecord::where('status', 'unsettled')->count();

    //     $violations = Violation::where('status', true)
    //         ->get(['id', 'violation_code']);

    //     $violationMap = $violations->pluck('violation_code', 'id');

    //     $structureResponse = $sisApi->get('/api/school-structure');

    //     if (!$structureResponse->ok()) {
    //         return Inertia::render('Admin/Dashboard/Index', [
    //             'totalUsers' => $totalUsers,
    //             'usersWithProfilePhoto' => $usersWithProfilePhoto,
    //             'usersWithFaceEnrolled' => $usersWithFaceEnrolled,
    //             'unsettledViolations' => $unsettledViolations,
    //             'violationChartData' => [],
    //             'departmentViolationChartData' => [],
    //             'departmentUserCounts' => [],
    //             'violationCodes' => [],
    //         ]);
    //     }

    //     $departments = $structureResponse->json()['departments'] ?? [];

    //     $userDepartmentMap = [];
    //     $departmentViolationCounts = [];

    //     foreach ($departments as $department) {

    //         $departmentId = $department['id'];
    //         $departmentName = $department['department_name'];

    //         $departmentViolationCounts[$departmentName] = [];

    //         foreach ($violations as $violation) {
    //             $departmentViolationCounts[$departmentName][$violation->violation_code] = 0;
    //         }

    //         $studentResponse = $sisApi->get(
    //             '/api/student-enrollment?department_id[]=' . $departmentId
    //         );

    //         if (!$studentResponse->ok()) {
    //             continue;
    //         }

    //         $userIds = $studentResponse->json()['user_id_no'] ?? [];

    //         foreach ($userIds as $userIdNo) {
    //             $userDepartmentMap[strtoupper($userIdNo)] = $departmentName;
    //         }
    //     }

    //     $violationCounts = [];

    //     foreach ($violations as $violation) {
    //         $violationCounts[$violation->violation_code] = 0;
    //     }

    //     $records = UserViolationRecord::with('user')->get();

    //     foreach ($records as $record) {

    //         if (!is_array($record->violation_ids)) {
    //             continue;
    //         }

    //         $user = $record->user;

    //         if (!$user) {
    //             continue;
    //         }

    //         $userIdNo = strtoupper($user->user_id_no);

    //         $departmentName = $userDepartmentMap[$userIdNo] ?? null;

    //         if (!$departmentName) {
    //             continue;
    //         }

    //         foreach ($record->violation_ids as $violationId) {

    //             if (!isset($violationMap[$violationId])) {
    //                 continue;
    //             }

    //             $code = $violationMap[$violationId];

    //             $violationCounts[$code]++;
    //             $departmentViolationCounts[$departmentName][$code]++;
    //         }
    //     }

    //     $violationChartData = collect($violationCounts)
    //         ->map(function ($count, $code) {
    //             return [
    //                 'violation_code' => $code,
    //                 'count' => $count,
    //             ];
    //         })
    //         ->values();

    //     $departmentViolationChartData = collect($departmentViolationCounts)
    //         ->map(function ($codes, $departmentName) {
    //             return array_merge(
    //                 ['department_name' => $departmentName],
    //                 $codes
    //             );
    //         })
    //         ->values();

    //     $departmentUserCounts = $this->fetchDepartmentUserCounts($sisApi);

    //     return Inertia::render('Admin/Dashboard/Index', [
    //         'totalUsers' => $totalUsers,
    //         'usersWithProfilePhoto' => $usersWithProfilePhoto,
    //         'usersWithFaceEnrolled' => $usersWithFaceEnrolled,
    //         'unsettledViolations' => $unsettledViolations,
    //         'violationChartData' => $violationChartData,
    //         'departmentViolationChartData' => $departmentViolationChartData,
    //         'departmentUserCounts' => $departmentUserCounts,
    //         'violationCodes' => $violations->pluck('violation_code')->values(),
    //     ]);
    // }

    public function index()
    {
        return Inertia::render('Maintenance');
    }

    private function fetchDepartmentUserCounts(SisApiService $sisApi)
    {
        $structureResponse = $sisApi->get('/api/school-structure');

        if (!$structureResponse->ok()) {
            return [];
        }

        $departments = $structureResponse->json()['departments'] ?? [];

        $results = [];

        foreach ($departments as $department) {

            $studentResponse = $sisApi->get(
                '/api/student-enrollment?department_id[]=' . $department['id']
            );

            if (!$studentResponse->ok()) {
                continue;
            }

            $userIds = $studentResponse->json()['user_id_no'] ?? [];

            $localCount = User::whereIn('user_id_no', $userIds)
                ->where('user_role', 'student')
                ->count();

            $results[] = [
                'department_id' => $department['id'],
                'department_name' => $department['department_name'],
                'student_count' => $localCount,
            ];
        }

        return $results;
    }

    private function fetchSchoolStructure(Request $request, SisApiService $sisApi)
    {
        $filters = $request->query();
        $query = http_build_query($filters);

        $response = $sisApi->get("/api/school-structure" . ($query ? "?{$query}" : ""));

        if (!$response->ok()) {
            throw new \Exception('Failed to fetch school structure data');
        }

        return $response->json();
    }

    public function fetchEnrollmentAnalyticsFromApi(Request $request, SisApiService $sisApi)
    {
        // Get all student IDs
        $students = DB::table('users')
            ->where('user_role', 'student')
            ->pluck('user_id_no')
            ->toArray();

        $localTotalStudents = count($students);

        // Call API
        $response = $sisApi->post('/api/enrollment-analytics', [
            'user_ids' => $students
        ]);

        if (!$response->ok()) {
            throw new \Exception('Failed to fetch enrollment analytics');
        }

        $data = $response->json();

        // Add local system info
        $data['local_total_students'] = $localTotalStudents;

        return response()->json($data);

        //         {
        //   "active_school_year": "2025-2026",
        //   "department_counts": [
        //     {
        //       "department": "DIT",
        //       "total": 50,
        //       "percentage": 25
        //     },
        //     {
        //       "department": "CBA",
        //       "total": 150,
        //       "percentage": 75
        //     }
        //   ],
        //   "system_active_users": 200,
        //   "local_total_students": 300
        // }
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
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
