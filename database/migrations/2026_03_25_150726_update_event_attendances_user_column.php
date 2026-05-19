<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('event_attendances', function (Blueprint $table) {
            // Rename column
            $table->renameColumn('user_id_no', 'user_id');
        });

        Schema::table('event_attendances', function (Blueprint $table) {
            // Change type to unsignedBigInteger (foreign key type)
            $table->unsignedBigInteger('user_id')->change();

            // Add foreign key constraint
            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('event_attendances', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->renameColumn('user_id', 'user_id_no');
        });
    }
};
