<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sanction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SanctionController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search');

        $sanctions = Sanction::query()
            ->where('status', 1) // <-- Only get active sanctions
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('sanction_name', 'like', "%$search%")
                        ->orWhere('sanction_description', 'like', "%$search%");
                });
            })
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Sanctions/Index', [
            'sanctions' => $sanctions,
            'filters' => [
                'search' => $search
            ]
        ]);
    }


    public function create()
    {
        return Inertia::render('Admin/Sanctions/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'sanction_type' => 'required|in:monetary,service',
            'sanction_name' => 'required|string|max:255',
            'sanction_description' => 'nullable|string|max:255',

            // Monetary fields
            'monetary_amount' => 'nullable|required_if:sanction_type,monetary|numeric|min:0',

            // Service fields
            'service_time' => 'nullable|required_if:sanction_type,service|integer|min:1',
            'service_time_type' => 'nullable|required_if:sanction_type,service|in:minutes,hours',

            'status' => 'boolean',
        ]);

        $sanction = Sanction::create([
            'sanction_type' => $validated['sanction_type'],
            'sanction_name' => $validated['sanction_name'],
            'sanction_description' => $validated['sanction_description'] ?? null,

            // Monetary
            'monetary_amount' => $validated['sanction_type'] === 'monetary'
                ? $validated['monetary_amount']
                : null,

            // Service
            'service_time' => $validated['sanction_type'] === 'service'
                ? $validated['service_time']
                : null,

            'service_time_type' => $validated['sanction_type'] === 'service'
                ? $validated['service_time_type']
                : null,

            'status' => $validated['status'] ?? true,
        ]);

        return response()->json([
            'message' => 'Sanction created successfully',
            'sanction' => $sanction
        ]);
    }


    public function update(Request $request, Sanction $sanction)
    {
        $validated = $request->validate([
            'sanction_type' => 'required|in:monetary,service',
            'sanction_name' => 'required|string|max:255',
            'sanction_description' => 'nullable|string|max:255',

            // Monetary
            'monetary_amount' => 'nullable|required_if:sanction_type,monetary|numeric|min:0',

            // Service
            'service_time' => 'nullable|required_if:sanction_type,service|integer|min:1',
            'service_time_type' => 'nullable|required_if:sanction_type,service|in:minutes,hours',

            'status' => 'boolean'
        ]);

        $sanction->update([
            'sanction_type' => $validated['sanction_type'],
            'sanction_name' => $validated['sanction_name'],
            'sanction_description' => $validated['sanction_description'] ?? null,

            // Monetary
            'monetary_amount' => $validated['sanction_type'] === 'monetary'
                ? $validated['monetary_amount']
                : null,

            // Service
            'service_time' => $validated['sanction_type'] === 'service'
                ? $validated['service_time']
                : null,

            'service_time_type' => $validated['sanction_type'] === 'service'
                ? $validated['service_time_type']
                : null,

            'status' => $validated['status'] ?? true,
        ]);

        return response()->json([
            'message' => 'Sanction updated successfully',
            'sanction' => $sanction
        ]);
    }

}
