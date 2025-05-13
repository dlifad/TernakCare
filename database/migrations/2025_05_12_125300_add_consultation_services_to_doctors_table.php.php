<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('doctors', function (Blueprint $table) {
            $table->boolean('chat_service_active')->default(false);
            $table->decimal('chat_service_fee', 10, 2)->nullable();
            
            $table->boolean('video_call_service_active')->default(false);
            $table->decimal('video_call_service_fee', 10, 2)->nullable();
            
            $table->boolean('home_visit_service_active')->default(false);
            $table->decimal('home_visit_service_fee', 10, 2)->nullable();
        });
    }

    public function down()
    {
        Schema::table('doctors', function (Blueprint $table) {
            $table->dropColumn([
                'chat_service_active', 'chat_service_fee',
                'video_call_service_active', 'video_call_service_fee',
                'home_visit_service_active', 'home_visit_service_fee'
            ]);
        });
    }
};