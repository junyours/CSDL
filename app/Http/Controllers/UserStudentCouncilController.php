<?php

namespace App\Http\Controllers;

use App\Models\EventSanctionSettlement;
use App\Models\UserStudentCouncil;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use DB;
use Http;
use Illuminate\Http\Request;

class UserStudentCouncilController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $data = UserStudentCouncil::with('user')
            ->where('is_removed', 0)
            ->get();

        return response()->json($data);
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
        // Validate input
        $request->validate([
            'user_id_no' => 'required|exists:users,user_id_no',
            'position' => 'nullable|string',
        ]);

        // Find the corresponding users.id
        $user = \App\Models\User::where('user_id_no', $request->user_id_no)->first();

        if (!$user) {
            return response()->json([
                'message' => 'User not found.',
            ], 404);
        }

        $userId = $user->id; // ✔ correct users.id

        // Check if already in council
        $existing = UserStudentCouncil::where('user_id', $userId)->first();

        if ($existing) {
            if ($existing->is_removed == 1) {
                // Restore removed council member
                $existing->update([
                    'is_removed' => 0,
                    'position' => $request->position,
                ]);

                return response()->json([
                    'message' => 'Restored successfully.',
                    'data' => $existing
                ]);
            }

            return response()->json([
                'message' => 'User is already in student council.',
                'data' => $existing
            ], 409);
        }

        // Create new council entry
        $newData = UserStudentCouncil::create([
            'user_id' => $userId,
            'position' => $request->position,
        ]);

        return response()->json([
            'message' => 'Saved successfully.',
            'data' => $newData
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(UserStudentCouncil $userStudentCouncil)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(UserStudentCouncil $userStudentCouncil)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, UserStudentCouncil $userStudentCouncil)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $data = UserStudentCouncil::findOrFail($id);

        $data->update([
            'is_removed' => 1
        ]);

        return response()->json([
            'message' => 'Removed successfully.',
        ]);
    }

    public function searchUsers(Request $request)
    {
        $user_id_no = $request->query('user_id_no');

        if (!$user_id_no) {
            return response()->json(['error' => 'user_id_no is required'], 400);
        }

        $apiToken = env('API_ENROLLMENT_SYSTEM_TOKEN');
        $apiUrl = env('API_ENROLLMENT_SYSTEM_URL');

        if (!$apiToken || !$apiUrl) {
            return response()->json(['error' => 'API configuration is missing'], 500);
        }

        $response = Http::withToken($apiToken)
            ->get("{$apiUrl}/api/student-enrollment", [
                'user_id_no' => $user_id_no
            ]);

        if (!$response->successful()) {
            return response()->json([
                'error' => 'Failed to fetch enrolled students from API',
                'status' => $response->status(),
                'body' => $response->body()
            ], 500);
        }

        $payload = $response->json();

        if (empty($payload)) {
            return response()->json(['message' => 'No students found'], 404);
        }

        // Extract user_id_no from first record (assuming it's consistent)
        $fetched_user_id_no = $payload[0]['user_id_no'] ?? null;
        if (!$fetched_user_id_no) {
            return response()->json(['message' => 'Invalid payload structure'], 500);
        }

        // 1. Check if user exists in main `users` table by `user_id_no`
        $user = DB::table('users')
            ->where('user_id_no', $fetched_user_id_no)
            ->first();

        if (!$user) {
            return response()->json([
                'message' => 'User not exist or already added as council'
            ], 403);
        }

        // 2. Check if user is in `user_student_councils`
        $councilEntry = DB::table('user_student_councils')
            ->where('user_id', $user->id)
            ->first();

        if ($councilEntry && $councilEntry->is_removed == 0) {
            return response()->json([
                'message' => 'User not exist or already added as council'
            ], 403);
        }

        // 3. Filter enrolled_students to only include where school_year.is_current = 1
        $filteredPayload = collect($payload)->map(function ($student) {
            $currentEnrollments = collect($student['enrolled_students'])->filter(function ($enrollment) {
                return isset($enrollment['year_section']['school_year']['is_current']) &&
                    $enrollment['year_section']['school_year']['is_current'] == 1;
            })->values();

            $student['enrolled_students'] = $currentEnrollments->all();

            return $student;
        })->all();

        // If no current enrollment, you may want to return empty or message
        // But per requirement: return payload (even if empty enrolled_students array)
        return response()->json($filteredPayload);
    }

    public function checkMembership(Request $request)
    {
        $user_id_no = $request->query('user_id_no');

        $record = DB::table('users')
            ->join('user_student_councils', 'users.id', '=', 'user_student_councils.user_id')
            ->where('users.user_id_no', $user_id_no)
            ->where('user_student_councils.is_removed', 0)
            ->select('user_student_councils.id')
            ->first();

        return response()->json([
            'is_council_member' => $record ? true : false,
            'user_student_council_id' => $record?->id ?? null,
        ]);
    }

    public function generateReportDateRange(Request $request)
    {
        $request->validate([
            'settlement_logged_by' => 'required',
            'settlement_logged_name' => 'required',
            'department_name' => 'required',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
        ]);

        $councilId = $request->settlement_logged_by;
        $councilName = $request->settlement_logged_name;
        $departmentName = $request->department_name;

        // Normalize date range
        $start = Carbon::parse($request->start_date)->startOfDay();
        $end = Carbon::parse($request->end_date)->endOfDay();

        // Fetch settlements within date range
        $settlements = EventSanctionSettlement::where('settlement_logged_by', $councilId)
            ->whereBetween('transaction_date_time', [$start, $end])
            ->get();

        $active = $settlements->where('is_void', 0);
        $voided = $settlements->where('is_void', 1);

        $pdf = Pdf::loadView('reports.csdl-council-report', [
            'settlements' => $settlements,
            'active' => $active,
            'voided' => $voided,
            'summary' => [
                'total_amount_paid' => $active->sum('amount_paid'),
                'total_transactions' => $settlements->unique('transaction_code')->count(),
                'voided_transactions_count' => $voided->unique('transaction_code')->count(),
            ],
            'department_name' => $departmentName,
            'council_member_name' => $councilName,

            // Pass date range to PDF view if needed
            'date_range' => [
                'start' => $start->toFormattedDateString(),
                'end' => $end->toFormattedDateString(),
            ],
        ]);

        $fileName = 'council_report_range_' . time() . '.pdf';
        $path = storage_path('app/public/reports/' . $fileName);

        file_put_contents($path, $pdf->output());

        return response()->json([
            'file_url' => url('storage/reports/' . $fileName)
        ]);
    }
}
