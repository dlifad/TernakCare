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
        Schema::table('consultations', function (Blueprint $table) {
            $table->string('midtrans_order_id')->nullable()->after('is_paid');
            $table->string('midtrans_snap_token')->nullable()->after('midtrans_order_id');
            $table->string('payment_status')->nullable()->after('midtrans_snap_token');
            $table->json('payment_details')->nullable()->after('payment_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('consultations', function (Blueprint $table) {
            $table->dropColumn('midtrans_order_id');
            $table->dropColumn('midtrans_snap_token');
            $table->dropColumn('payment_status');
            $table->dropColumn('payment_details');
        });
    }
};