<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   // database/migrations/xxxx_xx_xx_create_criteria_table.php

public function up()
{
    Schema::create('segments', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->decimal('total_score', 5, 2)->default(0);  // Optional: In case you want to store the total score
        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('segment');
    }
};
