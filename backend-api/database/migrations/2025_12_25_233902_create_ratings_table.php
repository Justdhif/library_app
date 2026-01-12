<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ratings', function (Blueprint $table) {
            $table->id();
            $table->morphs('ratable');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->tinyInteger('rating')->unsigned();
            $table->text('review')->nullable();
            $table->boolean('is_verified_purchase')->default(false);
            $table->integer('helpful_count')->default(0);
            $table->integer('not_helpful_count')->default(0);
            $table->softDeletes();
            $table->timestamps();

            $table->unique(['ratable_type', 'ratable_id', 'user_id']);
            $table->index(['ratable_type', 'ratable_id', 'rating']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ratings');
    }
};
