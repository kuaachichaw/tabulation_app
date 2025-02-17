<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Candidate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'age',
        'vital',
        'picture'
    ];

    // Add this accessor for proper image URL
    public function getPictureUrlAttribute()
    {
        return asset('storage/'.$this->picture);
    }

    public function judges()
{
    return $this->belongsToMany(Judge::class, 'candidate_judge');
}

public function segments()
    {
        return $this->hasManyThrough(
            Segment::class,    // Final table we want
            JudgeSegment::class, // Bridge table
            'judge_id',        // Foreign key on judge_segment table
            'id',              // Local key on segment table
            'id',              // Local key on candidate table
            'segment_id'       // Foreign key on judge_segment table
        );
    }

    public function scores()
{
    return $this->hasMany(Score::class);
}

}