<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DisplayOption;

class DisplayOptionController extends Controller
{
    public function get()
    {
        try {
            // Fetch the first record or return defaults if none exists
            $settings = DisplayOption::firstOrNew([]);
            
            return response()->json([
                'Display_Leaderboard' => $settings->Display_Leaderboard ?? 0,
                'Display_Candidate'   => $settings->Display_Candidate ?? 0,
                'Display_Segment'    => $settings->Display_Segment ?? 0,
                'Display_Scoring'     => $settings->Display_Scoring ?? 0,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch display settings',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function save(Request $request)
    {
        $validated = $request->validate([
            'Display_Leaderboard' => 'required|integer|in:0,1,2',
            'Display_Candidate'   => 'required|integer|in:0,1,2',
            'Display_Segment'    => 'required|integer|in:0,1,2',
            'Display_Scoring'    => 'required|integer|in:0,1,2',
        ]);

        try {
            DisplayOption::updateOrCreate(
                ['id' => 1], // Ensure a single row exists
                $validated
            );

            return response()->json(['success' => true, 'message' => 'Settings saved!']);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to save settings',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}