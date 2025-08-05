<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PairOverallLeaderboard;
use App\Models\PairSegment;
use App\Models\PairCandidate; // Add this import
use App\Models\PairScore; // Add this if you use it directly
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PairOverallLeaderboardController extends Controller
{
    public function index()
    {
        try {
            $pairSegments = PairSegment::select('id', 'pair_name', 'male_name', 'female_name')->get();
            
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

 public function getRankings()
{
    try {
        $pairCandidates = PairCandidate::with(['pairscores' => function($query) {
            $query->select('pair_id', 'gender', \DB::raw('SUM(score) as total_score'))
                  ->groupBy('pair_id', 'gender');
        }])->get();

        $weights = PairOverallLeaderboard::get()
            ->groupBy('gender')
            ->map(fn($items) => $items->pluck('weight', 'pair_segment_id'));

        $rankings = $pairCandidates->map(function($candidate) use ($weights) {
            $maleScore = $candidate->pairscores->where('gender', 'male')->sum('total_score') ?? 0;
            $femaleScore = $candidate->pairscores->where('gender', 'female')->sum('total_score') ?? 0;
            
            $maleWeight = $weights['male'][$candidate->pair_segment_id] ?? 0;
            $femaleWeight = $weights['female'][$candidate->pair_segment_id] ?? 0;

            return [
                'id' => $candidate->id,
                'pair_name' => $candidate->pair_name,
                'male_name' => $candidate->male_name,
                'female_name' => $candidate->female_name,
                'male_score' => $maleScore * ($maleWeight / 100),
                'female_score' => $femaleScore * ($femaleWeight / 100),
                'total_score' => ($maleScore * ($maleWeight / 100)) + 
                                ($femaleScore * ($femaleWeight / 100))
            ];
        })->sortByDesc('total_score')->values();

        return response()->json([
            'success' => true,
            'data' => [
                'rankings' => $rankings
            ]
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to load rankings: ' . $e->getMessage()
        ], 500);
    }
}
}