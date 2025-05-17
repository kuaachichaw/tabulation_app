<?php

namespace App\Http\Controllers;

use App\Models\PairCandidate;
use App\Models\PairScore;
use App\Models\PairSegment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PairLeaderboardController extends Controller
{
    public function getSegmentLeaderboard($segmentId, $gender)
{
    try {
        if (!in_array($gender, ['male', 'female'])) {
            return response()->json(['error' => 'Invalid gender specified'], 400);
        }

        $segment = PairSegment::findOrFail($segmentId);
        $segmentName = $gender === 'male' ? $segment->male_name : $segment->female_name;

        // First get the count of judges for this segment
        $judgeCount = PairScore::where('pair_segment_id', $segmentId)
            ->where('gender', $gender)
            ->distinct('judge_id')
            ->count('judge_id');

        $leaderboard = PairCandidate::select(
                'pair_candidates.id',
                'pair_candidates.pair_name',
                $gender . '_name as name',
                $gender . '_picture as picture',
                DB::raw('ROUND(SUM(pair_scores.score) / ' . max($judgeCount, 1) . ', 2) as judge_score') // Divide by judge count
            )
            ->join('pair_scores', 'pair_candidates.id', '=', 'pair_scores.pair_id')
            ->where('pair_scores.pair_segment_id', $segmentId)
            ->where('pair_scores.gender', $gender)
            ->groupBy(
                'pair_candidates.id',
                'pair_candidates.pair_name',
                $gender . '_name',
                $gender . '_picture'
            )
            ->orderByDesc('judge_score')
            ->get();

        // Add judge score breakdowns (now showing individual averages)
        foreach ($leaderboard as $pair) {
            $judgeScores = PairScore::where('pair_id', $pair->id)
                ->where('pair_segment_id', $segmentId)
                ->where('gender', $gender)
                ->with('judge')
                ->select(
                    'judge_id',
                    DB::raw('ROUND(SUM(score), 2) as judge_total') // Keep sum for individual judge totals
                )
                ->groupBy('judge_id')
                ->get()
                ->map(function ($score) {
                    return [
                        'judge_id' => $score->judge_id,
                        'judge' => $score->judge->name,
                        'judge_total' => $score->judge_total
                    ];
                });

            $pair->judge_scores = $judgeScores;
            $pair->judge_total = number_format($judgeScores->sum('judge_total') / max($judgeCount, 1), 2) . '%';
            $pair->segment_name = $segmentName;
            $pair->judge_count = $judgeCount; // Add judge count to response
        }

        return response()->json([
            'segment_name' => $segmentName,
            'gender' => $gender,
            'judge_count' => $judgeCount,
            'leaderboard' => $leaderboard
        ]);

    } catch (\Exception $e) {
        Log::error("Error fetching $gender pair leaderboard:", [
            'segment_id' => $segmentId,
            'error' => $e->getMessage()
        ]);
        return response()->json(['error' => 'Failed to load pair leaderboard data'], 500);
    }
}
    public function getOverallLeaderboard($gender)
    {
        try {
            // Validate gender input
            if (!in_array($gender, ['male', 'female'])) {
                return response()->json(['error' => 'Invalid gender specified'], 400);
            }

            $segments = PairSegment::all();
            $pairs = PairCandidate::all();

            $leaderboard = $pairs->map(function ($pair) use ($segments, $gender) {
                $totalScore = 0;
                $segmentBreakdown = [];

                foreach ($segments as $segment) {
                    $avgScore = PairScore::where('pair_id', $pair->id)
                        ->where('pair_segment_id', $segment->id)
                        ->where('gender', $gender)
                        ->avg('score');

                    $segmentBreakdown[] = [
                        'segment_id' => $segment->id,
                        'segment_name' => $gender === 'male' 
                            ? $segment->male_name 
                            : $segment->female_name,
                        'segment_score' => number_format($avgScore, 2) . '%'
                    ];
                    $totalScore += $avgScore;
                }

                return [
                    'id' => $pair->id,
                    'name' => $pair->{$gender . '_name'},
                    'picture' => $pair->{$gender . '_picture'},
                    'total_score' => number_format($totalScore / max(count($segments), 1), 2) . '%',
                    'segments' => $segmentBreakdown
                ];
            })->sortByDesc(function ($pair) {
                return (float) str_replace('%', '', $pair['total_score']);
            })->values();

            return response()->json([
                'gender' => $gender,
                'leaderboard' => $leaderboard
            ]);

        } catch (\Exception $e) {
            Log::error("Error fetching overall $gender pair leaderboard:", [
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'error' => 'Failed to load overall pair leaderboard data'
            ], 500);
        }
    }
}