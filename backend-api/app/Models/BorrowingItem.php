<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BorrowingItem extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'borrowing_id',
        'book_copy_id',
        'status',
        'borrowed_date',
        'due_date',
        'returned_date',
        'return_notes',
        'return_condition',
        'fine_amount',
    ];

    protected $casts = [
        'borrowed_date' => 'date',
        'due_date' => 'date',
        'returned_date' => 'date',
        'fine_amount' => 'decimal:2',
    ];

    // Relationships
    public function borrowing()
    {
        return $this->belongsTo(Borrowing::class);
    }

    public function bookCopy()
    {
        return $this->belongsTo(BookCopy::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'borrowed');
    }

    public function scopeReturned($query)
    {
        return $query->where('status', 'returned');
    }

    public function scopeOverdue($query)
    {
        return $query->where('status', 'borrowed')
            ->where('due_date', '<', now());
    }

    // Helper Methods
    public function isOverdue(): bool
    {
        return $this->status === 'borrowed' && $this->due_date < now();
    }

    public function calculateFine(): float
    {
        if (!$this->isOverdue()) {
            return 0;
        }

        $daysLate = now()->diffInDays($this->due_date);
        $finePerDay = 1000; // Rp 1.000 per day

        return $daysLate * $finePerDay;
    }
}
