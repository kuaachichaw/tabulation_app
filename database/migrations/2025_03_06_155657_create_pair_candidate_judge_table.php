<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('pair_candidate_judge', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pair_candidate_id')->constrained()->onDelete('cascade');
            $table->foreignId('judge_id')->constrained()->onDelete('cascade');
            $table->boolean('assigned_male')->default(false); // Tracks if male candidate is assigned
            $table->boolean('assigned_female')->default(false); // Tracks if female candidate is assigned
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::dropIfExists('pair_candidate_judge');
    }
};