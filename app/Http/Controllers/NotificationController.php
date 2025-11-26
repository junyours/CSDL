<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\NotificationUser;
use Auth;
use DB;
use Illuminate\Http\Request;

class NotificationController extends Controller
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
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Notification $notification)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Notification $notification)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Notification $notification)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Notification $notification)
    {
        //
    }

    public function getUserNotifications(Request $request)
    {
        $courseId = (int) $request->course_id;
        $yearLevelId = (int) $request->year_level_id;
        $userId = auth()->id(); // or from request if mobile auth is different

        $notifications = Notification::query()
            ->leftJoin('notification_users', function ($join) use ($userId) {
                $join->on('notifications.id', '=', 'notification_users.notification_id')
                    ->where('notification_users.user_id', '=', $userId);
            })
            ->where(function ($q) use ($courseId) {
                $q->whereJsonContains('courses_id', $courseId)
                    ->orWhereNull('courses_id')
                    ->orWhere('courses_id', '[]');
            })
            ->where(function ($q) use ($yearLevelId) {
                $q->whereJsonContains('year_levels_id', $yearLevelId)
                    ->orWhereNull('year_levels_id')
                    ->orWhere('year_levels_id', '[]');
            })
            ->orderBy('notifications.created_at', 'desc')
            ->get([
                'notifications.*',
                'notification_users.is_read',
                'notification_users.read_at',
            ]);

        return response()->json($notifications);
    }


    public function markAsRead(Request $request)
    {
        $request->validate([
            'notification_id' => 'required|integer'
        ]);

        $userId = auth()->id();

        DB::table('notification_users')
            ->updateOrInsert(
                ['notification_id' => $request->notification_id, 'user_id' => $userId],
                ['is_read' => true, 'read_at' => now()]
            );

        return response()->json(['message' => 'Notification marked as read']);
    }

}
