<?php

namespace App\Http\Controllers;

use App\Models\PairSegment;
use App\Models\PairCriteria;
use Illuminate\Http\Request;

class PairSegmentController extends Controller
{
    // Display a list of pair segments
    public function index()
    {
        $pairSegments = PairSegment::with('criterias')->get();
        return response()->json($pairSegments);
    }

    // Store a new pair segment
    public function store(Request $request)
    {
        $request->validate([
            'pair_name' => 'required|string|max:255',
            'male_name' => 'required|string|max:255',
            'female_name' => 'required|string|max:255',
            'male_criterias' => 'required|array',
            'female_criterias' => 'required|array',
        ]);
    
        // Create the pair segment
        $pairSegment = PairSegment::create([
            'pair_name' => $request->pair_name,
            'male_name' => $request->male_name,
            'female_name' => $request->female_name,
        ]);
    
        // Add male criteria
        foreach ($request->male_criterias as $criteria) {
            PairCriteria::create([
                'pair_segment_id' => $pairSegment->id,
                'type' => 'male',
                'criteria_name' => $criteria['name'],
                'weight' => $criteria['weight'],
            ]);
        }
    
        // Add female criteria
        foreach ($request->female_criterias as $criteria) {
            PairCriteria::create([
                'pair_segment_id' => $pairSegment->id,
                'type' => 'female',
                'criteria_name' => $criteria['name'],
                'weight' => $criteria['weight'],
            ]);
        }
    
        return response()->json(['message' => 'Pair segment created successfully'], 201);
    }

    // Delete a pair segment
    public function destroy($id)
    {
        $pairSegment = PairSegment::findOrFail($id);
        $pairSegment->delete();
        return response()->json(['message' => 'Pair segment deleted successfully']);
    }
}