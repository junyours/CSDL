<?php

namespace App\Http\Controllers;

use App\Models\EClearance;
use App\Services\SisApiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class EClearanceController extends Controller
{
    public function adminEClearanceIndex(Request $request, SisApiService $sisApi)
    {
        $search = $request->input('search');

        // 1. Fetch Paginated Events with Search Filter
        $eClearanceQuery = EClearance::where('is_deleted', false)
            ->orderBy('id', 'desc')
            ->paginate(20)
            ->withQueryString();

        // 2. Fetch external structure data
        $response = $sisApi->get('/api/school-structure');
        $schoolStructure = $response->ok() ? ($response->json() ?? []) : [];

        $schoolYears = $schoolStructure['school_years'] ?? [];
        $schoolYearMap = collect($schoolYears)->keyBy('id');

        $eClearanceQuery->getCollection()->transform(function ($eCleance) use ($schoolYearMap) {
            return [
                'id' => $eCleance->id,
                'school_year' => $schoolYearMap[$eCleance->school_year_id] ?? null,
                'is_active' => $eCleance->is_active,
                'is_deleted' => $eCleance->is_deleted,
            ];
        });

        return Inertia::render('eClearance/EClearanceIndex', [
            'eClearance' => $eClearanceQuery,
        ]);
    }

    public function createEClearanceForm(Request $request, SisApiService $sisApi)
    {

        try {
            $schoolStructure = $this->fetchSchoolStructure($request, $sisApi);
        } catch (\Exception $e) {
            $schoolStructure = null;
        }

        return response()->json([
            'school_structure' => $schoolStructure,
        ]);

    }

    public function storeEClearance(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'school_year_id' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        $event = EClearance::create([
            'school_year_id' => $validated['school_year_id'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'EClearance created successfully',
            'data' => $event,
        ], 201);
    }

    public function showEClearance($id, SisApiService $sisApi)
    {
        $eClearance = EClearance::findOrFail($id);

        // Fetch school structure
        $response = $sisApi->get('/api/school-structure');
        $schoolStructure = $response->ok()
            ? ($response->json() ?? [])
            : [];

        $schoolYears = $schoolStructure['school_years'] ?? [];

        $schoolYear = collect($schoolYears)
            ->firstWhere('id', $eClearance->school_year_id);

        return Inertia::render('eClearance/EClearanceShow', [
            'eClearance' => [
                'id' => $eClearance->id,
                'is_active' => $eClearance->is_active,
                'school_year' => $schoolYear,
            ]
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
}
