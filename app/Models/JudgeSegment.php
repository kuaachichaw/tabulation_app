<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JudgeSegment extends Model
{
    use HasFactory;

    protected $table = 'judge_segment';

    protected $fillable = [
        'judge_id',
        'segment_id',
    ];

    // Relationship with Judge
    public function judge()
    {
        return $this->belongsTo(Judge::class);
    }

    // Relationship with Segment
    public function segment()
    {
        return $this->belongsTo(Segment::class);
    }
}
