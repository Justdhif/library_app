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
        Schema::table('fines', function (Blueprint $table) {
            // Drop foreign key constraint dulu
            $table->dropForeign(['waived_by']);

            // Drop kolom yang tidak diperlukan
            $table->dropColumn([
                'type',
                'paid_amount',
                'remaining_amount',
                'due_date',
                'paid_date',
                'waived_by',
                'waiver_reason',
                'payment_method',
                'payment_reference'
            ]);
        });

        // Ubah status enum di statement terpisah
        Schema::table('fines', function (Blueprint $table) {
            $table->enum('status', ['unpaid', 'paid'])->default('unpaid')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('fines', function (Blueprint $table) {
            // Kembalikan kolom yang dihapus
            $table->enum('type', ['overdue', 'damage', 'lost', 'other'])->default('overdue')->after('borrowing_id');
            $table->decimal('paid_amount', 10, 2)->default(0)->after('amount');
            $table->decimal('remaining_amount', 10, 2)->after('paid_amount');
            $table->date('due_date')->nullable()->after('reason');
            $table->date('paid_date')->nullable()->after('due_date');
            $table->foreignId('waived_by')->nullable()->constrained('users')->onDelete('set null')->after('paid_date');
            $table->text('waiver_reason')->nullable()->after('waived_by');
            $table->string('payment_method')->nullable()->after('waiver_reason');
            $table->string('payment_reference')->nullable()->after('payment_method');

            // Kembalikan status enum
            $table->enum('status', ['unpaid', 'partially_paid', 'paid', 'waived'])->default('unpaid')->change();
        });
    }
};
