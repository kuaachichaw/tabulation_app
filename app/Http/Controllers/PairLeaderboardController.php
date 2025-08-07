<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PairOverallLeaderboard;
use App\Models\PairSegment;
use App\Models\PairCandidate; // Add this import
use App\Models\PairScore; // Add this if you use it directly
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PairLeaderboardController extends Controller
{

    public function index()
{
    try {
        // Get only segments that have weights in pair_overall_leaderboard
        $weightedSegmentIds = PairOverallLeaderboard::select('pair_segment_id')
            ->distinct()
            ->pluck('pair_segment_id');
        
        $pairSegments = PairSegment::whereIn('id', $weightedSegmentIds)
            ->select('id', 'pair_name', 'male_name', 'female_name')
            ->get();
            
        $weights = PairOverallLeaderboard::get()
            ->groupBy('gender')
            ->mapWithKeys(function ($items, $gender) {
                return [$gender => $items->pluck('weight', 'pair_segment_id')];
            });

        return response()->json([
            'pairSegments' => $pairSegments,
            'maleWeights' => $weights['male'] ?? [],
            'femaleWeights' => $weights['female'] ?? []
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => 'Failed to load pair overall leaderboard data',
            'message' => $e->getMessage()
        ], 500);
    }
}

  public function store(Request $request)
{
    $validated = $request->validate([
        'male_segments' => 'required|array',
        'male_segments.*.pair_segment_id' => 'required|exists:pair_segment_table,id',
        'male_segments.*.weight' => 'required|numeric|min:0|max:100',
        'female_segments' => 'required|array',
        'female_segments.*.pair_segment_id' => 'required|exists:pair_segment_table,id',
        'female_segments.*.weight' => 'required|numeric|min:0|max:100',
    ]);

    try {
        \DB::transaction(function () use ($validated) {
            // Process weights for both genders
            foreach (['male', 'female'] as $gender) {
                foreach ($validated["{$gender}_segments"] as $segment) {
                    PairOverallLeaderboard::updateOrCreate(
                        [
                            'pair_segment_id' => $segment['pair_segment_id'],
                            'gender' => $gender
                        ],
                        [
                            'weight' => $segment['weight']
                        ]
                    );
                }
            }

            // Clean up segments not included in either gender
            $usedSegmentIds = collect($validated['male_segments'])
                ->merge($validated['female_segments'])
                ->pluck('pair_segment_id')
                ->unique();

            PairOverallLeaderboard::whereNotIn('pair_segment_id', $usedSegmentIds)->delete();
        });

        return response()->json([
            'message' => 'Pair overall weights saved successfully!',
            'total_male_weight' => array_sum(array_column($validated['male_segments'], 'weight')),
            'total_female_weight' => array_sum(array_column($validated['female_segments'], 'weight'))
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => 'Failed to save configuration',
            'message' => $e->getMessage()
        ], 500);
    }
}
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


  public function getPairOverallLeaderboard($gender)
{
    try {
        if (!in_array($gender, ['male', 'female'])) {
            return response()->json(['error' => 'Invalid gender specified'], 400);
        }

        $weightedSegments = PairOverallLeaderboard::with('segment')
            ->where('gender', $gender)
            ->get();

        if ($weightedSegments->isEmpty()) {
            return response()->json([
                'error' => 'No segments configured for this gender',
                'message' => 'Please set up segment weights first'
            ], 400);
        }

        $pairs = PairCandidate::all();
        $totalWeight = $weightedSegments->sum('weight');

        $leaderboard = $pairs->map(function ($pair) use ($weightedSegments, $gender, $totalWeight) {
            $totalWeightedScore = 0;
            $segmentBreakdown = [];

            foreach ($weightedSegments as $weightedSegment) {
                $avgScore = PairScore::where('pair_id', $pair->id)
                    ->where('pair_segment_id', $weightedSegment->pair_segment_id)
                    ->where('gender', $gender)
                    ->avg('score');

                $normalizedScore = $this->normalizeScore($avgScore);
                $weightedContribution = $normalizedScore * ($weightedSegment->weight / 100);
                $totalWeightedScore += $weightedContribution;

                $segmentBreakdown[] = [
                    'segment_id' => $weightedSegment->pair_segment_id,
                    'segment_name' => $gender === 'male' 
                        ? $weightedSegment->segment->male_name 
                        : $weightedSegment->segment->female_name,
                    'raw_score' => $avgScore ? number_format($avgScore, 2) : 'N/A',
                    'normalized_score' => $avgScore ? number_format($normalizedScore, 2) . '%' : 'N/A',
                    'segment_weight' => $weightedSegment->weight . '%',
                    'weighted_contribution' => $avgScore ? number_format($weightedContribution, 2) . '%' : 'N/A'
                ];
            }

            return [
                'id' => $pair->id,
                'pair_name' => $pair->pair_name,
                'name' => $pair->{$gender . '_name'},
                'picture' => $pair->{$gender . '_picture'},
                'total_score_value' => $totalWeightedScore, // Raw value for sorting
                'total_score' => number_format($totalWeightedScore, 2) . '%',
                'total_weight' => $totalWeight . '%',
                'segments' => $segmentBreakdown
            ];
        });

        // Apply ranking before returning
        $rankedLeaderboard = $this->applyRanking($leaderboard);

        return response()->json([
            'gender' => $gender,
            'total_weight' => $totalWeight . '%',
            'leaderboard' => $rankedLeaderboard
        ]);

    } catch (\Exception $e) {
        Log::error("Error in $gender leaderboard: " . $e->getMessage());
        return response()->json([
            'error' => 'Failed to load leaderboard',
            'message' => $e->getMessage()
        ], 500);
    }

       return response()->json([
        'gender' => $gender,
        'total_weight' => $totalWeight . '%',
        'leaderboard' => $rankedLeaderboard, // Make sure this contains the data
        'success' => true
    ]);
}

private function applyRanking($candidates)
{
    // Sort by total_score_value descending
    $sorted = $candidates->sortByDesc('total_score_value')->values();
    
    // Assign ranks (handling ties)
    $rank = 1;
    $previousScore = null;
    
    return $sorted->map(function ($candidate, $index) use (&$rank, &$previousScore) {
        // If same score as previous, same rank
        if ($previousScore !== null && $candidate['total_score_value'] == $previousScore) {
            $candidate['rank'] = $rank;
        } else {
            $rank = $index + 1;
            $candidate['rank'] = $rank;
        }
        
        $previousScore = $candidate['total_score_value'];
        
        // Remove temporary sorting field
        unset($candidate['total_score_value']);
        
        return $candidate;
    });
}

private function normalizeScore($score)
{
    if (is_null($score)) return 0;
    return ($score <= 10 && fmod($score, 1) != 0) ? $score * 10 : min($score, 100);
}
}