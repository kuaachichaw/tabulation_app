<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PairScore extends Model
{
    use HasFactory;

    protected $table = 'pair_scores'; // Explicitly define the table name

    protected $fillable = [
        'judge_id',
        'pair_id',
        'gender',
        'pair_segment_id',
        'pair_criteria_id',
        'score',
    ];

    // Define relationships
    public function judge()
    {
        return $this->belongsTo(Judge::class);
    }

    public function pairCandidate()
    {
        return $this->belongsTo(PairCandidate::class, 'pair_id');
    }

    public function pairSegment()
    {
        return $this->belongsTo(PairSegment::class, 'pair_segment_id');
    }

    public function pairCriteria()
    {
        return $this->belongsTo(PairCriteria::class, 'pair_criteria_id');
    }
}