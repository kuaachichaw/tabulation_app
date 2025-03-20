<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PairScore;

class PairScoreController extends Controller
{
    // Save scores for pair candidates
    public function store(Request $request)
    {
        $request->validate([
            'pair_id' => 'required|exists:pair_candidates,id',
            'gender' => 'required|in:male,female',
            'scores' => 'required|array',
            'scores.*.pair_segment_id' => 'required|exists:pair_segment_table,id',
            'scores.*.pair_criteria_id' => 'required|exists:pair_criterias_table,id',
            'scores.*.score' => 'required|numeric|min:0|max:100',
        ]);

        foreach ($request->scores as $scoreData) {
            PairScore::updateOrCreate(
                [
                    'judge_id' => auth()->id(),
                    'pair_id' => $request->pair_id,
                    'gender' => $request->gender,
                    'pair_segment_id' => $scoreData['pair_segment_id'],
                    'pair_criteria_id' => $scoreData['pair_criteria_id'],
                ],
                ['score' => $scoreData['score']]
            );
        }

        return response()->json(['message' => 'Scores saved successfully!'], 200);
    }

    // Fetch scores for a pair candidate
public function show($pairId, Request $request)
{
    $gender = $request->query('gender'); // Get gender from query parameters

    $scores = PairScore::where('pair_id', $pairId)
        ->where('gender', $gender)
        ->get(['pair_segment_id', 'pair_criteria_id', 'score']);

    return response()->json($scores);
}
}