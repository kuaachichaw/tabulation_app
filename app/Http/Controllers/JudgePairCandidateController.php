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
            'assignments.*' => 'boolean', // Ensures only boolean values are accepted
        ]);

        $judgeId = $validated['judge_id'];
        $assignedPairs = array_keys(array_filter($validated['assignments'])); // Get assigned pair IDs

        // Sync pairs assigned to the selected judge
        $judge = Judge::findOrFail($judgeId);
        $judge->pairCandidates()->sync($assignedPairs);

        return response()->json(['message' => 'Pair assignments saved successfully!']);
    }

    /**
     * Get assigned pair candidates for a specific judge.
     */
    public function show($judgeId)
    {
        $judge = Judge::with('pairCandidates')->findOrFail($judgeId);
        return response()->json($judge->pairCandidates->pluck('id'));
    }
}