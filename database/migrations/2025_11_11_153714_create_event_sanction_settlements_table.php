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
        Schema::create('event_sanction_settlements', function (Blueprint $table) {
            $table->id();

            $table->string('transaction_code');
            $table->foreignId('event_id')->constrained('events');
            $table->string('user_id_no');

            $table->foreignId('sanction_id')->constrained('sanctions');
            $table->enum('settlement_type', ['monetary', 'service', 'waived']);

            $table->decimal('amount_paid', 10, 2)->nullable();
            $table->integer('service_completed')->nullable();
            $table->enum('service_time_type', ['minutes', 'hours'])->nullable();

            $table->foreignId('settlement_logged_by')->constrained('user_student_councils');
            $table->enum('status', ['settled', 'waived'])->default('settled');
            $table->text('remarks')->nullable();

            $table->dateTime('transaction_date_time');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_sanction_settlements');
    }
};
