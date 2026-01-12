<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Borrowing extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'user_id',
        'book_copy_id',
        'approved_by',
        'returned_to',
        'borrowed_date',
        'due_date',
        'returned_date',
        'status',
        'renewal_count',
        'max_renewals',
        'notes',
        'return_notes',
        'return_condition',
    ];

    protected $casts = [
        'borrowed_date' => 'datetime',
        'due_date' => 'datetime',
        'returned_date' => 'datetime',
        'renewal_count' => 'integer',
        'max_renewals' => 'integer',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['status', 'due_date', 'returned_date', 'renewal_count'])
            ->logOnlyDirty();
    }

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function bookCopy()
    {
        return $this->belongsTo(BookCopy::class);
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function returnedTo()
    {
        return $this->belongsTo(User::class, 'returned_to');
    }

    public function items()
    {
        return $this->hasMany(BorrowingItem::class);
    }

    public function fines()
    {
        return $this->hasMany(Fine::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeOverdue($query)
    {
        return $query->where('status', 'active')
            ->where('due_date', '<', now());
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    // Helper Methods
    public function isOverdue(): bool
    {
        return $this->status === 'active' && $this->due_date->isPast();
    }

    public function canRenew(): bool
    {
        return $this->status === 'active'
            && $this->renewal_count < $this->max_renewals
            && !$this->isOverdue();
    }

    public function renew(int $days = 14): bool
    {
        if (!$this->canRenew()) return false;

        $this->update([
            'due_date' => $this->due_date->addDays($days),
            'renewal_count' => $this->renewal_count + 1,
        ]);

        return true;
    }

    public function getDaysOverdueAttribute(): int
    {
        if (!$this->isOverdue()) return 0;
        return now()->diffInDays($this->due_date);
    }
}
