<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PairCandidate;
use App\Models\Judge;

class JudgePairCandidateController extends Controller
{
    /**
     * Assign a judge to pair candidates.
     */
    public function store(Request $request)
{
    $validated = $request->validate([
        'judge_id' => 'required|exists:judges,id',
        'assignments' => 'required|array',
        'assignments.*.male' => 'boolean', // Tracks male assignment
        'assignments.*.female' => 'boolean', // Tracks female assignment
    ]);

    $judgeId = $validated['judge_id'];
    $assignments = $validated['assignments'];

    // Sync assignments for each pair
    foreach ($assignments as $pairId => $assignment) {
        \DB::table('pair_candidate_judge')
            ->updateOrInsert(
                ['pair_candidate_id' => $pairId, 'judge_id' => $judgeId],
                [
                    'assigned_male' => $assignment['male'],
                    'assigned_female' => $assignment['female'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
    }

    return response()->json(['message' => 'Pair assignments saved successfully!']);
}

    /**
     * Get assigned pair candidates for a specific judge.
     */
    public function show($judgeId)
    {
        // Fetch assignments for the specified judge
        $assignments = \DB::table('pair_candidate_judge')
            ->where('judge_id', $judgeId)
            ->get()
            ->keyBy('pair_candidate_id');
    
        // Return the assignments as a JSON response
        return response()->json($assignments);
    }


}