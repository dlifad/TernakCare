<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // database/migrations/xxxx_xx_xx_xxxxxx_add_sender_fields_to_chats_table.php
    public function up(): void
    {
        Schema::table('chats', function (Blueprint $table) {
            // Tambahkan setelah kolom consultation_id atau di mana pun yang sesuai
            if (!Schema::hasColumn('chats', 'sender_type')) { // Cek jika kolom belum ada
                $table->string('sender_type')->after('consultation_id');
            }
            if (!Schema::hasColumn('chats', 'sender_id')) { // Cek jika kolom belum ada
                $table->unsignedBigInteger('sender_id')->after('sender_type');
                // $table->foreign('sender_id')->references('id')->on('users')->onDelete('cascade'); // Opsional foreign key
            }
        });
    }

    public function down(): void
    {
        Schema::table('chats', function (Blueprint $table) {
            $table->dropColumn(['sender_type', 'sender_id']);
            // $table->dropForeign(['sender_id']); // Jika Anda menambahkan foreign key
        });
    }
};
