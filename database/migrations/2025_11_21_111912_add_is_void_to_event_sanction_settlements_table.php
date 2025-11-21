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
        Schema::table('event_sanction_settlements', function (Blueprint $table) {
            $table->boolean('is_void')->default(0)->after('transaction_date_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('event_sanction_settlements', function (Blueprint $table) {
            //
        });
    }
};
