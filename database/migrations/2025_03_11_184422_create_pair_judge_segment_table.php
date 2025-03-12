<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pair_judge_segment', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pair_segment_id')->constrained('pair_segment_table')->onDelete('cascade'); // Foreign key to pair_segment_table
            $table->foreignId('judge_id')->constrained('judges')->onDelete('cascade'); // Foreign key to judges table
            $table->timestamps(); // Created at and updated at timestamps
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pair_judge_segment');
    }
};