<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Segment extends Model
{
    use HasFactory;
  

    protected $fillable = ['name', 'total_score'];

      // A Segment has many Criteria
      public function criteria()
      {
          return $this->hasMany(Criteria::class, 'segment_id');
      }
  
      // Relationship with Judges
      public function judges()
      {
          return $this->belongsToMany(Judge::class, 'judge_segment');
      }

      public function judgeSegments()
{
    return $this->hasMany(JudgeSegment::class, 'segment_id');
}

public function scores()
{
    return $this->hasMany(Score::class);
}

public function overallLeaderboard() {
    return $this->hasOne(OverallLeaderboard::class);
}


    }
