<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Sanction;
use App\Models\User;
use App\Models\UserViolationRecord;
use App\Models\Violation;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Validator;

class UserViolationRecordController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id_no' => 'required|exists:users,user_id_no',
            'violations' => 'required|array|min:1',
            'violations.*' => 'integer',
            'sanction_id' => 'nullable|integer',
            'remarks' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Invalid input',
                'errors' => $validator->errors(),
            ], 422);
        }

        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $user = User::where('user_id_no', $request->user_id_no)->first();

        if (!$user) {
            return response()->json([
                'message' => 'User not found',
            ], 404);
        }

        $sanctionId = $request->sanction_id;

        if (!$sanctionId) {
            $defaultSanction = Sanction::where('is_default', 1)->first();
            $sanctionId = $defaultSanction?->id; // will be null if none exists
        }

        $record = UserViolationRecord::create([
            'reference_no' => $this->generateReferenceNumber(),
            'user_id' => $user->id,
            'violation_ids' => $request->violations,
            'sanction_id' => $sanctionId, // <-- uses default if available
            'issued_by' => Auth::id(),
            'issued_date_time' => now(),
            'remarks' => $request->remarks ?? null,
            'status' => 'unsettled',
        ]);

        // Load relationships
        $record->load('user', 'sanction');

        // Fetch violation codes
        $violations = Violation::whereIn('id', $record->violation_ids)
            ->pluck('violation_code');

        $record->violation_codes = $violations;

        return response()->json([
            'message' => 'Violation record created successfully',
            'record' => $record,
        ], 201);
    }

    private function generateReferenceNumber()
    {
        do {
            $reference = str_pad(mt_rand(0, 99999999999), 11, '0', STR_PAD_LEFT);
        } while (UserViolationRecord::where('reference_no', $reference)->exists());

        return $reference;
    }


    public function userViolationRecordsIndex(Request $request)
    {
        $violations = UserViolationRecord::with(['sanction', 'issuer'])
            ->where('user_id', auth()->id())
            ->latest('issued_date_time')
            ->paginate(10)
            ->withQueryString();

        // Transform paginated collection
        $violations->getCollection()->transform(function ($record) {

            // Get violation IDs from JSON column
            $violationIds = $record->violation_ids ?? [];

            // Fetch violation codes
            $violationCodes = Violation::whereIn('id', $violationIds)
                ->pluck('violation_code');

            // Attach to record
            $record->violation_codes = $violationCodes;

            return $record;
        });

        return Inertia::render('Student/Violation/Index', [
            'violations' => $violations,
            'filters' => $request->only('search'),
        ]);
    }

    public function allUserViolationRecordsIndex(Request $request)
    {
        $search = $request->search;

        $violations = UserViolationRecord::query()
            ->select([
                'id',
                'reference_no',
                'user_id',
                'sanction_id',
                'issued_by',
                'status',
                'issued_date_time',
                'violation_ids',
            ])
            ->with([
                'user:id,user_id_no',
                'issuer:id,user_id_no',
                'sanction:id,sanction_type,monetary_amount,service_time,service_time_type,sanction_name',
            ])
            ->when($search, function ($query) use ($search) {
                $query->where('reference_no', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q) use ($search) {
                        $q->where('user_id_no', 'like', "%{$search}%");
                    });
            })
            ->latest('issued_date_time')
            ->paginate(20)
            ->withQueryString();

        /**
         * Collect all violation IDs from current page for the map
         */
        $allViolationIds = collect($violations->items())
            ->pluck('violation_ids')
            ->flatten()
            ->unique()
            ->filter()
            ->values();

        $violationMap = Violation::whereIn('id', $allViolationIds)
            ->pluck('violation_code', 'id');

        /**
         * Transform data
         */
        $violations->getCollection()->transform(function ($record) use ($violationMap) {
            return [
                'id' => $record->id,
                'reference_no' => $record->reference_no,
                'issued_date_time' => $record->issued_date_time,
                'status' => $record->status,
                'user' => [
                    'user_id_no' => $record->user?->user_id_no,
                ],
                'issuer' => [
                    'user_id_no' => $record->issuer?->user_id_no,
                ],
                'sanction' => $record->sanction ? [
                    'sanction_type' => $record->sanction->sanction_type,
                    'monetary_amount' => $record->sanction->monetary_amount,
                    'service_time' => $record->sanction->service_time,
                    'service_time_type' => $record->sanction->service_time_type,
                    'sanction_name' => $record->sanction->sanction_name,
                ] : null,
                'violation_codes' => collect($record->violation_ids)
                    ->map(fn($id) => $violationMap[$id] ?? null)
                    ->filter()
                    ->values(),
            ];
        });

        /**
         * TOP 3 VIOLATION CODES TODAY
         */
        $todayViolationIds = UserViolationRecord::whereDate('issued_date_time', now()->toDateString())
            ->pluck('violation_ids')
            ->flatten()
            ->filter();

        $topViolationCodesToday = $todayViolationIds
            ->countBy()
            ->sortDesc()
            ->take(3)
            ->map(function ($count, $violationId) {
                $violation = Violation::find($violationId);
                return [
                    'violation_code' => $violation?->violation_code,
                    'total' => $count,
                ];
            })->values();

        /**
         * ==========================================
         * TOP 1 USER WITH MOST UNSETTLED VIOLATIONS (ALL TIME)
         * ==========================================
         */
        $topUnsettledUserRecord = UserViolationRecord::where('status', 'unsettled')
            ->selectRaw('user_id, COUNT(*) as total')
            ->groupBy('user_id')
            ->orderByDesc('total')
            ->with('user:id,user_id_no')
            ->first();

        $topUserUnsettledData = null;

        if ($topUnsettledUserRecord) {
            // Get all violation IDs belonging to this specific user that are unsettled
            $userViolationIds = UserViolationRecord::where('user_id', $topUnsettledUserRecord->user_id)
                ->where('status', 'unsettled')
                ->pluck('violation_ids')
                ->flatten()
                ->filter();

            // Count occurrences of each violation for this user
            $userViolationCounts = $userViolationIds->countBy();

            // Fetch the codes for these specific violations
            $userViolationDetails = Violation::whereIn('id', $userViolationCounts->keys())
                ->get()
                ->map(function ($v) use ($userViolationCounts) {
                    return [
                        'code' => $v->violation_code,
                        'count' => $userViolationCounts[$v->id] ?? 0
                    ];
                });

            $topUserUnsettledData = [
                'user_id' => $topUnsettledUserRecord->user_id,
                'user_id_no' => $topUnsettledUserRecord->user?->user_id_no,
                'total_unsettled' => $topUnsettledUserRecord->total,
                'violations_breakdown' => $userViolationDetails,
            ];
        }

        return Inertia::render('Admin/UserViolationRecords/Index', [
            'violations' => $violations,
            'filters' => $request->only('search'),
            'topViolationCodesToday' => $topViolationCodesToday,
            'topUserUnsettledAllTime' => $topUserUnsettledData,
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:unsettled,settled,void',
        ]);

        $violation = UserViolationRecord::with(['user', 'sanction', 'issuer'])->findOrFail($id);

        $violation->status = $request->status;
        $violation->save();

        $violation->violation_codes = Violation::whereIn('id', $violation->violation_ids)
            ->pluck('violation_code');

        return response()->json([
            'record' => $violation,
            'message' => 'Status updated successfully',
        ]);
    }

    public function printUnsettled()
    {
        $user = auth()->user();

        $violations = UserViolationRecord::with(['sanction', 'issuer'])
            ->where('user_id', $user->id)
            ->where('status', 'unsettled')
            ->latest('issued_date_time')
            ->get();

        $violations->transform(function ($record) {
            $violationIds = $record->violation_ids ?? [];

            $record->violation_codes = Violation::whereIn('id', $violationIds)
                ->pluck('violation_code');

            return $record;
        });

        $pdf = Pdf::loadView('pdf.student-unsettled-violations', [
            'violations' => $violations,
            'user' => $user,
        ])->setPaper('a4', 'portrait');

        $name = Str::slug($user->user_id_no);
        $date = now()->format('Y-m-d');
        $filename = "CSDL_Violation_Report_{$name}_{$date}.pdf";

        return $pdf->stream($filename);
    }

    public function exportCSV(Request $request)
    {
        $search = $request->search;

        $records = UserViolationRecord::query()
            ->with([
                'user:id,user_id_no',
                'issuer:id,user_id_no',
                'sanction' // Fetching full sanction details
            ])
            ->when($search, function ($query) use ($search) {
                $query->where('reference_no', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q) use ($search) {
                        $q->where('user_id_no', 'like', "%{$search}%");
                    });
            })
            ->latest('issued_date_time')
            ->get();

        // Optimization: Bulk fetch all unique violation codes to avoid N+1 queries inside the loop
        $allViolationIds = $records->pluck('violation_ids')->flatten()->unique()->toArray();
        $violationMap = Violation::whereIn('id', $allViolationIds)
            ->pluck('violation_code', 'id');

        $filename = "violation_records_" . now()->format('Ymd_His') . ".csv";

        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate",
            "Expires" => "0",
        ];

        $callback = function () use ($records, $violationMap) {
            $file = fopen('php://output', 'w');

            fputcsv($file, [
                'Reference No',
                'User ID',
                'Violation Codes',
                'Sanction Details', // Renamed for clarity
                'Issued By',
                'Status',
                'Issued Date'
            ]);

            foreach ($records as $row) {
                // 1. Map IDs to actual Codes
                $codes = collect($row->violation_ids)
                    ->map(fn($id) => $violationMap[$id] ?? 'N/A')
                    ->implode(', ');

                // 2. Format Sanction string based on type
                $sanctionDescription = '---';
                if ($row->sanction) {
                    $s = $row->sanction;
                    if ($s->sanction_type === 'monetary') {
                        $sanctionDescription = "{$s->sanction_name} (PHP " . number_format($s->monetary_amount, 2) . ")";
                    } elseif ($s->sanction_type === 'community_service') {
                        $sanctionDescription = "{$s->sanction_name} ({$s->service_time} {$s->service_time_type})";
                    } else {
                        $sanctionDescription = $s->sanction_name;
                    }
                }

                fputcsv($file, [
                    $row->reference_no,
                    $row->user?->user_id_no,
                    $codes,
                    $sanctionDescription,
                    $row->issuer?->user_id_no,
                    ucfirst($row->status),
                    $row->issued_date_time->format('Y-m-d H:i A'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }


    public function exportPDF(Request $request)
    {
        $search = $request->search;

        $records = UserViolationRecord::query()
            ->with([
                'user:id,user_id_no', // Added name for the PDF header
                'issuer:id,user_id_no',
                'sanction'
            ])
            ->when($search, function ($query) use ($search) {
                $query->where('reference_no', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q) use ($search) {
                        $q->where('user_id_no', 'like', "%{$search}%");
                    });
            })
            ->latest('issued_date_time')
            ->get();

        // 1. Prepare Violation Mapping
        $allViolationIds = $records->pluck('violation_ids')->flatten()->unique()->toArray();
        $violationMap = Violation::whereIn('id', $allViolationIds)->pluck('violation_code', 'id');

        // 2. Transform Data for the View
        $formattedRecords = $records->map(function ($row) use ($violationMap) {
            // Map Codes
            $row->formatted_codes = collect($row->violation_ids)
                ->map(fn($id) => $violationMap[$id] ?? 'N/A')
                ->implode(', ');

            // Format Sanction
            $row->sanction_desc = '---';
            if ($row->sanction) {
                $s = $row->sanction;
                if ($s->sanction_type === 'monetary') {
                    $row->sanction_desc = "{$s->sanction_name} (PHP " . number_format($s->monetary_amount, 2) . ")";
                } elseif ($s->sanction_type === 'community_service') {
                    $row->sanction_desc = "{$s->sanction_name} ({$s->service_time} {$s->service_time_type})";
                } else {
                    $row->sanction_desc = $s->sanction_name;
                }
            }
            return $row;
        });

        // 3. Generate PDF
        $pdf = Pdf::loadView('pdf.admin-unsettled-violations', [
            'records' => $formattedRecords,
            'user' => auth()->user(), // For the footer verification
            'search_query' => $search
        ])->setPaper('a4', 'portrait');

        $filename = "violation_report_" . now()->format('Ymd_His') . ".pdf";
        return $pdf->download($filename);
    }

}
