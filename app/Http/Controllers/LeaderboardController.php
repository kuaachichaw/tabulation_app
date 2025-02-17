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
        $segments = OverallLeaderboard::where('segment_id', $segmentId)->get();
        
        //Log::info("📊 Segment Weights:", $segments->mapWithKeys(fn ($s) => [$s->segment->name => $s->weight])->toArray());
    
        $leaderboard = Candidate::select('candidates.id', 'candidates.name', 'candidates.picture')
            ->join('scores', 'candidates.id', '=', 'scores.candidate_id')
            ->where('scores.segment_id', $segmentId)
           ->selectRaw('ROUND(SUM(scores.score) / COUNT(DISTINCT scores.judge_id), 2) as score')
            ->groupBy('candidates.id', 'candidates.name', 'candidates.picture')
            ->orderByDesc('score')
            ->get();
    
        //Log::info("📊 Segment Leaderboard (Segment ID: $segmentId)", $leaderboard->toArray());
    
        return $leaderboard;
    }
    
  

    public function getOverallLeaderboard()
{
    // Fetch selected segments & their weights
    $segments = OverallLeaderboard::with('segment')->get();

    // If no segments are set up for overall scoring, return an error response
    if ($segments->isEmpty()) {
        return response()->json(['error' => 'No segments configured for the overall leaderboard.'], 400);
    }

    // Log segment weight information
    Log::info("📊 Segment Weights:", $segments->mapWithKeys(fn ($s) => [$s->segment->name => $s->weight])->toArray());

    // Get all candidates
    $candidates = Candidate::all();

    // Process each candidate's weighted score
    $leaderboard = $candidates->map(function ($candidate) use ($segments) {
        $totalWeightedScore = 0;
        $logData = [];

        foreach ($segments as $segment) {
            // 🔄 Use correct SQL logic from getSegmentLeaderboard()
            $segmentScore = Candidate::join('scores', 'candidates.id', '=', 'scores.candidate_id')
                ->where('candidates.id', $candidate->id)
                ->where('scores.segment_id', $segment->segment_id)
                ->selectRaw('ROUND(SUM(scores.score) / COUNT(DISTINCT scores.judge_id), 2) as score')
                ->value('score') ?? 0;

            // ✅ Scale scores to 100 if judges are scoring out of 10
            if ($segmentScore <= 10) {
                $segmentScore *= 10;
            }

            // Weighted contribution
            $weightedScore = ($segmentScore * ($segment->weight / 100));
            $totalWeightedScore += $weightedScore;

            // Store log data
            $logData[] = [
                'segment' => $segment->segment->name,
                'segment_weight' => $segment->weight . '%',
                'candidate_score' => $segmentScore, // ✅ Scaled correctly
                'weighted_contribution' => $weightedScore,
            ];
        }

        // Log candidate calculation details
        Log::info("📝 Candidate: {$candidate->name}", $logData);

        return [
            'id' => $candidate->id,
            'name' => $candidate->name,
            'picture' => $candidate->picture,
            'raw_score' => $totalWeightedScore, // ✅ Store numeric value for sorting
        ];
    });

    // Sort candidates by total score (highest first)
    $leaderboard = $leaderboard->sortByDesc('raw_score')->values()->map(function ($candidate) {
        return [
            'id' => $candidate['id'],
            'name' => $candidate['name'],
            'picture' => $candidate['picture'],
            'total_score' => number_format($candidate['raw_score'], 2, '.', '') . '%', // ✅ Convert to percentage
        ];
    });

   

    return response()->json($leaderboard);
}

    
    
}
