<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Score;

class ScoreController extends Controller
{
    // Save scores for individual candidates
    public function store(Request $request)
    {
        $request->validate([
            'candidate_id' => 'required|exists:candidates,id',
            'scores' => 'required|array',
            'scores.*.segment_id' => 'required|exists:segments,id',
            'scores.*.criterion_id' => 'required|exists:criterias,id',
            'scores.*.score' => 'required|numeric|min:0|max:100',
        ]);

        foreach ($request->scores as $scoreData) {
            Score::updateOrCreate(
                [
                    'judge_id' => auth()->id(),
                    'candidate_id' => $request->candidate_id,
                    'segment_id' => $scoreData['segment_id'],
                    'criterion_id' => $scoreData['criterion_id'],
                ],
                ['score' => $scoreData['score']]
            );
        }

        return response()->json(['message' => 'Scores saved successfully!'], 200);
    }

    // Fetch scores for a candidate
    public function getScores($candidateId)
    {
        $scores = Score::where('judge_id', auth()->id())
            ->where('candidate_id', $candidateId)
            ->get(['segment_id', 'criterion_id', 'score']);

        return response()->json($scores);
    }
}