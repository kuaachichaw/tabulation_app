<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Judge extends Authenticatable
{
    use Notifiable;

    protected $table = 'judges'; // Specify the table name
    protected $primaryKey = 'id'; // Specify the primary key

    protected $fillable = [
        'name',
        'username',
        'password',
        'picture', // Add this line
    ];

    protected $hidden = [
        'password',
    ];

    public function getPictureUrlAttribute()
    {
        return asset('storage/' . $this->picture);
    }

    // Relationship with Candidates
    public function candidates()
    {
        return $this->belongsToMany(Candidate::class, 'candidate_judge', 'judge_id', 'candidate_id')
            ->withTimestamps();
    }
    // Relationship with Segments
    public function segments()
    {
        return $this->belongsToMany(Segment::class, 'judge_segment', 'judge_id', 'segment_id')
            ->withTimestamps();
    }


      // Relationship with Pair Candidates
      public function pairCandidates()
      {
      return $this->belongsToMany(PairCandidate::class, 'pair_candidate_judge');
      }
      // Relationship with Pair Segments
      public function pairsegments()
      {
          return $this->belongsToMany(PairSegment::class, 'pair_segment_table', 'judge_id', 'pair_segment_id')
              ->withTimestamps();
      }
  

       // Add PairSegment

}
