<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'role',
        'full_name',
        'phone',
        'address',
        'city',
        'state',
        'postal_code',
        'country',
        'date_of_birth',
        'gender',
        'avatar',
        'bio',
        'member_card_number',
        'membership_start_date',
        'membership_expiry_date',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'membership_start_date' => 'date',
        'membership_expiry_date' => 'date',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Accessors
    public function getAvatarAttribute($value): ?string
    {
        if (!$value) {
            return null;
        }

        // If already a full URL (starts with http), return as is
        if (str_starts_with($value, 'http')) {
            return $value;
        }

        // Otherwise, prepend storage URL
        return url('storage/' . $value);
    }

    // Helper Methods
    public function isMembershipExpired(): bool
    {
        return $this->membership_expiry_date && $this->membership_expiry_date->isPast();
    }

    public function getMembershipStatusAttribute(): string
    {
        if (!$this->membership_expiry_date) return 'inactive';
        return $this->isMembershipExpired() ? 'expired' : 'active';
    }
}
