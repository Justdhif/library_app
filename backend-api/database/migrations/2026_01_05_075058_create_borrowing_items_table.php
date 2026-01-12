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
        Schema::create('borrowing_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('borrowing_id')->constrained()->onDelete('cascade');
            $table->foreignId('book_copy_id')->constrained()->onDelete('restrict');
            $table->enum('status', ['borrowed', 'returned', 'lost', 'damaged'])->default('borrowed');
            $table->date('borrowed_date');
            $table->date('due_date');
            $table->date('returned_date')->nullable();
            $table->text('return_notes')->nullable();
            $table->enum('return_condition', ['good', 'fair', 'damaged'])->nullable();
            $table->decimal('fine_amount', 10, 2)->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['borrowing_id', 'status']);
            $table->index('book_copy_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('borrowing_items');
    }
};
