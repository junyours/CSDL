<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Location;
use App\Models\Notification;
use App\Models\Sanction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class EventController extends Controller
{

    public function index()
    {
        // 1. Fetch all active events
        $events = Event::where('status', true)
            ->orderBy('event_date', 'desc')
            ->get();

        // 2. Fetch school structure from external API
        $response = Http::withToken(env('API_ENROLLMENT_SYSTEM_TOKEN'))
            ->get(env('API_ENROLLMENT_SYSTEM_URL') . '/api/school-structure');

        if (!$response->ok()) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch school structure from API'
            ], 500);
        }

        $schoolStructure = $response->json() ?? [];

        // Safely extract arrays
        $schoolYears = $schoolStructure['school_years'] ?? [];
        $departments = $schoolStructure['departments'] ?? [];
        $yearLevels = $schoolStructure['year_levels'] ?? [];

        // Create lookup maps
        $schoolYearMap = collect($schoolYears)->keyBy('id');

        $coursesMap = collect($departments)
            ->pluck('course')
            ->flatten(1)
            ->keyBy('id');

        $yearLevelsMap = collect($yearLevels)->keyBy('id');


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

        return inertia('Admin/Events/Index', ['events' => $events]);
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
            'notifiable_type' => "New event invitation",
            'data' => $notifMessage,
            'created_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Event created successfully',
            'data' => $event,
        ], 201);
    }

    public function create()
    {
        $sanctions = Sanction::where('status', 1)->get();
        $locations = Location::where('status', 1)->get();

        // Fetch school structure from API
        $response = $this->fetchSchoolStructureAPI(request());
        $schoolStructure = $response->getData()->data ?? null;

        return response()->json([
            'sanctions' => $sanctions,
            'locations' => $locations,
            'school_structure' => $schoolStructure,
        ]);
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

    public function edit(Event $event)
    {
        $sanctions = Sanction::where('status', 1)->get();
        $locations = Location::where('status', 1)->get();

        // Fetch school structure from API
        $response = $this->fetchSchoolStructureAPI(request());
        $schoolStructure = $response->getData()->data ?? null;

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

}
