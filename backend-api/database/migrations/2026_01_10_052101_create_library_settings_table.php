<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('library_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('string'); // string, json, boolean
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Insert default settings
        DB::table('library_settings')->insert([
            [
                'key' => 'operating_hours_mode',
                'value' => 'weekdays', // custom, weekdays, everyday
                'type' => 'string',
                'description' => 'Mode operasional perpustakaan',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'opening_time',
                'value' => '08:00',
                'type' => 'string',
                'description' => 'Jam buka perpustakaan',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'closing_time',
                'value' => '17:00',
                'type' => 'string',
                'description' => 'Jam tutup perpustakaan',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'closed_on_holidays',
                'value' => 'true',
                'type' => 'boolean',
                'description' => 'Tutup pada hari libur nasional',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'closed_on_weekends',
                'value' => 'true',
                'type' => 'boolean',
                'description' => 'Tutup pada akhir pekan (Sabtu-Minggu)',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'custom_closed_days',
                'value' => json_encode([]), // Array of day numbers: 0=Sunday, 6=Saturday
                'type' => 'json',
                'description' => 'Hari-hari custom yang tutup (untuk mode custom)',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('library_settings');
    }
};
