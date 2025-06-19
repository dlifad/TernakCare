<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Update cart_items.cart_id
        Schema::table('cart_items', function (Blueprint $table) {
            $table->dropForeign('cart_items_cart_id_foreign');
            $table->foreign('cart_id')
                ->references('id')->on('carts')
                ->onDelete('cascade');
        });

        // Update carts.farmer_id
        Schema::table('carts', function (Blueprint $table) {
            $table->dropForeign('carts_farmer_id_foreign');
            $table->foreign('farmer_id')
                ->references('id')->on('farmers')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('cart_items', function (Blueprint $table) {
            $table->dropForeign(['cart_id']);
            $table->foreign('cart_id')
                ->references('id')->on('carts')
                ->onDelete('restrict');
        });

        Schema::table('carts', function (Blueprint $table) {
            $table->dropForeign(['farmer_id']);
            $table->foreign('farmer_id')
                ->references('id')->on('farmers')
                ->onDelete('restrict');
        });
    }
};
