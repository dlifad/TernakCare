<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddPhotoColumnsToUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            // Tambahkan kolom baru
            $table->string('photo_path')->nullable()->after('password');
            
            // Jika sudah ada kolom photo_url, Anda tidak perlu menambahkannya lagi
            // Jika belum ada, tambahkan baris berikut:
            $table->string('photo_url')->nullable()->after('photo_path');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            // Hapus kolom jika migration di-rollback
            $table->dropColumn(['photo_path', 'photo_url']);
        });
    }
}