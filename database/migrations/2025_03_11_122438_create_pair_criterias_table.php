<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pair_criterias_table', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pair_segment_id')->constrained('pair_segment_table')->onDelete('cascade'); // Foreign key to pair_segment_table
            $table->string('type'); // 'male' or 'female'
            $table->string('criteria_name'); // Name of the criteria
            $table->decimal('weight', 5, 2); // Weight of the criteria (e.g., 50.00)
            $table->timestamps(); // Created at and updated at timestamps
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pair_criterias_table');
    }
};
