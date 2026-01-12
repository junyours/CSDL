<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Violation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ViolationController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search');
        $violations = Violation::query()
            ->where('status', 1)
            ->when($search, function ($query, $search) {
                $query->where('violation_code', 'like', "%$search%")
                    ->orWhere('violation_description', 'like', "%$search%");
            })
            ->paginate(10)
            ->withQueryString();
        return Inertia::render('Admin/Violations/Index', [
            'violations' => $violations,
            'filters' => [
                'search' => $search
            ]
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Violations/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'violation_code' => 'required|string|max:255|unique:violations,violation_code',
            'violation_description' => 'required|string|max:255',
            'status' => 'boolean'
        ]);
        $violation = Violation::create([
            'violation_code' => $validated['violation_code'],
            'violation_description' => $validated['violation_description'],
            'status' => $validated['status'] ?? true,
        ]);
        return response()->json([
            'message' => 'Violation created successfully',
            'violation' => $violation
        ]);
    }

    public function update(Request $request, Violation $violation)
    {
        $validated = $request->validate([
            'violation_code' => 'required|string|max:255|unique:violations,violation_code,' . $violation->id,
            'violation_description' => 'required|string|max:255',
            'status' => 'boolean'
        ]);

        $violation->update([
            'violation_code' => $validated['violation_code'],
            'violation_description' => $validated['violation_description'],
            'status' => $validated['status'] ?? true,
        ]);

        return response()->json([
            'message' => 'Violation updated successfully',
            'violation' => $violation
        ]);
    }
}