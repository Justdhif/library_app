<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('isbn')->unique()->nullable();
            $table->string('isbn13')->unique()->nullable();
            $table->text('description')->nullable();
            $table->foreignId('publisher_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('category_id')->nullable()->constrained()->onDelete('set null');
            $table->year('publication_year')->nullable();
            $table->string('edition')->nullable();
            $table->integer('pages')->nullable();
            $table->string('language')->default('Indonesian');
            $table->string('cover_image')->nullable();
            $table->decimal('price', 10, 2)->nullable();
            $table->enum('format', ['hardcover', 'paperback', 'ebook', 'audiobook'])->default('paperback');
            $table->decimal('average_rating', 3, 2)->default(0);
            $table->integer('total_ratings')->default(0);
            $table->integer('total_copies')->default(0);
            $table->integer('available_copies')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->softDeletes();
            $table->timestamps();

            $table->index(['title', 'isbn', 'isbn13']);
            $table->fullText(['title', 'description']);
        });

        // Pivot table for books and categories (many-to-many)
        Schema::create('book_category', function (Blueprint $table) {
            $table->id();
            $table->foreignId('book_id')->constrained()->onDelete('cascade');
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('book_category');
        Schema::dropIfExists('books');
    }
};
