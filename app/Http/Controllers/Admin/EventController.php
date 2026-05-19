<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventAttendance;
use App\Models\Location;
use App\Models\Notification;
use App\Models\Sanction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use App\Services\SisApiService;

class EventController extends Controller
{

    // public function index(Request $request, SisApiService $sisApi)
    // {
    //     $search = $request->input('search');

    //     // 1. Fetch Paginated Events with Search Filter
    //     $eventsQuery = Event::where('status', true)
    //         ->where('creator_user_id', auth()->id())
    //         ->when($search, function ($query, $search) {
    //             $query->where('event_name', 'like', "%{$search}%");
    //         })
    //         ->orderBy('event_date', 'desc')
    //         ->paginate(20)
    //         ->withQueryString();

    //     // 2. Fetch external structure data
    //     $response = $sisApi->get('/api/school-structure');
    //     $schoolStructure = $response->ok() ? ($response->json() ?? []) : [];

    //     // Safely extract arrays
    //     $schoolYears = $schoolStructure['school_years'] ?? [];
    //     $departments = $schoolStructure['departments'] ?? [];
    //     $yearLevels = $schoolStructure['year_levels'] ?? [];

    //     // Create lookup maps
    //     $schoolYearMap = collect($schoolYears)->keyBy('id');
    //     $coursesMap = collect($departments)->pluck('course')->flatten(1)->keyBy('id');
    //     $yearLevelsMap = collect($yearLevels)->keyBy('id');
    //     $locationsMap = Location::all()->keyBy('id');
    //     $sanctionsMap = Sanction::all()->keyBy('id');

    //     // 3. Transform the collection inside the paginator
    //     $eventsQuery->getCollection()->transform(function ($event) use ($schoolYearMap, $coursesMap, $yearLevelsMap, $locationsMap, $sanctionsMap) {
    //         $participantCourseIds = $event->participant_course_id ?? [];
    //         $participantCourses = collect($participantCourseIds)->map(fn($id) => $coursesMap[$id] ?? null)->filter();

    //         $participantYearLevelIds = $event->participant_year_level_id ?? [];
    //         $participantYearLevels = collect($participantYearLevelIds)->map(fn($id) => $yearLevelsMap[$id] ?? null)->filter();

    //         return [
    //             'id' => $event->id,
    //             'event_name' => $event->event_name,
    //             'event_date' => $event->event_date,
    //             'attendance_type' => $event->attendance_type,
    //             'start_time' => $event->start_time,
    //             'end_time' => $event->end_time,
    //             'first_start_time' => $event->first_start_time,
    //             'first_end_time' => $event->first_end_time,
    //             'second_start_time' => $event->second_start_time,
    //             'second_end_time' => $event->second_end_time,
    //             'attendance_duration' => $event->attendance_duration,
    //             'school_year' => $schoolYearMap[$event->school_year_id] ?? null,
    //             'participant_courses' => $participantCourses->values(),
    //             'participant_year_levels' => $participantYearLevels->values(),
    //             'location' => $locationsMap[$event->location_id] ?? null,
    //             'sanction' => $sanctionsMap[$event->sanction_id] ?? null,
    //             'is_cancelled' => $event->is_cancelled,
    //             'status' => $event->status,
    //         ];
    //     });

    //     return inertia('Admin/Events/Index', [
    //         'events' => $eventsQuery,
    //         'filters' => $request->only(['search'])
    //     ]);
    // }


