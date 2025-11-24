<?php

namespace App\Http\Controllers;

use App\Models\AttendanceAnomaly;
use App\Models\Event;
use App\Models\EventAttendance;
use App\Models\EventSanctionSettlement;
use App\Models\User;
use Cache;
use Exception;
use Http;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class EventAttendanceController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'event_id' => 'required|exists:events,id',
            'user_id_no' => 'nullable|string|max:255',
            'checkpoint' => 'nullable|in:start_time,end_time,first_start_time,first_end_time,second_start_time,second_end_time',
            'date_from' => 'nullable|date_format:Y-m-d',
            'date_to' => 'nullable|date_format:Y-m-d|after_or_equal:date_from',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $eventId = $request->event_id;

        // === BASE QUERY ===
        $baseQuery = EventAttendance::where('event_id', $eventId);

        $filteredQuery = clone $baseQuery;

        if ($request->filled('user_id_no')) {
            $filteredQuery->where('user_id_no', $request->user_id_no);
        }
        if ($request->filled('checkpoint')) {
            $filteredQuery->where('checkpoint', $request->checkpoint);
        }
        if ($request->filled('date_from')) {
            $filteredQuery->whereDate('attended_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $filteredQuery->whereDate('attended_at', '<=', $request->date_to);
        }

        // === PAGINATION ===
        $perPage = $request->input('per_page', 15);
        $attendances = $filteredQuery->orderBy('attended_at', 'desc')->paginate($perPage);

        // === EVENT SANCTION SETTLEMENTS ===
        $settlementsQuery = EventSanctionSettlement::where('event_id', $eventId)
            ->where('is_void', 0);

        if ($request->filled('user_id_no')) {
            $settlementsQuery->where('user_id_no', $request->user_id_no);
        }

        $settlements = $settlementsQuery->orderBy('created_at', 'desc')->get();

        // === COUNTS ===
        $counts = [
            'total_all' => $baseQuery->count(),
            'total_with_user' => $request->filled('user_id_no')
                ? (clone $baseQuery)->where('user_id_no', $request->user_id_no)->count()
                : null,
            'total_with_checkpoint' => $request->filled('checkpoint')
                ? (clone $baseQuery)->where('checkpoint', $request->checkpoint)->count()
                : null,
            'total_with_date_range' => ($request->filled('date_from') || $request->filled('date_to'))
                ? (clone $baseQuery)
                    ->when($request->filled('date_from'), fn($q) => $q->whereDate('attended_at', '>=', $request->date_from))
                    ->when($request->filled('date_to'), fn($q) => $q->whereDate('attended_at', '<=', $request->date_to))
                    ->count()
                : null,
            'total_filtered' => $attendances->total(),
        ];

        // === TRANSFORM ===
        $attendances->getCollection()->transform(function ($attendance) {
            $attendance->location = $attendance->location_coordinates;
            unset($attendance->location_coordinates);

            return $attendance;
        });

        return response()->json([
            'message' => 'Attendances and settlements retrieved successfully.',
            'data' => [
                'attendances' => $attendances->items(),
                'settlements' => $settlements,
            ],
            'meta' => [
                'current_page' => $attendances->currentPage(),
                'per_page' => $attendances->perPage(),
                'total' => $attendances->total(),
                'last_page' => $attendances->lastPage(),
            ],
            'counts' => array_filter($counts, fn($v) => $v !== null),
        ], 200);
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
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'event_id' => 'required|exists:events,id',
            'user_id_no' => 'required|string|max:255',
            'checkpoint' => [
                'required',
                'string',
                'in:start_time,end_time,first_start_time,first_end_time,second_start_time,second_end_time',
            ],
            'location_coordinates' => 'required|array',
            'location_coordinates.lat' => 'required|numeric|between:-90,90',
            'location_coordinates.lng' => 'required|numeric|between:-180,180',
            'device_user_id_no' => 'required|string|max:255',
            'device_model' => 'required|string|max:255',
            'user_id_no' => [
                Rule::unique('event_attendances')
                    ->where(
                        fn($q) => $q
                            ->where('event_id', $request->event_id)
                            ->where('checkpoint', $request->checkpoint)
                    ),
            ],
        ], [
            'checkpoint.in' => 'Invalid checkpoint. Must be one of the event time fields.',
            'user_id_no.unique' => 'You have already attended this checkpoint for this event.',
            'location_coordinates.required' => 'Location coordinates are required.',
        ]);

        \Log::info('Validated data:', $validated);

        try {
            $event = Event::with('location')->findOrFail($validated['event_id']);
            $checkpoint = $validated['checkpoint'];

            // Validate checkpoint exists in event
            if (empty($event->{$checkpoint})) {
                return response()->json([
                    'message' => "The checkpoint '{$checkpoint}' is not scheduled for this event."
                ], 422);
            }

            $point = [
                'lat' => $validated['location_coordinates']['lat'],
                'lng' => $validated['location_coordinates']['lng'],
            ];

            // Geofence check
            if ($event->location && $event->location->polygon_points) {
                $polygon = $event->location->polygon_points;
                $isInside = $this->pointInPolygon($point, $polygon);

                if (!$isInside) {
                    $distance = $this->minDistanceToPolygon($point, $polygon);
                    if ($distance > 70) {
                        return response()->json([
                            'message' => "Can't record attendance right now, you are " . round($distance) . " meters away from event location."
                        ], 403);
                    }
                }
            }

            // --- START: Strict mode check ---
            $modeConfig = DB::table('event_attendance_mode_configs')->orderBy('id')->first();

            if ($modeConfig && $modeConfig->is_strict_mode == 1) {
                $user = DB::table('users')
                    ->where('user_id_no', $validated['device_user_id_no'])
                    ->first();

                if (!$user) {
                    return response()->json([
                        'message' => "Device user ID not registered."
                    ], 403);
                }

                $isModerator = DB::table('user_moderators')
                    ->where('user_id', $user->id)
                    ->where('is_removed', 0)
                    ->exists();

                if (!$isModerator) {
                    return response()->json([
                        'message' => "User is not authorized as a moderator."
                    ], 403);
                }
            }
            // --- END: Strict mode check ---

            // Only proceed if inside geofence (or no geofence defined)
            $attendance = EventAttendance::create([
                'event_id' => $validated['event_id'],
                'user_id_no' => $validated['user_id_no'],
                'checkpoint' => $checkpoint,
                'attended_at' => now(),
                'location_coordinates' => $point,
                'device_user_id_no' => $validated['device_user_id_no'],
                'device_model' => $validated['device_model'],
            ]);

            return response()->json([
                'message' => 'Attendance recorded successfully.',
                'data' => $attendance,
            ], 201);

        } catch (Exception $e) {
            \Log::error('Attendance store error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to record attendance. Please try again later.'
            ], 500);
        }
    }

    private function pointInPolygon(array $point, array $polygon): bool
    {
        $x = $point['lng'];
        $y = $point['lat'];
        $n = count($polygon);
        $inside = false;

        for ($i = 0, $j = $n - 1; $i < $n; $j = $i++) {
            $xi = $polygon[$i]['lng'];
            $yi = $polygon[$i]['lat'];
            $xj = $polygon[$j]['lng'];
            $yj = $polygon[$j]['lat'];

            if (
                (($yi > $y) != ($yj > $y)) &&
                ($x < $xi + ($xj - $xi) * ($y - $yi) / ($yj - $yi + 1e-9))
            ) {  // Added small epsilon to avoid division by zero
                $inside = !$inside;
            }
        }

        return $inside;
    }

    private function haversine(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $R = 6371000; // Earth radius in meters
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLon / 2) * sin($dLon / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return $R * $c;
    }

    private function distanceToSegment(array $p, array $a, array $b): float
    {
        $ax = $a['lng'];
        $ay = $a['lat'];
        $bx = $b['lng'];
        $by = $b['lat'];
        $px = $p['lng'];
        $py = $p['lat'];

        $abx = $bx - $ax;
        $aby = $by - $ay;
        $apx = $px - $ax;
        $apy = $py - $ay;

        $proj = $apx * $abx + $apy * $aby;
        $len2 = $abx * $abx + $aby * $aby;

        if ($len2 == 0) {
            return $this->haversine($py, $px, $ay, $ax);
        }

        $t = max(0, min(1, $proj / $len2));

        $projx = $ax + $t * $abx;
        $projy = $ay + $t * $aby;

        return $this->haversine($py, $px, $projy, $projx);
    }

    private function minDistanceToPolygon(array $point, array $polygon): float
    {
        $n = count($polygon);
        $minDist = PHP_FLOAT_MAX;

        for ($i = 0; $i < $n; $i++) {
            $j = ($i + 1) % $n;
            $dist = $this->distanceToSegment($point, $polygon[$i], $polygon[$j]);
            if ($dist < $minDist) {
                $minDist = $dist;
            }
        }

        return $minDist;
    }

    /**
     * Display the specified resource.
     */
    public function show(EventAttendance $eventAttendance)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(EventAttendance $eventAttendance)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, EventAttendance $eventAttendance)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EventAttendance $eventAttendance)
    {
        //
    }

    public function getStudentSanctionsAPI(Request $request)
    {
        // ==========================================================
        // 1. Validate and normalize input
        // ==========================================================
        $userIdNos = $request->query('user_id_no', []);

        if (is_string($userIdNos)) {
            $userIdNos = [$userIdNos];
        }

        if (empty($userIdNos) || !is_array($userIdNos)) {
            return response()->json([
                'success' => false,
                'message' => 'user_id_no[] is required.',
                'data' => []
            ], 400);
        }

        // ==========================================================
        // 2. Validate user existence in users table
        // ==========================================================
        $validUsers = User::whereIn('user_id_no', $userIdNos)
            ->pluck('user_id_no')
            ->toArray();

        if (empty($validUsers)) {
            return response()->json([
                'success' => false,
                'message' => 'Provided user_id_no(s) do not exist in the system.',
                'data' => []
            ], 404);
        }

        // Only allow valid users to continue (prevents useless API calls)
        $userIdNos = $validUsers;


        // ==========================================================
        // 3. Fetch Enrollment API
        // ==========================================================
        $response = Http::withToken(env('API_ENROLLMENT_SYSTEM_TOKEN'))
            ->get(env('API_ENROLLMENT_SYSTEM_URL') . '/api/student-enrollment', [
                'user_id_no' => $userIdNos
            ]);

        if (!$response->successful()) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch enrollment data.',
                'data' => []
            ], 500);
        }

        $payloads = $response->json();

        if (empty($payloads)) {
            return response()->json([
                'success' => true,
                'message' => 'No enrollments found.',
                'data' => []
            ]);
        }

        // ==========================================================
        // 4. Extract conditions needed to match events
        // ==========================================================
        $conditions = [];

        foreach ($payloads as $payload) {
            if (empty($payload['enrolled_students']))
                continue;

            foreach ($payload['enrolled_students'] as $enroll) {
                $ys = $enroll['year_section'];

                $conditions[] = [
                    'school_year' => $ys['school_year']['id'],
                    'course_id' => $ys['course']['id'],
                    'year_level' => $ys['year_level']['id'],
                ];
            }
        }

        if (empty($conditions)) {
            return response()->json([
                'success' => true,
                'message' => 'No enrollments found.',
                'data' => []
            ]);
        }


        // ==========================================================
        // 5. Exclude events already settled by this user
        // ==========================================================
        $settledEventIds = EventSanctionSettlement::whereIn('user_id_no', $userIdNos)
            ->where('is_void', 0) // only consider non-voided settlements
            ->pluck('event_id')
            ->toArray();


        // ==========================================================
        // 6. Fetch events that match enrollment AND not settled
        // ==========================================================
        $query = Event::where('is_cancelled', 0)
            ->where('status', 1)
            ->whereNotIn('id', $settledEventIds) // << EXCLUDE already settled
            ->whereDate('event_date', '<=', now()) // << EXCLUDE future events
            ->with(['location', 'sanction', 'attendances']);

        $query->where(function ($q) use ($conditions) {
            foreach ($conditions as $cond) {
                $q->orWhere(function ($sub) use ($cond) {
                    $sub->where('school_year_id', $cond['school_year'])
                        ->whereJsonContains('participant_course_id', $cond['course_id'])
                        ->whereJsonContains('participant_year_level_id', $cond['year_level']);
                });
            }
        });

        $events = $query->orderByDesc('event_date')
            ->orderByDesc('created_at')
            ->get()
            ->unique('id')
            ->values();


        // ==========================================================
        // 7. Prepare Totals
        // ==========================================================
        $totalMonetary = 0;
        $totalServiceTime = 0;

        $userId = $userIdNos[0]; // the system seems to support only 1 user at a time


        // ==========================================================
        // 8. Map event + calculate sanctions
        // ==========================================================
        $events = $events->map(function ($event) use ($userId, &$totalMonetary, &$totalServiceTime) {

            // Determine required checkpoints
            $required = [];

            if ($event->attendance_type === 'single') {
                if ($event->start_time)
                    $required[] = 'start_time';
                if ($event->end_time)
                    $required[] = 'end_time';
            } else {
                if ($event->first_start_time)
                    $required[] = 'first_start_time';
                if ($event->first_end_time)
                    $required[] = 'first_end_time';
                if ($event->second_start_time)
                    $required[] = 'second_start_time';
                if ($event->second_end_time)
                    $required[] = 'second_end_time';
            }

            // Fetch attendance
            $attended = $event->attendances
                ->where('user_id_no', $userId)
                ->pluck('checkpoint')
                ->toArray();

            // Identify missing checkpoints
            $missing = array_values(array_diff($required, $attended));

            $sanctionApplied = null;

            if (count($missing) > 0 && $event->sanction) {
                $sanctionApplied = $event->sanction;
                $missingCount = count($missing);

                // Monetary
                if ($event->sanction->sanction_type === 'monetary') {
                    $totalMonetary += floatval($event->sanction->monetary_amount) * $missingCount;
                }

                // Service Time
                if ($event->sanction->sanction_type === 'service') {
                    $service = $event->sanction;
                    $units = $service->service_time * $missingCount;

                    $totalServiceTime += $service->service_time_type === 'hours'
                        ? $units * 60
                        : $units;
                }
            }

            return [
                'event' => $event,
                'required_checkpoints' => $required,
                'attended_checkpoints' => $attended,
                'missing_checkpoints' => $missing,
                'sanction_applied' => $sanctionApplied,
            ];
        });

        $events = $events->filter(function ($e) {
            return count($e['missing_checkpoints']) > 0;
        })->values();


        // ==========================================================
        // 9. Response
        // ==========================================================
        return response()->json([
            'success' => true,
            'message' => 'Events fetched successfully.',
            'total_monetary' => $totalMonetary,
            'total_service_minutes' => $totalServiceTime,
            'data' => $events
        ]);
    }


    private function emptyCheckpoints($attendanceType)
    {
        $checkpoints = $attendanceType === 'single'
            ? ['start_time', 'end_time']
            : ['first_start_time', 'first_end_time', 'second_start_time', 'second_end_time'];

        $empty = [];
        foreach ($checkpoints as $cp) {
            $empty[$cp] = ['users' => []];
        }
        return $empty;
    }


    // WEB
    public function showMyEventAttendanceWeb(Request $request): JsonResponse
    {
        $request->validate([
            'event_id' => 'required|exists:events,id',
            'user_id_no' => 'nullable|string|max:255',
            'checkpoint' => 'nullable|in:start_time,end_time,first_start_time,first_end_time,second_start_time,second_end_time',
            'date_from' => 'nullable|date_format:Y-m-d',
            'date_to' => 'nullable|date_format:Y-m-d|after_or_equal:date_from',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $eventId = $request->event_id;

        // === BASE QUERY ===
        $baseQuery = EventAttendance::with(['event'])
            ->where('event_id', $eventId);

        $filteredQuery = clone $baseQuery;

        if ($request->filled('user_id_no')) {
            $filteredQuery->where('user_id_no', $request->user_id_no);
        }

        if ($request->filled('checkpoint')) {
            $filteredQuery->where('checkpoint', $request->checkpoint);
        }

        if ($request->filled('date_from')) {
            $filteredQuery->whereDate('attended_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $filteredQuery->whereDate('attended_at', '<=', $request->date_to);
        }

        // === PAGINATION ===
        $perPage = $request->input('per_page', 15);
        $attendances = $filteredQuery->orderBy('attended_at', 'desc')->paginate($perPage);

        // === EVENT SANCTION SETTLEMENTS ===
        $settlementsQuery = EventSanctionSettlement::with(['sanction'])
            ->where('event_id', $eventId);

        if ($request->filled('user_id_no')) {
            $settlementsQuery->where('user_id_no', $request->user_id_no);
        }

        $settlements = $settlementsQuery->orderBy('created_at', 'desc')->get();

        // === COUNTS WITHOUT ANOMALIES ===
        $counts = [
            'total_all' => $baseQuery->count(),

            'total_with_user' => $request->filled('user_id_no')
                ? (clone $baseQuery)->where('user_id_no', $request->user_id_no)->count()
                : null,

            'total_with_checkpoint' => $request->filled('checkpoint')
                ? (clone $baseQuery)->where('checkpoint', $request->checkpoint)->count()
                : null,

            'total_with_date_range' => ($request->filled('date_from') || $request->filled('date_to'))
                ? (clone $baseQuery)
                    ->when($request->filled('date_from'), fn($q) => $q->whereDate('attended_at', '>=', $request->date_from))
                    ->when($request->filled('date_to'), fn($q) => $q->whereDate('attended_at', '<=', $request->date_to))
                    ->count()
                : null,
        ];

        $counts['total_filtered'] = $attendances->total();

        // === TRANSFORM ===
        $attendances->getCollection()->transform(function ($attendance) {
            $attendance->location = $attendance->location_coordinates;
            unset($attendance->location_coordinates);

            return $attendance;
        });

        return $this->index($request);
    }

}
