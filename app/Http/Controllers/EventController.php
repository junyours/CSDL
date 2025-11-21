<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventAttendance;
use App\Models\Location;
use App\Models\Sanction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Http;

class EventController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function index()
    {
        // 1. Fetch all active events
        $events = Event::where('status', true)->get();

        // 2. Fetch school structure from external API
        $response = Http::withToken(env('API_ENROLLMENT_SYSTEM_TOKEN'))
            ->get(env('API_ENROLLMENT_SYSTEM_URL') . '/api/school-structure');

        if (!$response->ok()) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch school structure from API'
            ], 500);
        }

        $schoolStructure = $response->json();

        // Create lookup maps for quick access
        $schoolYearMap = collect($schoolStructure['school_years'])
            ->keyBy('id');
        $coursesMap = collect($schoolStructure['departments'])
            ->pluck('course') //
            ->flatten(1)
            ->keyBy('id');
        $yearLevelsMap = collect($schoolStructure['year_levels'])
            ->keyBy('id'); // key by year_level_id

        // Fetch all locations and sanctions for mapping
        $locationsMap = Location::all()->keyBy('id');
        $sanctionsMap = Sanction::all()->keyBy('id');

        // 3. Attach related data for each event
        $events = $events->map(function ($event) use ($schoolYearMap, $coursesMap, $yearLevelsMap, $locationsMap, $sanctionsMap) {
            // Semester with School Year
            $schoolYear = $schoolYearMap[$event->school_year_id] ?? null;

            // Participant Courses (already an array)
            $participantCourseIds = $event->participant_course_id ?? [];
            $participantCourses = collect($participantCourseIds)->map(function ($id) use ($coursesMap) {
                return $coursesMap[$id] ?? null;
            })->filter();

            // Participant Year Levels (already an array)
            $participantYearLevelIds = $event->participant_year_level_id ?? [];
            $participantYearLevels = collect($participantYearLevelIds)->map(function ($id) use ($yearLevelsMap) {
                return $yearLevelsMap[$id] ?? null;
            })->filter();

            // Location
            $location = $locationsMap[$event->location_id] ?? null;

            // Sanction
            $sanction = $sanctionsMap[$event->sanction_id] ?? null;

            return [
                'id' => $event->id,
                'event_name' => $event->event_name,
                'event_date' => $event->event_date,
                'attendance_type' => $event->attendance_type,
                'start_time' => $event->start_time,
                'end_time' => $event->end_time,
                'first_start_time' => $event->first_start_time,
                'first_end_time' => $event->first_end_time,
                'second_start_time' => $event->second_start_time,
                'second_end_time' => $event->second_end_time,
                'attendance_duration' => $event->attendance_duration,
                'school_year' => $schoolYear,
                'participant_courses' => $participantCourses->values(),
                'participant_year_levels' => $participantYearLevels->values(),
                'location' => $location,
                'sanction' => $sanction,
                'is_cancelled' => $event->is_cancelled,
                'status' => $event->status,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $events,
        ]);
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
        $validator = Validator::make($request->all(), [
            'school_year_id' => 'required|integer',
            'event_name' => 'required|string|max:255',
            'location_id' => 'required|exists:locations,id',
            'event_date' => 'required|date',

            'attendance_type' => ['required', Rule::in(['single', 'double'])],

            // conditional validation
            'start_time' => 'required_if:attendance_type,single|date_format:H:i',
            'end_time' => 'required_if:attendance_type,single|date_format:H:i|after:start_time',

            'first_start_time' => 'required_if:attendance_type,double|date_format:H:i',
            'first_end_time' => 'required_if:attendance_type,double|date_format:H:i|after:first_start_time',
            'second_start_time' => 'required_if:attendance_type,double|date_format:H:i',
            'second_end_time' => 'required_if:attendance_type,double|date_format:H:i|after:second_start_time',

            'attendance_duration' => 'required|integer|min:1',

            'participant_course_id' => 'required|array',
            'participant_course_id.*' => 'integer',

            'participant_year_level_id' => 'required|array',
            'participant_year_level_id.*' => 'integer',

            'sanction_id' => 'required|exists:sanctions,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        $event = Event::create([
            'school_year_id' => $validated['school_year_id'],
            'event_name' => $validated['event_name'],
            'location_id' => $validated['location_id'],
            'event_date' => $validated['event_date'],
            'attendance_type' => $validated['attendance_type'],

            'start_time' => $validated['start_time'] ?? null,
            'end_time' => $validated['end_time'] ?? null,
            'first_start_time' => $validated['first_start_time'] ?? null,
            'first_end_time' => $validated['first_end_time'] ?? null,
            'second_start_time' => $validated['second_start_time'] ?? null,
            'second_end_time' => $validated['second_end_time'] ?? null,

            'attendance_duration' => $validated['attendance_duration'],

            // Store as arrays, not encoded strings
            'participant_course_id' => $validated['participant_course_id'],
            'participant_year_level_id' => $validated['participant_year_level_id'],

            'sanction_id' => $validated['sanction_id'],
        ]);


        return response()->json([
            'success' => true,
            'message' => 'Event created successfully',
            'data' => $event,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Event $event)
    {
        //
    }

    public function showMyEvents(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'participant_course_id' => 'required',
            'participant_year_level_id' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $courseId = (int) $request->participant_course_id;
        $yearLevelId = (int) $request->participant_year_level_id;

        // Fetch events matching course & year level
        $events = Event::with(['location', 'sanction'])
            ->where('status', 1)
            ->whereJsonContains('participant_course_id', $courseId)
            ->whereJsonContains('participant_year_level_id', $yearLevelId)
            ->orderBy('event_date', 'asc')
            ->get();


        return response()->json([
            'success' => true,
            'message' => 'Events fetched successfully.',
            'data' => $events,
        ], 200);
    }


    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Event $event)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Event $event)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Event $event)
    {
        //
    }

    public function getStudentEventsAPI(Request $request)
    {
        // Accept user_id_no[] as array
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

        // 1. Single call to external API with array of user_id_no
        $apiToken = env('API_ENROLLMENT_SYSTEM_TOKEN');
        $apiUrl = env('API_ENROLLMENT_SYSTEM_URL');

        $response = Http::withToken($apiToken)
            ->get("{$apiUrl}/api/student-enrollment", [
                'user_id_no' => $userIdNos
            ]);

        if (!$response->successful()) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch enrollment data.',
                'data' => []
            ], 500);
        }

        $payloads = $response->json(); // Array of student objects

        if (empty($payloads)) {
            return response()->json([
                'success' => true,
                'message' => 'No enrollments found.',
                'data' => []
            ]);
        }

        // 2. Collect ALL enrollment conditions from ALL students
        $conditions = [];

        foreach ($payloads as $payload) {
            if (empty($payload['enrolled_students']))
                continue;

            foreach ($payload['enrolled_students'] as $enrollment) {
                $ys = $enrollment['year_section'];
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

        // 3. Build OR query across ALL conditions
        $query = Event::where('is_cancelled', 0)
            ->where('status', 1)
            ->with(['location', 'sanction']);

        $query->where(function ($q) use ($conditions) {
            foreach ($conditions as $cond) {
                $q->orWhere(function ($sub) use ($cond) {
                    $sub->where('school_year_id', $cond['school_year'])
                        ->whereJsonContains('participant_course_id', $cond['course_id'])
                        ->whereJsonContains('participant_year_level_id', $cond['year_level']);
                });
            }
        });

        // 4. Get unique events, newest first
        $events = $query->orderByDesc('event_date')
            ->orderByDesc('created_at')
            ->get()
            ->unique('id'); // Remove duplicates if any

        return response()->json([
            'success' => true,
            'message' => 'Events fetched successfully.',
            'data' => $events->values() // Reindex array
        ]);

    }

    public function getEventParticipants($eventId, Request $request)
    {
        // 1. Fetch event
        $event = Event::with(['location', 'sanction'])->findOrFail($eventId);

        if ($event->is_cancelled || !$event->status) {
            return response()->json([
                'success' => false,
                'message' => 'Event is cancelled or inactive.',
                'data' => null
            ], 404);
        }

        $schoolYearId = $event->school_year_id;
        $courseIds = $event->participant_course_id;
        $yearLevelIds = $event->participant_year_level_id;
        $attendanceType = $event->attendance_type;

        // 2. Get all valid checkpoints depending on event type
        $validCheckpoints = [];

        if ($attendanceType === 'single') {
            if ($event->start_time)
                $validCheckpoints[] = 'start_time';
            if ($event->end_time)
                $validCheckpoints[] = 'end_time';
        }

        if ($attendanceType === 'double') {
            foreach ([
                'first_start_time',
                'first_end_time',
                'second_start_time',
                'second_end_time'
            ] as $cp) {
                if ($event->{$cp})
                    $validCheckpoints[] = $cp;
            }
        }

        // Initialize checkpoint counts
        $checkpointCounts = [];
        foreach ($validCheckpoints as $cp) {
            $checkpointCounts[$cp] = ['attended' => 0, 'absent' => 0];
        }

        // 3. Optional checkpoint filter
        $requestedCheckpoint = $request->query('checkpoint');
        if ($requestedCheckpoint && !in_array($requestedCheckpoint, $validCheckpoints)) {
            return response()->json([
                'success' => false,
                'message' => "Invalid checkpoint. Valid options: " . implode(', ', $validCheckpoints)
            ], 400);
        }

        // 4. Optional attended filter
        $filterAttended = $request->query('attended');
        $showAttended = null;
        if ($filterAttended !== null) {
            if (!in_array($filterAttended, ['true', 'false', '1', '0'])) {
                return response()->json([
                    'success' => false,
                    'message' => "Invalid 'attended' filter. Use true or false."
                ], 400);
            }
            $showAttended = filter_var($filterAttended, FILTER_VALIDATE_BOOLEAN);
        }

        // 5. Fetch all student IDs
        $studentIdNos = User::where('user_role', 'student')->pluck('user_id_no')->toArray();

        if (empty($studentIdNos)) {
            return response()->json([
                'success' => true,
                'message' => 'Participants fetched successfully.',
                'event' => $event,
                'participants' => [],
                'checkpoint_counts' => $checkpointCounts
            ]);
        }

        // 6. Request enrollment API
        $token = env('API_ENROLLMENT_SYSTEM_TOKEN');
        $url = env('API_ENROLLMENT_SYSTEM_URL');

        $response = Http::withToken($token)->get("{$url}/api/student-enrollment", [
            'user_id_no' => $studentIdNos
        ]);

        if (!$response->successful()) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch enrollment data.',
                'data' => []
            ], 500);
        }

        $payloads = $response->json();

        // 7. Fetch ALL attendance records for ALL checkpoints
        $attendanceRecords = EventAttendance::where('event_id', $eventId)
            ->select([
                'user_id_no',
                'checkpoint',
                'attended_at',
                'location_coordinates',
                'device_user_id_no',
                'device_model'
            ])
            ->get()
            ->groupBy('user_id_no'); // group PER USER

        // 8. Build participants list
        $participants = [];

        foreach ($payloads as $studentRoot) {

            if (empty($studentRoot['enrolled_students']))
                continue;

            // Check if matches event criteria
            $isValid = false;
            foreach ($studentRoot['enrolled_students'] as $enrollment) {
                $ys = $enrollment['year_section'];
                $enSchoolYear = $ys['school_year']['id'];
                $enCourseId = $ys['course']['id'];
                $enYearLevelId = $ys['year_level']['id'];

                if (
                    $enSchoolYear == $schoolYearId &&
                    in_array($enCourseId, $courseIds) &&
                    in_array($enYearLevelId, $yearLevelIds)
                ) {
                    $isValid = true;
                    break;
                }
            }

            if (!$isValid)
                continue;

            $userIdNo = $studentRoot['user_id_no'];

            // Fetch all attendance for this user
            $userAttendance = $attendanceRecords->get($userIdNo) ?? collect([]);

            // Format per-user attendance into clean array
            $attendanceArray = [];
            $attendanceArray = [];
            foreach ($validCheckpoints as $cp) {
                $found = $userAttendance->firstWhere('checkpoint', $cp);
                $attended = !empty($found);

                // Update checkpoint counts
                if ($attended) {
                    $checkpointCounts[$cp]['attended']++;
                } else {
                    $checkpointCounts[$cp]['absent']++;
                }

                $attendedAt = null;

                if (!empty($found['attended_at'])) {
                    $attendedAt = Carbon::parse($found['attended_at'])
                        ->format('h:i:s A'); // 12-hour format with seconds
                }

                $attendanceArray[] = [
                    'checkpoint' => $cp,
                    'attended_at' => $attendedAt,
                    'location_coordinates' => $found['location_coordinates'] ?? null,
                    'device_user_id_no' => $found['device_user_id_no'] ?? null,
                    'device_model' => $found['device_model'] ?? null,
                ];
            }

            // If filtering by checkpoint+attended
            if ($requestedCheckpoint) {
                $found = collect($attendanceArray)->firstWhere('checkpoint', $requestedCheckpoint);
                $hasAttended = !empty($found);

                if ($showAttended !== null && $hasAttended !== $showAttended) {
                    continue;
                }
            }

            $participants[] = [
                'user_id_no' => $userIdNo,
                'first_name' => $studentRoot['first_name'],
                'last_name' => $studentRoot['last_name'],
                'middle_name' => $studentRoot['middle_name'] ?? null,
                'attendance' => $attendanceArray,
            ];
        }

        // 9. Sort by last name
        usort($participants, fn($a, $b) => strcmp($a['last_name'], $b['last_name']));

        return response()->json([
            'success' => true,
            'message' => 'Participants fetched successfully.',
            'event' => $event,
            'valid_checkpoints' => $validCheckpoints,
            'participants' => $participants,
            'checkpoint_counts' => $checkpointCounts
        ]);
    }





    // WEB
    public function indexWeb()
    {
        // 1. Fetch all active events
        $events = Event::where('status', true)->get();

        // 2. Fetch school structure from external API
        $response = Http::withToken(env('API_ENROLLMENT_SYSTEM_TOKEN'))
            ->get(env('API_ENROLLMENT_SYSTEM_URL') . '/api/school-structure');

        if (!$response->ok()) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch school structure from API'
            ], 500);
        }

        $schoolStructure = $response->json();

        // Create lookup maps for quick access
        $semestersMap = collect($schoolStructure['school_years'])
            ->keyBy('semester.id'); // key by semester_id
        $coursesMap = collect($schoolStructure['departments'])
            ->pluck('courses')
            ->flatten(1)
            ->keyBy('id'); // key by course_id
        $yearLevelsMap = collect($schoolStructure['year_levels'])
            ->keyBy('id'); // key by year_level_id

        // Fetch all locations and sanctions for mapping
        $locationsMap = Location::all()->keyBy('id');
        $sanctionsMap = Sanction::all()->keyBy('id');

        // 3. Attach related data for each event
        $events = $events->map(function ($event) use ($semestersMap, $coursesMap, $yearLevelsMap, $locationsMap, $sanctionsMap) {
            // Semester with School Year
            $semester = $semestersMap[$event->school_year_id] ?? null;

            // Participant Courses (already an array)
            $participantCourseIds = $event->participant_course_id ?? [];
            $participantCourses = collect($participantCourseIds)->map(function ($id) use ($coursesMap) {
                return $coursesMap[$id] ?? null;
            })->filter();

            // Participant Year Levels (already an array)
            $participantYearLevelIds = $event->participant_year_level_id ?? [];
            $participantYearLevels = collect($participantYearLevelIds)->map(function ($id) use ($yearLevelsMap) {
                return $yearLevelsMap[$id] ?? null;
            })->filter();

            // Location
            $location = $locationsMap[$event->location_id] ?? null;

            // Sanction
            $sanction = $sanctionsMap[$event->sanction_id] ?? null;

            return [
                'id' => $event->id,
                'event_name' => $event->event_name,
                'event_date' => $event->event_date,
                'attendance_type' => $event->attendance_type,
                'start_time' => $event->start_time,
                'end_time' => $event->end_time,
                'first_start_time' => $event->first_start_time,
                'first_end_time' => $event->first_end_time,
                'second_start_time' => $event->second_start_time,
                'second_end_time' => $event->second_end_time,
                'attendance_duration' => $event->attendance_duration,
                'semester' => $semester,
                'participant_courses' => $participantCourses->values(),
                'participant_year_levels' => $participantYearLevels->values(),
                'location' => $location,
                'sanction' => $sanction,
                'is_cancelled' => $event->is_cancelled,
                'status' => $event->status,
            ];
        });

        return view('dashboard', compact('events'));
    }

    public function showWeb($id)
    {
        $event = Event::findOrFail($id);

        return view('event-manage', compact('event'));
    }


}
