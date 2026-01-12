<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Fine extends Model
{
    use HasFactory;

    /**
     * Field yang dapat diisi mass assignment
     *
     * Field yang tersisa:
     * - user_id: ID member yang kena denda
     * - borrowing_id: ID peminjaman yang terkait (nullable jika denda manual)
     * - amount: Jumlah total denda (overdue + kondisi buku)
     * - status: Status pembayaran (unpaid/paid)
     * - reason: Alasan/keterangan denda (opsional)
     */
    protected $fillable = [
        'user_id',
        'borrowing_id',
        'amount',
        'status',
        'reason',
    ];

    /**
     * Casting tipe data
     */
    protected $casts = [
        'amount' => 'decimal:2',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function borrowing()
    {
        return $this->belongsTo(Borrowing::class);
    }

    // Scopes
    public function scopeUnpaid($query)
    {
        return $query->where('status', 'unpaid');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    // Helper Methods
    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }

    public function markAsPaid(): void
    {
        $this->update([
            'status' => 'paid',
        ]);
    }
}
