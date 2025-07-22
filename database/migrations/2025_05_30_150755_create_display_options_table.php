<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('Display_Option', function (Blueprint $table) {
            $table->id();
            $table->tinyInteger('Display_Leaderboard')->default(0)
                ->comment('0: Individual, 1: Pair, 2: Both');
            $table->tinyInteger('Display_Candidate')->default(0)
                ->comment('0: Individual, 1: Pair, 2: Both');
            $table->tinyInteger('Display_Segment')->default(0)
                ->comment('0: Individual, 1: Pair, 2: Both');
            $table->tinyInteger('Display_Scoring')->default(0)
                ->comment('0: Individual, 1: Pair, 2: Both');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('Display_Option');
    }
};