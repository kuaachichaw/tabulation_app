<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PairJudgeSegment extends Model
{
    use HasFactory;

    protected $table = 'pair_judge_segment'; // Specify the table name

    protected $fillable = [
        'pair_segment_id',
        'judge_id',
    ];

    // Define the relationship with PairSegment
    public function pairSegment()
    {
        return $this->belongsTo(PairSegment::class, 'pair_segment_id');
    }

    // Define the relationship with Judge
    public function judge()
    {
        return $this->belongsTo(Judge::class, 'judge_id');
    }
}