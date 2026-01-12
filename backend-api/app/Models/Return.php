<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class BookReturn extends Model
{
    use HasFactory, LogsActivity;

    protected $table = 'returns';

    protected $fillable = [
        'borrowing_id',
        'returned_by',
        'processed_by',
        'returned_date',
        'return_condition',
        'notes',
        'damage_description',
        'fine_amount',
        'fine_paid',
        'fine_waived',
        'fine_payment_date',
        'fine_payment_method',
        'approval_status',
        'approved_by',
        'approved_at',
        'approval_notes',
    ];

    protected $casts = [
        'returned_date' => 'datetime',
        'fine_paid' => 'boolean',
        'fine_waived' => 'boolean',
        'fine_amount' => 'decimal:2',
        'fine_payment_date' => 'datetime',
        'approved_at' => 'datetime',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'return_condition',
                'fine_amount',
                'fine_paid',
                'fine_waived',
            ])
            ->logOnlyDirty();
    }

    // Relationships
    public function borrowing()
    {
        return $this->belongsTo(Borrowing::class);
    }

    public function returnedBy()
    {
        return $this->belongsTo(User::class, 'returned_by');
    }

    public function processedBy()
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // Scopes
    public function scopeWithFines($query)
    {
        return $query->where('fine_amount', '>', 0);
    }

    public function scopeUnpaidFines($query)
    {
        return $query->where('fine_amount', '>', 0)
            ->where('fine_paid', false)
            ->where('fine_waived', false);
    }

    public function scopePaidFines($query)
    {
        return $query->where('fine_paid', true);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('returned_date', today());
    }

    public function scopePending($query)
    {
        return $query->where('approval_status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('approval_status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('approval_status', 'rejected');
    }

    // Helper Methods
    public function hasFine(): bool
    {
        return $this->fine_amount > 0;
    }

    public function isFinePaid(): bool
    {
        return $this->fine_paid || $this->fine_waived;
    }

    public function remainingFine(): float
    {
        if ($this->fine_paid || $this->fine_waived) {
            return 0;
        }
        return (float) $this->fine_amount;
    }

    public function calculateLateDays(): int
    {
        $dueDate = $this->borrowing->due_date;
        $returnDate = $this->returned_date;

        if ($returnDate->lte($dueDate)) {
            return 0;
        }

        return $dueDate->diffInDays($returnDate);
    }
}
