<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePairCandidatesTable extends Migration
{
    public function up()
    {
        Schema::create('pair_candidates', function (Blueprint $table) {
            $table->id();
            $table->string('pair_name'); // Name for the pair (e.g., "Team A")

            // Male Candidate Details
            $table->string('male_name');
            $table->integer('male_age');
            $table->string('male_vital');
            $table->string('male_picture')->nullable();
            // Female Candidate Details
            $table->string('female_name');
            $table->integer('female_age');
            $table->string('female_vital');
            $table->string('female_picture')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('pair_candidates');
    }
}