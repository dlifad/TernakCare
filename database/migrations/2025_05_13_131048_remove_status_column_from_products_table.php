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
        Schema::table('products', function (Blueprint $table) {
            // Hapus kolom status jika ada
            if (Schema::hasColumn('products', 'status')) {
                $table->dropColumn('status');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Tambahkan kembali kolom status jika migrasi dirollback
            if (!Schema::hasColumn('products', 'status')) {
                $table->string('status')->default('active')->after('is_active');
            }
        });
    }
};