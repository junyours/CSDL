<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Location;
use Illuminate\Http\Request;
use Validator;

class LocationController extends Controller
{
    public function index()
    {
        $locations = Location::select('id', 'location_name', 'address', 'polygon_points', 'status')
            ->where('status', 1) // Only active locations
            ->get();

        return inertia('Admin/Locations/Index', [
            'locations' => $locations,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->all();

        if (isset($data['polygon_points']) && is_string($data['polygon_points'])) {
            $data['polygon_points'] = json_decode($data['polygon_points'], true);
        }

        $validator = Validator::make($data, [
            'location_name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'polygon_points' => 'required|array|min:3',
            'polygon_points.*.lng' => 'required|numeric|between:-180,180',
            'polygon_points.*.lat' => 'required|numeric|between:-90,90',
            'status' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->hasFile('location_photo') && $request->file('location_photo')->isValid()) {
            $photoPath = $request->file('location_photo')->store('locations', 'public');
        }

        $location = Location::create([
            'location_name' => $data['location_name'],
            'address' => $data['address'],
            'polygon_points' => $data['polygon_points'],
            'status' => $data['status'] ?? 1,
        ]);

        return response()->json(['data' => $location, 'message' => 'Location created successfully'], 200);
    }

    public function moveToBin($id)
    {
        $location = Location::findOrFail($id);
        $location->status = 0;
        $location->save();

        return response()->json(['message' => 'Location moved to bin successfully.']);
    }

}
