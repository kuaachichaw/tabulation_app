<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PairCandidate extends Model
{
    use HasFactory;

    protected $fillable = [
        'pair_name',
        'male_name',
        'male_age',
        'male_vital',
        'male_picture',
        'female_name',
        'female_age',
        'female_vital',
        'female_picture',
    ];

    // Relationship with judges
    public function judges()
    {
        return $this->belongsToMany(Judge::class, 'pair_candidate_judge');
    }

    // Accessor for male picture URL
    public function getMalePictureUrlAttribute()
    {
        return $this->male_picture ? asset('storage/' . $this->male_picture) : null;
    }

    // Accessor for female picture URL
    public function getFemalePictureUrlAttribute()
    {
        return $this->female_picture ? asset('storage/' . $this->female_picture) : null;
    }

    public function pairscores()
{
    return $this->hasMany(PairScore::class, 'pair_id');
}
}