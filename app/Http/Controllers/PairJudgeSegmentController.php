<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Models\Judge;
use App\Models\PairSegment;
use App\Models\PairJudgeSegment;

class PairJudgeSegmentController extends Controller
{
    // Save assignments for a pair segment
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'pair_segment_id' => 'required|integer|exists:pair_segment_table,id',
            'assignments' => 'required|array', // Key-value pairs of judge IDs and their assignment status
        ]);

        $pairSegmentId = $validatedData['pair_segment_id'];
        $assignments = $validatedData['assignments'];

        // Remove existing assignments for this pair segment
        PairJudgeSegment::where('pair_segment_id', $pairSegmentId)->delete();

        // Insert only valid assignments
        foreach ($assignments as $judgeId => $assigned) {
            if ($assigned && is_numeric($judgeId)) { // Ensure judge_id is a valid number
                PairJudgeSegment::create([
                    'pair_segment_id' => $pairSegmentId,
                    'judge_id' => (int) $judgeId, // Cast to integer to prevent SQL error
                ]);
            }
        }

        return response()->json(['message' => 'Assignments updated successfully']);
    }

    // Get all assignments for a specific pair segment
    public function index($pairSegmentId)
    {
        $assignments = PairJudgeSegment::where('pair_segment_id', $pairSegmentId)
            ->with('judge')
            ->get();

        return response()->json($assignments);
    }

    // Delete assignments for a pair segment
    public function destroy($pairSegmentId)
    {
        PairJudgeSegment::where('pair_segment_id', $pairSegmentId)->delete();
        return response()->json(['message' => 'Assignments deleted successfully']);
    }

    // Get assigned pair segments for the logged-in judge
    public function getAssignedPairJudgeSegments()
    {
        $judgeId = auth()->id(); // Get the logged-in judge's ID
    
        // Fetch pair segments assigned to the judge with criteria
        $pairSegments = PairSegment::whereHas('pairJudgeSegments', function ($query) use ($judgeId) {
            $query->where('judge_id', $judgeId);
        })->with('paircriteria')->get(); // Include criteria
    
        return response()->json($pairSegments);
    }
}