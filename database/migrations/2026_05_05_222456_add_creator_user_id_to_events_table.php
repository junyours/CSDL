<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('events', function (Blueprint $table) {
            $table->foreignId('creator_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete(); // optional but recommended
        });
    }

    public function down()
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropForeign(['creator_user_id']);
            $table->dropColumn('creator_user_id');
        });
    }
};