    public function index()
    {
        return Inertia::render('Maintenance');

    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'school_year_id' => 'required|integer',
            'event_name' => 'required|string|max:255',
            'location_id' => 'required|exists:locations,id',
            'event_date' => 'required|date',

            'attendance_type' => ['required', Rule::in(['single', 'double'])],

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

            'participant_course_id' => $validated['participant_course_id'],
            'participant_year_level_id' => $validated['participant_year_level_id'],

            'sanction_id' => $validated['sanction_id'],
        ]);

        /*
        |--------------------------------------------------------------------------
        | CREATE NOTIFICATION
        |--------------------------------------------------------------------------
        */
        $location = Location::find($validated['location_id']); // ensure your model exists

        $notifMessage =
            'Heads up! There will be ' . $validated['event_name'] . ' event on ' .
            date('F j, Y', strtotime($validated['event_date'])) . ', at ' .
            ($location ? $location->location_name : 'Unknown Location') .
            "\n\nCheck your event activities for more info.";

        Notification::create([
            'courses_id' => $validated['participant_course_id'],
            'year_levels_id' => $validated['participant_year_level_id'],
            'notifiable_type' => "event",
            'data' => $notifMessage,
            'created_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Event created successfully',
            'data' => $event,
        ], 201);
    }

    public function create(Request $request, SisApiService $sisApi)
    {
        $sanctions = Sanction::where('status', 1)->get();
        $locations = Location::where('status', 1)->get();

        try {
            $schoolStructure = $this->fetchSchoolStructure($request, $sisApi);
        } catch (\Exception $e) {
            $schoolStructure = null;
        }

        return response()->json([
            'sanctions' => $sanctions,
            'locations' => $locations,
            'school_structure' => $schoolStructure,
        ]);
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

    public function edit(Request $request, Event $event, SisApiService $sisApi)
    {
        $sanctions = Sanction::where('status', 1)->get();
        $locations = Location::where('status', 1)->get();

        try {
            $schoolStructure = $this->fetchSchoolStructure($request, $sisApi);
        } catch (\Exception $e) {
            $schoolStructure = null;
        }

        return response()->json([
            'event' => $event,
            'sanctions' => $sanctions,
            'locations' => $locations,
            'school_structure' => $schoolStructure,
        ]);
    }

    public function update(Request $request, Event $event)
    {
        $validator = Validator::make($request->all(), [
            'school_year_id' => 'required|integer',
            'event_name' => 'required|string|max:255',
            'location_id' => 'required|exists:locations,id',
            'event_date' => 'required|date',

            'attendance_type' => ['required', Rule::in(['single', 'double'])],

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

            'is_cancelled' => 'boolean',
            'status' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        // Construct the update data
        $updateData = [
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

            'participant_course_id' => $validated['participant_course_id'],
            'participant_year_level_id' => $validated['participant_year_level_id'],

            'sanction_id' => $validated['sanction_id'],
            'is_cancelled' => $validated['is_cancelled'] ?? false,
            'status' => $validated['status'] ?? true,
        ];

        // Fill the model to set attributes (without saving)
        $event->fill($updateData);

        // Now track pending changes
        $changes = $event->getDirty();
        $willBeCancelled = $event->is_cancelled === true;

        // Save the changes
        $event->save();

        // Only send notification if something meaningful changed
        $relevantFields = [
            'event_name',
            'event_date',
            'location_id',
            'attendance_type',
            'start_time',
            'end_time',
            'first_start_time',
            'first_end_time',
            'second_start_time',
            'second_end_time',
            'attendance_duration',
            'participant_course_id',
            'participant_year_level_id',
            'sanction_id',
            'is_cancelled'
        ];

        $hasRelevantChanges = collect($relevantFields)->some(fn($field) => in_array($field, array_keys($changes)));

        if ($hasRelevantChanges) {
            $location = Location::find($event->location_id);

            if ($willBeCancelled && $event->is_cancelled) {
                // Cancellation notification
                $notifMessage = "Important: The event '{$event->event_name}' scheduled on " .
                    date('F j, Y', strtotime($event->event_date)) .
                    " at " . ($location?->location_name ?? 'Unknown Location') .
                    " has been CANCELLED.";

                $notifType = "Event cancelled";
            } else {
                // Regular update notification
                $notifMessage = "Update: The event '{$event->event_name}' on " .
                    date('F j, Y', strtotime($event->event_date)) .
                    " at " . ($location?->location_name ?? 'Unknown Location') .
                    " has been updated.\n\nPlease check the latest details in your event activities.";

                $notifType = "Event updated";
            }

            Notification::create([
                'courses_id' => $event->participant_course_id,
                'year_levels_id' => $event->participant_year_level_id,
                'notifiable_type' => $notifType,
                'data' => $notifMessage,
                'created_at' => now(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Event updated successfully',
            'data' => $event,
        ], 200);
    }

    public function show(Request $request, Event $event, SisApiService $sisApi)
    {
        // 1. Fetch external structure data (needed for mapping IDs to names)
        $response = $sisApi->get('/api/school-structure');
        $schoolStructure = $response->ok() ? ($response->json() ?? []) : [];

        $schoolYears = $schoolStructure['school_years'] ?? [];
        $departments = $schoolStructure['departments'] ?? [];
        $yearLevels = $schoolStructure['year_levels'] ?? [];

        // 2. Create lookup maps
        $schoolYearMap = collect($schoolYears)->keyBy('id');
        $coursesMap = collect($departments)->pluck('course')->flatten(1)->keyBy('id');
        $yearLevelsMap = collect($yearLevels)->keyBy('id');

        // 3. Map participant names/details
        $participantCourses = collect($event->participant_course_id ?? [])
            ->map(fn($id) => $coursesMap[$id] ?? null)
            ->filter();

        $participantYearLevels = collect($event->participant_year_level_id ?? [])
            ->map(fn($id) => $yearLevelsMap[$id] ?? null)
            ->filter();

        // 4. Transform the single event object and include attendances
        $eventData = [
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
            'school_year' => $schoolYearMap[$event->school_year_id] ?? null,
            'participant_courses' => $participantCourses->values(),
            'participant_year_levels' => $participantYearLevels->values(),
            'location' => Location::find($event->location_id),
            'sanction' => Sanction::find($event->sanction_id),
            'is_cancelled' => (bool) $event->is_cancelled,
            'status' => (bool) $event->status,
            'event_attendances' => EventAttendance::where('event_id', $event->id)
                ->orderBy('attended_at', 'desc')
                ->get(),
        ];

        return Inertia::render('Admin/Events/Show', [
            'event' => $eventData
        ]);
    }

}
