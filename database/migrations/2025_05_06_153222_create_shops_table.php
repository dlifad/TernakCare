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
        Schema::create('shops', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('shop_name');
            $table->string('shop_phone');
            $table->text('shop_address');
            $table->text('shop_description');
            $table->string('business_license');
            $table->string('shop_type');
            $table->string('owner_id_number');
            $table->enum('status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->string('shop_logo')->nullable();
            $table->string('shop_banner')->nullable();
            $table->json('delivery_options')->nullable();
            $table->json('payment_methods')->nullable();
            $table->json('operating_hours')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shops');
    }
};
