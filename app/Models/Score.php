<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Score extends Model
{
    use HasFactory;

    protected $fillable = ['judge_id', 'candidate_id', 'segment_id', 'criterion_id', 'score'];

    public function judge()
    {
        return $this->belongsTo(User::class, 'judge_id');
    }

    public function candidate()
    {
        return $this->belongsTo(Candidate::class);
    }

    public function segment()
    {
        return $this->belongsTo(Segment::class);
    }

    public function criterion()
    {
        return $this->belongsTo(Criterion::class);
    }
}
