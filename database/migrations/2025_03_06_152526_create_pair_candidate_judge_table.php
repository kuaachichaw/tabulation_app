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
            $table->foreignId('pair_candidate_id')->constrained()->onDelete('cascade'); // Foreign key to pair_candidates table
            $table->foreignId('judge_id')->constrained()->onDelete('cascade'); // Foreign key to judges table
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pair_candidate_judge');
    }
};