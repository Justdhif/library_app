<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('borrowings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('book_copy_id')->constrained()->onDelete('cascade');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('returned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->date('borrowed_date');
            $table->date('due_date');
            $table->date('returned_date')->nullable();
            $table->enum('status', ['pending', 'approved', 'active', 'returned', 'overdue', 'lost', 'cancelled'])->default('pending');
            $table->integer('renewal_count')->default(0);
            $table->integer('max_renewals')->default(2);
            $table->text('notes')->nullable();
            $table->text('return_notes')->nullable();
            $table->enum('return_condition', ['good', 'fair', 'poor', 'damaged'])->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status', 'due_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('borrowings');
    }
};
