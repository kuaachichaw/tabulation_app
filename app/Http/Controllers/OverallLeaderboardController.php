<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\OverallLeaderboard;
use App\Models\Segment;

class OverallLeaderboardController extends Controller {
    
    public function index() {
        $segments = Segment::all(); // ✅ Fetch all available segments
        $overallSegments = OverallLeaderboard::all()->keyBy('segment_id'); // ✅ Index by segment_id for easy lookup
    
        return response()->json([
            'segments' => $segments, // ✅ Full segment list
            'overallSegments' => $overallSegments->pluck('weight', 'segment_id') // ✅ Pre-load weights
        ]);
    }
    
    public function store(Request $request) {
        $request->validate([
            'segments' => 'required|array|min:1',
            'segments.*.segment_id' => 'required|exists:segments,id',
            'segments.*.weight' => 'required|numeric|min:0|max:100',
        ]);

        // ✅ Delete segments that are not included in the new data
        $newSegmentIds = collect($request->segments)->pluck('segment_id')->toArray();
        OverallLeaderboard::whereNotIn('segment_id', $newSegmentIds)->delete();

        // ✅ Insert or update new segments
        foreach ($request->segments as $segment) {
            OverallLeaderboard::updateOrCreate(
                ['segment_id' => $segment['segment_id']],
                ['weight' => $segment['weight']]
            );
        }

        // ✅ Return updated leaderboard data
        $updatedOverallSegments = OverallLeaderboard::with('segment')->get();

        return response()->json([
            'message' => 'Overall leaderboard updated successfully!',
            'overallSegments' => $updatedOverallSegments
        ], 200);
    }
}
