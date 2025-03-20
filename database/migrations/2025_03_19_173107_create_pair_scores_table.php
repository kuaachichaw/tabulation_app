<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('pair_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('judge_id')->constrained('judges')->onDelete('cascade');
            $table->foreignId('pair_id')->constrained('pair_candidates')->onDelete('cascade'); // Reference to pair_candidates table
            $table->string('gender', 10); // 'male' or 'female'
            $table->foreignId('pair_segment_id')->constrained('pair_segment_table')->onDelete('cascade'); // Reference to pair_segment_table
            $table->foreignId('pair_criteria_id')->constrained('pair_criterias_table')->onDelete('cascade'); // Reference to pair_criterias_table
            $table->decimal('score', 5, 2); // Allows decimal values like 9.5
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pair_scores');
    }
};