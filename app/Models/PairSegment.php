<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PairSegment extends Model
{
    use HasFactory;

    protected $table = 'pair_segment_table'; // Specify the table name
    protected $fillable = ['pair_name', 'male_name', 'female_name']; // Fillable fields

    // Define relationship with PairCriteria
    public function criterias()
    {
        return $this->hasMany(PairCriteria::class, 'pair_segment_id');
    }

     
      public function pairjudgeSegments()
     {
    return $this->hasMany(PairJudgeSegment::class, 'pair_segment_id');
     }
}