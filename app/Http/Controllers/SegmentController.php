<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Segment;
use App\Models\Criteria;

class SegmentController extends Controller
{

    public function index()
    {
        $segments = Segment::with('criteria')->get(); 
        return response()->json($segments);
    }

    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'criteria' => 'required|array',
            'criteria.*.name' => 'required|string|max:255',
            'criteria.*.weight' => 'required|numeric|min:0|max:100',
        ]);

        $totalWeight = array_sum(array_column($validated['criteria'], 'weight'));

        if ($totalWeight != 100) {
            return response()->json(['error' => 'Total weight of criteria must be 100%'], 400);
        }

        $segment = Segment::create([
            'name' => $validated['name'],
            'total_score' => 0,
        ]);

        foreach ($validated['criteria'] as $criteria) {
            Criteria::create([
                'segment_id' => $segment->id,
                'name' => $criteria['name'],
                'weight' => $criteria['weight'],
            ]);
        }

        return response()->json(['message' => 'Segment created successfully'], 201);
    }

    public function destroy($id)
    {
        $segment = Segment::find($id);

        if (!$segment) {
            return response()->json(['message' => 'Segment not found'], 404);
        }

        $segment->delete();

        return response()->json(['message' => 'Segment deleted successfully']);
    }
}
