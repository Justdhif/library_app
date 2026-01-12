<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('book_copies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('book_id')->constrained()->onDelete('cascade');
            $table->string('barcode')->unique();
            $table->string('call_number')->nullable();
            $table->enum('condition', ['new', 'good', 'fair', 'poor', 'damaged'])->default('good');
            $table->enum('status', ['available', 'borrowed', 'reserved', 'lost', 'maintenance', 'retired'])->default('available');
            $table->string('location')->nullable();
            $table->string('shelf_number')->nullable();
            $table->date('acquisition_date')->nullable();
            $table->decimal('acquisition_price', 10, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('last_borrowed_at')->nullable();
            $table->integer('times_borrowed')->default(0);
            $table->softDeletes();
            $table->timestamps();

            $table->index(['barcode', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('book_copies');
    }
};
