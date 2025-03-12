<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PairCriteria extends Model
{
    use HasFactory;

    protected $table = 'pair_criterias_table'; // Specify the table name
    protected $fillable = ['pair_segment_id', 'type', 'criteria_name', 'weight']; // Fillable fields

    // Define relationship with PairSegment
    public function pairSegment()
    {
        return $this->belongsTo(PairSegment::class, 'pair_segment_id');
    }
}