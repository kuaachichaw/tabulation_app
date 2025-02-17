<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OverallLeaderboard extends Model {
    use HasFactory;

    protected $table = 'overall_leaderboard';

    protected $fillable = ['segment_id', 'weight'];

    public function segment() {
        return $this->belongsTo(Segment::class);
    }
}
