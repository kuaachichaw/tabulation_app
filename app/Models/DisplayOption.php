<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DisplayOption extends Model
{
    protected $table = 'Display_Option';
    protected $fillable = [
        'Display_Leaderboard',
        'Display_Candidate',
        'Display_Segment',
        'Display_Scoring'
    ];
}