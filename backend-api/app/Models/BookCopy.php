<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BookCopy extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'book_id',
        'barcode',
        'call_number',
        'condition',
        'status',
        'location',
        'shelf_number',
        'acquisition_date',
        'acquisition_price',
        'notes',
        'last_borrowed_at',
        'times_borrowed',
    ];

    protected $casts = [
        'acquisition_date' => 'date',
        'acquisition_price' => 'decimal:2',
        'last_borrowed_at' => 'datetime',
        'times_borrowed' => 'integer',
    ];

    // Relationships
    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    public function borrowings()
    {
        return $this->hasMany(Borrowing::class);
    }

    public function activeBorrowing()
    {
        return $this->hasOne(Borrowing::class)->where('status', 'active');
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    // Scopes
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    public function scopeBorrowed($query)
    {
        return $query->where('status', 'borrowed');
    }

    public function scopeByCondition($query, $condition)
    {
        return $query->where('condition', $condition);
    }

    // Helper Methods
    public function isAvailable(): bool
    {
        return $this->status === 'available';
    }

    public function isBorrowed(): bool
    {
        return $this->status === 'borrowed';
    }

    public function markAsBorrowed(): void
    {
        $this->update([
            'status' => 'borrowed',
            'last_borrowed_at' => now(),
            'times_borrowed' => $this->times_borrowed + 1,
        ]);
    }

    public function markAsReturned(): void
    {
        $this->update(['status' => 'available']);
    }
}
