<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pair_segment_table', function (Blueprint $table) {
            $table->id();
            $table->string('pair_name'); // Name of the pair segment
            $table->string('male_name'); // Male segment name
            $table->string('female_name'); // Female segment name
            $table->timestamps(); // Created at and updated at timestamps
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pair_segment_table');
    }
};