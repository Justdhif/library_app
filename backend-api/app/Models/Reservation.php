<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'book_id',
        'book_copy_id',
        'reservation_date',
        'expiry_date',
        'status',
        'queue_position',
        'notified_at',
        'fulfilled_at',
        'notes',
    ];

    protected $casts = [
        'reservation_date' => 'datetime',
        'expiry_date' => 'datetime',
        'notified_at' => 'datetime',
        'fulfilled_at' => 'datetime',
        'queue_position' => 'integer',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    public function bookCopy()
    {
        return $this->belongsTo(BookCopy::class);
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeReady($query)
    {
        return $query->where('status', 'ready');
    }

    public function scopeExpired($query)
    {
        return $query->where('status', 'pending')
            ->where('expiry_date', '<', now());
    }

    // Helper Methods
    public function isExpired(): bool
    {
        return $this->expiry_date && $this->expiry_date->isPast();
    }

    public function markAsReady(BookCopy $bookCopy): void
    {
        $this->update([
            'status' => 'ready',
            'book_copy_id' => $bookCopy->id,
            'notified_at' => now(),
        ]);
    }

    public function markAsFulfilled(): void
    {
        $this->update([
            'status' => 'fulfilled',
            'fulfilled_at' => now(),
        ]);
    }
}
