<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PairOverallLeaderboard;
use App\Models\PairSegment;
use App\Models\PairCandidate;
use App\Models\PairScore;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PairLeaderboardController extends Controller
{
    public function index()
    {
        try {
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
            DB::transaction(function () use ($validated) {
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

            $judgeCount = PairScore::where('pair_segment_id', $segmentId)
                ->where('gender', $gender)
                ->distinct('judge_id')
                ->count('judge_id');

            $leaderboard = PairCandidate::select(
                    'pair_candidates.id',
                    'pair_candidates.pair_name',
                    $gender . '_name as name',
                    $gender . '_picture as picture',
                    DB::raw('ROUND(SUM(pair_scores.score) / ' . max($judgeCount, 1) . ', 2) as judge_score')
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

            foreach ($leaderboard as $pair) {
                $judgeScores = PairScore::where('pair_id', $pair->id)
                    ->where('pair_segment_id', $segmentId)
                    ->where('gender', $gender)
                    ->with('judge')
                    ->select(
                        'judge_id',
                        DB::raw('ROUND(SUM(score), 2) as judge_total')
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
                $pair->judge_count = $judgeCount;
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
                        'weight' => $weightedSegment->weight, // Ensure weight is included
                        'raw_score' => $avgScore ? number_format($avgScore, 2) : 'N/A',
                        'normalized_score' => $avgScore ? number_format($normalizedScore, 2) : 0,
                        'segment_weight' => $weightedSegment->weight . '%',
                        'weighted_contribution' => $avgScore ? number_format($weightedContribution, 2) : 0
                    ];
                }

                return [
                    'id' => $pair->id,
                    'pair_name' => $pair->pair_name,
                    'name' => $pair->{$gender . '_name'},
                    'picture' => $pair->{$gender . '_picture'},
                    'total_score_value' => $totalWeightedScore,
                    'total_score' => number_format($totalWeightedScore, 2) . '%',
                    'total_weight' => $totalWeight . '%',
                    'segments' => $segmentBreakdown
                ];
            });

            $rankedLeaderboard = $this->applyRanking($leaderboard);

            return response()->json([
                'gender' => $gender,
                'total_weight' => $totalWeight . '%',
                'leaderboard' => $rankedLeaderboard,
                'success' => true
            ]);

        } catch (\Exception $e) {
            Log::error("Error in $gender leaderboard: " . $e->getMessage());
            return response()->json([
                'error' => 'Failed to load leaderboard',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    private function applyRanking($candidates)
    {
        $sorted = $candidates->sortByDesc('total_score_value')->values();
        
        $rank = 1;
        $previousScore = null;
        
        return $sorted->map(function ($candidate, $index) use (&$rank, &$previousScore) {
            if ($previousScore !== null && $candidate['total_score_value'] == $previousScore) {
                $candidate['rank'] = $rank;
            } else {
                $rank = $index + 1;
                $candidate['rank'] = $rank;
            }
            
            $previousScore = $candidate['total_score_value'];
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