<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Criteria extends Model
{
    use HasFactory;

    protected $fillable = ['segment_id', 'name', 'weight'];

    public function segment()
    {
        return $this->belongsTo(Segment::class);
    }
}
