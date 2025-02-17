<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Models\Judge;
use App\Models\Segment;
use App\Models\JudgeSegment;

class JudgeSegmentController extends Controller
{
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'segment_id' => 'required|integer|exists:segments,id',
            'assignments' => 'required|array'
        ]);
    
        $segmentId = $validatedData['segment_id'];
        $assignments = $validatedData['assignments'];
    
        // Remove existing assignments for this segment
        JudgeSegment::where('segment_id', $segmentId)->delete();
    
        // Insert only valid assignments
        foreach ($assignments as $judgeId => $assigned) {
            if ($assigned && is_numeric($judgeId)) { // Ensure judge_id is a valid number
                JudgeSegment::create([
                    'segment_id' => $segmentId,
                    'judge_id' => (int) $judgeId  // Cast to integer to prevent SQL error
                ]);
            }
        }
    
        return response()->json(['message' => 'Assignments updated successfully']);
    }
    

public function show($segmentId)
{
    $assignments = JudgeSegment::where('segment_id', $segmentId)->pluck('judge_id');
    return response()->json($assignments);
}

public function getAssignedSegments()
{
    $judgeId = auth()->id(); // Get the logged-in judge's ID
    $segments = Segment::whereHas('judgeSegments', function ($query) use ($judgeId) {
        $query->where('judge_id', $judgeId);
    })->with('criteria')->get();

    return response()->json($segments);
}



}
