<?php

namespace App\Http\Controllers;

use App\Models\NotificationUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class NotificationUserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $notifications = DB::table('notification_users')
            ->join('notifications', 'notification_users.notification_id', '=', 'notifications.id')
            ->where('notification_users.user_id', Auth::id())
            ->select(
                'notification_users.id as pivot_id',
                'notification_users.is_read',
                'notifications.id',
                'notifications.data',
                'notifications.created_at',
                'notifications.notifiable_type' // <--- Add this line
            )
            ->orderBy('notifications.created_at', 'desc')
            ->get()
            ->map(function ($item) {
                // Ensure data is decoded for the frontend
                $item->data = is_string($item->data) ? json_decode($item->data) : $item->data;
                return $item;
            });

        return response()->json($notifications);
    }

    public function markAllRead()
    {
        try {
            DB::table('notification_users')
                ->where('user_id', Auth::id())
                ->where('is_read', false) // Only update what is unread
                ->update(['is_read' => true]);

            return response()->json([
                'message' => 'All notifications marked as read',
                'status' => 'success'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update notifications',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function markAsRead($id)
    {
        DB::table('notification_users')
            ->where('user_id', Auth::id())
            ->where('notification_id', $id) // Match the specific notification
            ->update(['is_read' => true]);

        return response()->json(['status' => 'success']);
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
    public function show(NotificationUser $notificationUser)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(NotificationUser $notificationUser)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, NotificationUser $notificationUser)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(NotificationUser $notificationUser)
    {
        //
    }
}
