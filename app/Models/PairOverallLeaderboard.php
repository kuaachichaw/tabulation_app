<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PairOverallLeaderboard extends Model {
    use HasFactory;

    protected $table = 'pair_overall_leaderboard';

    protected $fillable = [
        'pair_segment_id',
        'gender',
        'weight'
    ];

    protected $casts = [
        'weight' => 'decimal:2'
    ];

    // Relationships
    public function pairSegment() {
        return $this->belongsTo(PairSegment::class);
    }

    // Scopes
    public function scopeMale($query) {
        return $query->where('gender', 'male');
    }

    public function scopeFemale($query) {
        return $query->where('gender', 'female');
    }

     public function segment()
    {
        return $this->belongsTo(PairSegment::class, 'pair_segment_id');
    }
}