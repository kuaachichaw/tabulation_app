<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Candidate;
use App\Models\Score;
use App\Models\Segment;
use App\Models\OverallLeaderboard;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LeaderboardController extends Controller
{
    public function index($segmentId = null)
    {
        // Check if a specific segment is requested
        if ($segmentId) {
            $leaderboard = $this->getSegmentLeaderboard($segmentId);
        } else {
            $leaderboard = $this->getOverallLeaderboard();
        }

        return response()->json($leaderboard);
    }

    private function getSegmentLeaderboard($segmentId)
    {
        try {
            $segments = OverallLeaderboard::where('segment_id', $segmentId)->get();
            
            $leaderboard = Candidate::select('candidates.id', 'candidates.name', 'candidates.picture')
                ->join('scores', 'candidates.id', '=', 'scores.candidate_id')
                ->where('scores.segment_id', $segmentId)
                ->selectRaw('ROUND(SUM(scores.score) / COUNT(DISTINCT scores.judge_id), 2) as judge_score')
                ->groupBy('candidates.id', 'candidates.name', 'candidates.picture')
                ->orderByDesc('judge_score')
                ->get();

            foreach ($leaderboard as $candidate) {
                $judgeScores = Score::where('candidate_id', $candidate->id)
                    ->where('segment_id', $segmentId)
                    ->join('judges', 'scores.judge_id', '=', 'judges.id')
                    ->select('judges.id as judge_id', 'judges.name as judge', DB::raw('SUM(scores.score) as judge_total'))
                    ->groupBy('judges.id', 'judges.name')
                    ->get();

                $judgeScores->transform(function ($item) {
                    if ($item->judge_total <= 100) {
                        $item->judge_total *= 1;
                    }
                    return $item;
                });

                $totalScore = $judgeScores->avg('judge_total');

                //Log::info("📝 Judge Scores for Candidate: {$candidate->name}", $judgeScores->toArray());
                //Log::info("🏆 Judge Total Score for Candidate: {$candidate->name}: " . number_format($totalScore, 2) . "%");

                $candidate->judge_scores = $judgeScores;
                $candidate->judge_total = number_format($totalScore, 2) . '%';
            }

            return $leaderboard;
        } catch (\Exception $e) {
            Log::error('Error fetching segment leaderboard:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to load segment leaderboard data.'], 500);
        }
    }


    
    public function getOverallLeaderboard()
    {
        $segments = OverallLeaderboard::with('segment')->get();
        
        if ($segments->isEmpty()) {
            return response()->json(['error' => 'No segments configured for the overall leaderboard.'], 400);
        }
        
        $candidates = Candidate::all();
        
        $leaderboard = $candidates->map(function ($candidate) use ($segments) {
            $totalWeightedScore = 0;
            $segmentBreakdown = [];
        
            foreach ($segments as $segment) {
                // Get raw average score from judges
                $rawScore = Candidate::join('scores', 'candidates.id', '=', 'scores.candidate_id')
                    ->where('candidates.id', $candidate->id)
                    ->where('scores.segment_id', $segment->segment_id)
                    ->selectRaw('ROUND(SUM(scores.score) / COUNT(DISTINCT scores.judge_id), 2) as judge_score')
                    ->value('judge_score') ?? 0;
                
                // Determine if score needs conversion (0-10 → 0-100)
                $segmentScore = $this->normalizeScore($rawScore);
        
                // Calculate weighted contribution
                $weightedScore = ($segmentScore * ($segment->weight / 100));
                $totalWeightedScore += $weightedScore;
        
                $segmentBreakdown[] = [
                    'segment_name' => $segment->segment->name,
                    'raw_score' => $rawScore, // For debugging
                    'normalized_score' => number_format($segmentScore, 2) . '%',
                    'segment_weight' => $segment->weight . '%',
                    'weighted_contribution' => number_format($weightedScore, 3),
                ];
            }
        
            return [
                'id' => $candidate->id,
                'name' => $candidate->name,
                'picture' => $candidate->picture,
                'total_score' => number_format($totalWeightedScore, 2),
                'segments' => $segmentBreakdown,
            ];
        });
        
        // Sort and rank
        return $this->applyRanking($leaderboard);
    }
    
    // New helper method for score normalization
    private function normalizeScore(float $rawScore): float
    {
        // Scores >100 are invalid (cap at 100%)
        if ($rawScore > 100) {
            return 100.0;
        }
        
        // If score ≤10 AND has decimal places → assume 0-10 scale
        if ($rawScore <= 10 && fmod($rawScore, 1) != 0) {
            return $rawScore * 10;
        }
        
        // Otherwise treat as percentage (6% stays 6%, 6.5 → invalid)
        return $rawScore;
    }
    // New helper method for ranking
    private function applyRanking($leaderboard)
    {
        $sorted = $leaderboard->sortByDesc(function ($item) {
            return (float) $item['total_score'];
        })->values();
        
        return $sorted->map(function ($item, $index) {
            $item['rank'] = $index + 1;
            $item['total_score'] .= '%';
            return $item;
        });
    }
    
    
}
