<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('doctors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('license_number')->unique();
            $table->string('specialization');
            $table->text('practice_address');
            $table->string('phone_number');
            $table->string('education');
            $table->integer('years_experience')->default(0);
            $table->enum('status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->string('profile_photo')->nullable();
            $table->text('about')->nullable();
            $table->decimal('consultation_fee', 10, 2)->nullable();
            $table->boolean('is_available_online')->default(false);
            $table->json('working_hours')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('doctors');
    }
};
