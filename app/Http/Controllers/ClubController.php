<?php

namespace App\Http\Controllers;

use App\Models\CampusClub;
use App\Models\CampusClubUser;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\CampusClubJoinRequest;

class ClubController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $clubs = CampusClub::select(
            'id',
            'club_name',
            'club_logo_path',
            'club_cbl_file_path',
            'status',
            'created_at'
        )
            ->withCount([
                'members as members_count' => function ($query) {
                    $query->where('is_active', true);
                }
            ])
            ->with([
                'members' => function ($query) {
                    $query->where('is_active', true)
                        ->where('is_admin', 1)
                        ->select('id', 'club_id', 'user_id', 'position', 'is_admin')
                        ->with([
                            'user' => function ($q) {
                                $q->select('id', 'user_id_no', 'profile_photo');
                            }
                        ]);
                }
            ])
            ->get();

        return Inertia::render('Admin/Clubs/Index', [
            'clubs' => $clubs,
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
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $club = CampusClub::with([
            'members.user'
        ])
            ->withCount([
                'members as members_count' => function ($query) {
                    $query->where('is_active', true);
                }
            ])
            ->findOrFail($id);

        $positionOrder = [
            'president',
            'vice_president',
            'secretary',
            'treasurer',
            'auditor',
            'club_coordinator'
        ];

        $members = $club->members()
            ->with('user')
            ->where('is_active', true)
            ->get() // still needed for custom sort
            ->sort(function ($a, $b) use ($positionOrder) {

                if ($a->is_admin != $b->is_admin) {
                    return $b->is_admin <=> $a->is_admin;
                }

                $posA = array_search($a->position, $positionOrder);
                $posB = array_search($b->position, $positionOrder);

                $posA = $posA === false ? PHP_INT_MAX : $posA;
                $posB = $posB === false ? PHP_INT_MAX : $posB;

                return $posA <=> $posB;
            })
            ->take(20)
            ->values();

        return response()->json([
            'id' => $club->id,
            'club_name' => $club->club_name,
            'club_logo_path' => $club->club_logo_path,
            'club_cbl_file_path' => $club->club_cbl_file_path,
            'status' => $club->status,
            'members_count' => $club->members_count,

            'members' => $members->map(function ($m) {
                return [
                    'id' => $m->id,
                    'user_id' => $m->user->id,
                    'user_id_no' => $m->user->user_id_no ?? 'No ID',
                    'profile_photo' => $m->user->profile_photo ?? null,
                    'position' => $m->position,
                    'is_admin' => $m->is_admin,
                    'is_active' => $m->is_active,
                ];
            }),
        ]);
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
        $club = CampusClub::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|string|in:Activated,Deactivated',
        ]);

        $club->update($validated);

        return response()->json([
            'message' => 'Club updated successfully',
            'data' => $club
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function myClubs()
    {
        $userId = Auth::id();

        $clubs = CampusClub::withCount([
            'members as members_count' => function ($query) {
                $query->where('is_active', true);
            }
        ])
            ->with([
                'members' => function ($query) use ($userId) {
                    $query->where('user_id', $userId)
                        ->where('is_active', true);
                },

                'joinRequests' => function ($query) use ($userId) {
                    $query->where('user_id', $userId)
                        ->where('status', 'pending');
                }
            ])
            ->get()
            ->map(function ($club) {

                $member = $club->members->first();

                $request = $club->joinRequests->first();

                return [
                    'id' => $club->id,
                    'club_name' => $club->club_name,
                    'club_logo' => $club->club_logo_path,
                    'cbl_file' => $club->club_cbl_file_path,
                    'status' => $club->status,

                    'is_member' => !!$member,

                    'has_pending_request' => !!$request,

                    'request_status' => optional($request)->status,

                    'is_active' => optional($member)->is_active ?? false,

                    'is_admin' => optional($member)->is_admin ?? false,

                    'position' => optional($member)->position,

                    'members_count' => $club->members_count,
                ];
            });

        return Inertia::render('Student/MyClubs/Index', [
            'clubs' => $clubs,
        ]);
    }

    public function showMyClub(string $id)
    {
        $club = CampusClub::with([
            'members.user',
            'joinRequests.user'
        ])
            ->withCount([
                'members as members_count' => function ($query) {
                    $query->where('is_active', true);
                }
            ])
            ->findOrFail($id);

        $positionOrder = [
            'president',
            'vice_president',
            'secretary',
            'treasurer',
            'auditor',
            'club_coordinator'
        ];

        $members = $club->members
            ->where('is_active', true)
            ->sort(function ($a, $b) use ($positionOrder) {

                if ($a->is_admin != $b->is_admin) {
                    return $b->is_admin <=> $a->is_admin;
                }

                $posA = array_search($a->position, $positionOrder);
                $posB = array_search($b->position, $positionOrder);

                $posA = $posA === false ? PHP_INT_MAX : $posA;
                $posB = $posB === false ? PHP_INT_MAX : $posB;

                return $posA <=> $posB;
            })
            ->values();

        $joinRequests = $club->joinRequests
            ->where('status', 'pending')
            ->values();

        $currentUserId = auth()->id();

        $currentRequest = $club->joinRequests
            ->where('user_id', $currentUserId)
            ->where('status', 'pending')
            ->first();

        return response()->json([
            'id' => $club->id,
            'club_name' => $club->club_name,
            'club_logo_path' => $club->club_logo_path,
            'club_cbl_file_path' => $club->club_cbl_file_path,
            'status' => $club->status,
            'members_count' => $club->members_count,

            'has_pending_request' => !!$currentRequest,

            'request_status' => optional($currentRequest)->status,

            'members' => $members->map(function ($m) {
                return [
                    'id' => $m->id,
                    'user_id' => $m->user->id,
                    'user_id_no' => $m->user->user_id_no ?? 'No ID',
                    'profile_photo' => $m->user->profile_photo ?? null,
                    'position' => $m->position,
                    'is_admin' => $m->is_admin,
                    'is_active' => $m->is_active,
                ];
            }),

            'join_requests' => $joinRequests->map(function ($r) {
                return [
                    'id' => $r->id,
                    'user_id' => $r->user->id,
                    'user_id_no' => $r->user->user_id_no ?? 'No ID',
                    'profile_photo' => $r->user->profile_photo ?? null,
                    'status' => $r->status,
                    'updated_at' => $r->updated_at->diffForHumans(),
                ];
            }),
        ]);
    }

    public function requestJoin($clubId)
    {
        $club = CampusClub::findOrFail($clubId);

        if ($club->status !== 'Activated') {
            return response()->json([
                'message' => 'Club is not activated.'
            ], 403);
        }

        $userId = auth()->id();

        // ACTIVE MEMBER CHECK
        $activeMember = CampusClubUser::where('club_id', $clubId)
            ->where('user_id', $userId)
            ->where('is_active', true)
            ->exists();

        if ($activeMember) {
            return response()->json([
                'message' => 'You are already a member.'
            ], 422);
        }

        // PENDING REQUEST CHECK
        $pendingRequest = CampusClubJoinRequest::where('club_id', $clubId)
            ->where('user_id', $userId)
            ->where('status', 'pending')
            ->first();

        if ($pendingRequest) {
            return response()->json([
                'message' => 'You already requested to join.'
            ], 422);
        }

        // REUSE OLD REQUEST
        $oldRequest = CampusClubJoinRequest::where('club_id', $clubId)
            ->where('user_id', $userId)
            ->latest()
            ->first();

        if ($oldRequest) {

            $oldRequest->update([
                'status' => 'pending',
            ]);

            return response()->json([
                'message' => 'Join request submitted successfully.'
            ]);
        }

        // CREATE NEW REQUEST
        CampusClubJoinRequest::create([
            'club_id' => $clubId,
            'user_id' => $userId,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Join request submitted successfully.'
        ]);
    }

    public function approveJoinRequest($clubId, $requestId)
    {
        $club = CampusClub::findOrFail($clubId);

        $this->ensureClubIsActive($club);
        $this->checkAdminAccess($clubId);

        $request = CampusClubJoinRequest::where('club_id', $clubId)
            ->where('id', $requestId)
            ->where('status', 'pending')
            ->firstOrFail();

        DB::beginTransaction();

        try {

            $existingMember = CampusClubUser::where('club_id', $clubId)
                ->where('user_id', $request->user_id)
                ->first();

            if ($existingMember) {
                $existingMember->update([
                    'is_active' => true,
                ]);
            } else {
                CampusClubUser::create([
                    'club_id' => $clubId,
                    'user_id' => $request->user_id,
                    'position' => 'member',
                    'is_admin' => false,
                    'is_active' => true,
                ]);
            }

            $request->update([
                'status' => 'approved'
            ]);

            $notificationId = DB::table('notifications')->insertGetId([
                'courses_id' => null,
                'year_levels_id' => null,
                'notifiable_type' => 'club_join',
                'data' => json_encode([
                    'title' => 'Join Request Approved',
                    'message' => "Your request to join {$club->club_name} has been approved.",
                    'club_id' => $clubId,
                ]),
                'created_at' => now(),
            ]);

            DB::table('notification_users')->insert([
                'notification_id' => $notificationId,
                'user_id' => $request->user_id,
                'is_read' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Request approved successfully.'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function rejectJoinRequest($clubId, $requestId)
    {
        $club = CampusClub::findOrFail($clubId);

        $this->ensureClubIsActive($club);
        $this->checkAdminAccess($clubId);

        $request = CampusClubJoinRequest::where('club_id', $clubId)
            ->where('id', $requestId)
            ->where('status', 'pending')
            ->firstOrFail();

        $request->update([
            'status' => 'rejected'
        ]);

        $notificationId = DB::table('notifications')->insertGetId([
            'courses_id' => null,
            'year_levels_id' => null,
            'notifiable_type' => 'club_join',
            'data' => json_encode([
                'title' => 'Join Request Rejected',
                'message' => "Your request to join {$club->club_name} has been rejected.",
                'club_id' => $clubId,
            ]),
            'created_at' => now(),
        ]);

        DB::table('notification_users')->insert([
            'notification_id' => $notificationId,
            'user_id' => $request->user_id,
            'is_read' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'message' => 'Request rejected.'
        ]);
    }

    private function checkAdminAccess($clubId)
    {
        $userId = auth()->id();

        $isAdmin = CampusClubUser::where('club_id', $clubId)
            ->where('user_id', $userId)
            ->where('is_admin', true)
            ->where('is_active', true)
            ->exists();

        if (!$isAdmin) {
            abort(403, 'Unauthorized. Admin access required.');
        }
    }

    private function ensureClubIsActive($club)
    {
        if ($club->status !== 'Activated') {
            abort(403, 'Club is not active.');
        }
    }

    private function ensureUniqueRole($clubId, $position, $excludeMemberId = null)
    {
        $uniqueRoles = [
            'president',
            'vice_president',
            'secretary',
            'treasurer',
            'auditor',
            'club_coordinator'
        ];

        if (in_array($position, $uniqueRoles)) {
            $query = CampusClubUser::where('club_id', $clubId)
                ->where('position', $position)
                ->where('is_active', true);

            if ($excludeMemberId) {
                $query->where('id', '!=', $excludeMemberId);
            }

            if ($query->exists()) {
                abort(422, ucfirst(str_replace('_', ' ', $position)) . ' already exists.');
            }
        }
    }

    public function addMemberMyClub(Request $request, string $id)
    {
        $request->validate([
            'user_id_no' => 'required|string|exists:users,user_id_no',
            'position' => 'required|string|in:member,president,vice_president,secretary,treasurer,auditor,club_coordinator',
        ]);

        $club = CampusClub::findOrFail($id);

        $this->ensureClubIsActive($club);
        $this->checkAdminAccess($club->id);

        $newUser = User::where('user_id_no', $request->user_id_no)->firstOrFail();

        DB::beginTransaction();

        try {

            $existing = CampusClubUser::where('club_id', $club->id)
                ->where('user_id', $newUser->id)
                ->first();

            if ($existing) {

                if (!$existing->is_active) {

                    $this->ensureUniqueRole($club->id, $request->position, $existing->id);

                    $existing->update([
                        'is_active' => true,
                        'position' => $request->position,
                    ]);

                    CampusClubJoinRequest::where('club_id', $club->id)
                        ->where('user_id', $newUser->id)
                        ->where('status', 'pending')
                        ->update(['status' => 'approved']);

                } else {
                    return response()->json([
                        'message' => 'User is already an active member.'
                    ], 422);
                }
            } else {

                $this->ensureUniqueRole($club->id, $request->position);

                CampusClubUser::create([
                    'club_id' => $club->id,
                    'user_id' => $newUser->id,
                    'position' => $request->position,
                    'is_admin' => $request->position === 'president',
                    'is_active' => true,
                ]);

                CampusClubJoinRequest::where('club_id', $club->id)
                    ->where('user_id', $newUser->id)
                    ->where('status', 'pending')
                    ->update(['status' => 'approved']);
            }

            $notificationId = DB::table('notifications')->insertGetId([
                'courses_id' => null,
                'year_levels_id' => null,
                'notifiable_type' => 'club_member_added',
                'data' => json_encode([
                    'title' => 'Added to Club',
                    'message' => "You have been added to {$club->club_name}.",
                    'club_id' => $club->id,
                ]),
                'created_at' => now(),
            ]);

            DB::table('notification_users')->insert([
                'notification_id' => $notificationId,
                'user_id' => $newUser->id,
                'is_read' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Member added successfully.'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function updateMember(Request $request, $clubId, $memberId)
    {
        $request->validate([
            'position' => 'required|string|in:member,president,vice_president,secretary,treasurer,auditor,club_coordinator',
        ]);

        $club = CampusClub::findOrFail($clubId);

        $this->ensureClubIsActive($club);
        $this->checkAdminAccess($clubId);

        $member = CampusClubUser::where('club_id', $clubId)
            ->where('id', $memberId)
            ->where('is_active', true)
            ->firstOrFail();

        $this->ensureUniqueRole($clubId, $request->position, $member->id);

        $member->update([
            'position' => $request->position
        ]);

        $notificationId = DB::table('notifications')->insertGetId([
            'courses_id' => null,
            'year_levels_id' => null,
            'notifiable_type' => 'club_role_update',
            'data' => json_encode([
                'title' => 'Role Updated',
                'message' => "Your role in {$club->club_name} has been updated to {$request->position}.",
                'club_id' => $clubId,
            ]),
            'created_at' => now(),
        ]);

        DB::table('notification_users')->insert([
            'notification_id' => $notificationId,
            'user_id' => $member->user_id,
            'is_read' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'message' => 'Member updated successfully.'
        ]);
    }

    public function removeMember($clubId, $memberId)
    {
        $club = CampusClub::findOrFail($clubId);

        $this->ensureClubIsActive($club);
        $this->checkAdminAccess($clubId);

        $member = CampusClubUser::where('club_id', $clubId)
            ->where('id', $memberId)
            ->where('is_active', true)
            ->firstOrFail();

        if ($member->user_id === auth()->id()) {
            return response()->json([
                'message' => 'You cannot remove yourself.'
            ], 403);
        }

        $adminCount = CampusClubUser::where('club_id', $clubId)
            ->where('is_admin', true)
            ->where('is_active', true)
            ->count();

        if ($member->is_admin && $adminCount <= 1) {
            return response()->json([
                'message' => 'Cannot remove the last admin.'
            ], 422);
        }

        $member->update([
            'is_active' => false
        ]);

        $notificationId = DB::table('notifications')->insertGetId([
            'courses_id' => null,
            'year_levels_id' => null,
            'notifiable_type' => 'club_removed',
            'data' => json_encode([
                'title' => 'Removed from Club',
                'message' => "You have been removed from {$club->club_name}.",
                'club_id' => $clubId,
            ]),
            'created_at' => now(),
        ]);

        DB::table('notification_users')->insert([
            'notification_id' => $notificationId,
            'user_id' => $member->user_id,
            'is_read' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Member removed successfully.']);
    }
}
