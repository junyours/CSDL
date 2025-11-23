<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserModerator;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserModeratorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $moderators = UserModerator::with('user')
            ->where('is_removed', false)
            ->get();

        return response()->json($moderators);
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
        // Validate the input as string
        $request->validate([
            'user_id_no' => [
                'required',
                'string',
                'exists:users,user_id_no',
            ],
        ]);

        // Find the user by user_id_no
        $user = User::where('user_id_no', $request->user_id_no)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // Check if moderator already exists
        $moderator = UserModerator::where('user_id', $user->id)->first();

        if ($moderator) {
            // If it was removed, restore it
            $moderator->is_removed = false;
            $moderator->save();
        } else {
            // Create new moderator
            $moderator = UserModerator::create([
                'user_id' => $user->id,
                'is_removed' => false,
            ]);
        }

        // Load the user relationship
        $moderator->load('user');

        return response()->json($moderator);
    }


    /**
     * Display the specified resource.
     */
    public function show(UserModerator $userModerator)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(UserModerator $userModerator)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UserModerator $userModerator)
    {
        $userModerator->is_removed = true;
        $userModerator->save();

        return response()->json(['message' => 'Moderator removed successfully']);
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(UserModerator $userModerator)
    {
        $userModerator->is_removed = true;
        $userModerator->save();

        return response()->json(['message' => 'Moderator removed successfully']);
    }
}
