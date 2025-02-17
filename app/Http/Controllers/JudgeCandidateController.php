<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Candidate;
use App\Models\Judge;

class JudgeCandidateController extends Controller
{
    /**
     * Assign a judge to candidates.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'judge_id' => 'required|exists:judges,id',
            'assignments' => 'required|array',
            'assignments.*' => 'boolean', // Ensures only boolean values are accepted
        ]);
    
        $judgeId = $validated['judge_id'];
        $assignedCandidates = array_keys(array_filter($validated['assignments'])); // Get assigned candidate IDs
    
        // Sync candidates assigned to the selected judge
        $judge = Judge::findOrFail($judgeId);
        $judge->candidates()->sync($assignedCandidates);
    
        return response()->json(['message' => 'Assignments saved successfully!']);
    }
    

    /**
     * Get assigned candidates for a specific judge.
     */
    public function show($judgeId)
    {
        $judge = Judge::with('candidates')->findOrFail($judgeId);
        return response()->json($judge->candidates->pluck('id'));
    }

   

}
