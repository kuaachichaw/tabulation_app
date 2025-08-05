<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('pair_overall_leaderboard', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('pair_segment_id');
            $table->string('gender', 6); // 'male' or 'female'
            $table->decimal('weight', 5, 2); // 0-100%
            $table->timestamps();

            $table->foreign('pair_segment_id')
                  ->references('id')
                  ->on('pair_segment_table')
                  ->onDelete('cascade');
            
            $table->unique(['pair_segment_id', 'gender']);
        });
    }

    public function down() {
        Schema::dropIfExists('pair_overall_leaderboard');
    }
};