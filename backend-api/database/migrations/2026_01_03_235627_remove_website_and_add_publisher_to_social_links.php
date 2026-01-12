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
        // Remove website from authors table
        Schema::table('authors', function (Blueprint $table) {
            $table->dropColumn('website');
        });

        // Remove website from publishers table
        Schema::table('publishers', function (Blueprint $table) {
            $table->dropColumn('website');
        });

        // Add publisher_id to social_links table
        Schema::table('social_links', function (Blueprint $table) {
            // Make author_id nullable since now we support both authors and publishers
            $table->foreignId('author_id')->nullable()->change();

            // Add publisher_id
            $table->foreignId('publisher_id')->nullable()->after('author_id')->constrained()->onDelete('cascade');

            // Add index for faster queries
            $table->index(['author_id', 'publisher_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Restore website to authors table
        Schema::table('authors', function (Blueprint $table) {
            $table->string('website')->nullable()->after('photo');
        });

        // Restore website to publishers table
        Schema::table('publishers', function (Blueprint $table) {
            $table->string('website')->nullable()->after('country');
        });

        // Remove publisher_id from social_links table
        Schema::table('social_links', function (Blueprint $table) {
            $table->dropForeign(['publisher_id']);
            $table->dropColumn('publisher_id');

            // Make author_id not nullable again
            $table->foreignId('author_id')->nullable(false)->change();
        });
    }
};
