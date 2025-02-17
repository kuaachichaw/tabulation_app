<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('overall_leaderboard', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('segment_id');
            $table->decimal('weight', 5, 2); // Ensure weight is a percentage (0-100)
            $table->timestamps();

            $table->foreign('segment_id')->references('id')->on('segments')->onDelete('cascade');
        });
    }

    public function down() {
        Schema::dropIfExists('overall_leaderboard');
    }
};
