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
        Schema::create('returns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('borrowing_id')->constrained('borrowings')->onDelete('cascade');
            $table->foreignId('returned_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('processed_by')->constrained('users')->onDelete('cascade');
            $table->timestamp('returned_date');
            $table->enum('return_condition', ['good', 'fair', 'damaged', 'lost'])->default('good');
            $table->text('notes')->nullable();
            $table->text('damage_description')->nullable();
            $table->decimal('fine_amount', 10, 2)->default(0);
            $table->boolean('fine_paid')->default(false);
            $table->boolean('fine_waived')->default(false);
            $table->timestamp('fine_payment_date')->nullable();
            $table->string('fine_payment_method')->nullable();
            $table->string('fine_payment_reference')->nullable();
            $table->timestamps();

            // Indexes
            $table->index('borrowing_id');
            $table->index('returned_by');
            $table->index('processed_by');
            $table->index('returned_date');
            $table->index('fine_paid');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('returns');
    }
};
