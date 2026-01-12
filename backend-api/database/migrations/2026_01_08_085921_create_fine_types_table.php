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
        Schema::create('fine_types', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "Buku Rusak Ringan", "Buku Rusak Parah"
            $table->string('code')->unique(); // e.g., "FAIR_DAMAGE", "POOR_DAMAGE"
            $table->enum('book_condition', ['fair', 'poor', 'damaged']); // Kondisi buku yang memicu denda
            $table->decimal('amount', 10, 2); // Nominal denda
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('book_condition');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fine_types');
    }
};
