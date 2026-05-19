<?php

namespace App\Http\Controllers;

use App\Models\CampusClub;
use App\Models\CampusClubUser;
use Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class CampusClubController extends Controller
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
        $request->validate([
            'club_name' => 'required|string|max:255',
            'club_logo' => 'required|image|max:5120',
            'club_cbl_file' => 'required|file|max:10240',
        ]);

        DB::beginTransaction();

        try {
            $accessToken = $this->token();

            // Create or get folder for clubs
            $folderId = $this->getOrCreateFolder(
                $accessToken,
                'UserProfile',
                config('services.google.folder_id')
            );

            /*
            |--------------------------------------------------------------------------
            | Upload CLUB LOGO
            |--------------------------------------------------------------------------
            */
            $logoFile = $request->file('club_logo');

            $logoMetadata = [
                'name' => 'temp_logo_' . time(),
                'parents' => [$folderId],
            ];

            $logoUpload = Http::withToken($accessToken)
                ->attach('metadata', json_encode($logoMetadata), 'metadata.json', [
                    'Content-Type' => 'application/json'
                ])
                ->attach(
                    'media',
                    file_get_contents($logoFile),
                    $logoFile->getClientOriginalName(),
                    ['Content-Type' => $logoFile->getMimeType()]
                )
                ->post('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart');

            if (!$logoUpload->successful()) {
                throw new \Exception('Logo upload failed');
            }

            $logoFileId = $logoUpload->json()['id'];

            // Rename + make public
            Http::withToken($accessToken)->patch(
                "https://www.googleapis.com/drive/v3/files/{$logoFileId}",
                ['name' => $logoFileId]
            );

            Http::withToken($accessToken)->post(
                "https://www.googleapis.com/drive/v3/files/{$logoFileId}/permissions",
                ['role' => 'reader', 'type' => 'anyone']
            );

            /*
            |--------------------------------------------------------------------------
            | Upload CBL FILE
            |--------------------------------------------------------------------------
            */
            $cblFile = $request->file('club_cbl_file');

            $cblMetadata = [
                'name' => 'temp_cbl_' . time(),
                'parents' => [$folderId],
            ];

            $cblUpload = Http::withToken($accessToken)
                ->attach('metadata', json_encode($cblMetadata), 'metadata.json', [
                    'Content-Type' => 'application/json'
                ])
                ->attach(
                    'media',
                    file_get_contents($cblFile),
                    $cblFile->getClientOriginalName(),
                    ['Content-Type' => $cblFile->getMimeType()]
                )
                ->post('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart');

            if (!$cblUpload->successful()) {
                throw new \Exception('CBL upload failed');
            }

            $cblFileId = $cblUpload->json()['id'];

            // Rename + make public
            Http::withToken($accessToken)->patch(
                "https://www.googleapis.com/drive/v3/files/{$cblFileId}",
                ['name' => $cblFileId]
            );

            Http::withToken($accessToken)->post(
                "https://www.googleapis.com/drive/v3/files/{$cblFileId}/permissions",
                ['role' => 'reader', 'type' => 'anyone']
            );

            /*
            |--------------------------------------------------------------------------
            | Create Club
            |--------------------------------------------------------------------------
            */
            $club = CampusClub::create([
                'club_name' => $request->club_name,
                'club_logo_path' => $logoFileId,
                'club_cbl_file_path' => $cblFileId,
                'status' => 'Pending request', // force backend
            ]);

            /*
            |--------------------------------------------------------------------------
            | Attach Auth User
            |--------------------------------------------------------------------------
            */
            if (!Auth::check()) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }

 
            $club = CampusClubUser::create([
                'club_id' => $club->id,
                'user_id' => Auth::id(),
                'position' => 'member',
                'is_admin' => true,
                'is_active' => true,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Campus club created successfully.',
                'data' => $club
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Failed to create campus club.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(CampusClub $campusClub)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(CampusClub $campusClub)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CampusClub $campusClub)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CampusClub $campusClub)
    {
        //
    }
}
