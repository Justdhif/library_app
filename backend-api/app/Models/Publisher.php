<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Publisher extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'email',
        'phone',
        'address',
        'city',
        'country',
        'logo',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Accessors
    public function getLogoAttribute($value): ?string
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

    // Relationships
    public function books()
    {
        return $this->hasMany(Book::class);
    }

    public function activeBooks()
    {
        return $this->books()->where('is_active', true);
    }

    public function socialLinks()
    {
        return $this->hasMany(SocialLink::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Helper Methods
    public function getTotalBooksAttribute(): int
    {
        return $this->books()->count();
    }
}
