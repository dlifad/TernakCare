<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('consultations', function (Blueprint $table) {
            $table->boolean('is_completed')->default(0);
        });
    }
    
    public function down()
    {
        Schema::table('consultations', function (Blueprint $table) {
            $table->dropColumn('is_completed');
        });
    }
    
};
