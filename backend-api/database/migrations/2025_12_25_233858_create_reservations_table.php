<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('book_id')->constrained()->onDelete('cascade');
            $table->foreignId('book_copy_id')->nullable()->constrained()->onDelete('set null');
            $table->date('reservation_date');
            $table->date('expiry_date');
            $table->enum('status', ['pending', 'ready', 'fulfilled', 'expired', 'cancelled'])->default('pending');
            $table->integer('queue_position')->nullable();
            $table->timestamp('notified_at')->nullable();
            $table->timestamp('fulfilled_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'book_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
