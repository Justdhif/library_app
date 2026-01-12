<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Author extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'biography',
        'birth_date',
        'death_date',
        'nationality',
        'photo',
        'is_active',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'death_date' => 'date',
        'is_active' => 'boolean',
    ];

    // Accessors
    public function getPhotoAttribute($value): ?string
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
        return $this->belongsToMany(Book::class, 'author_book')
            ->withPivot('order')
            ->withTimestamps()
            ->orderByPivot('order');
    }

    public function socialLinks()
    {
        return $this->hasMany(SocialLink::class);
    }

    public function tags()
    {
        return $this->morphToMany(Tag::class, 'taggable', 'taggables')
            ->withPivot('tagged_by')
            ->withTimestamps();
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeAlive($query)
    {
        return $query->whereNull('death_date');
    }

    // Helper Methods
    public function isAlive(): bool
    {
        return is_null($this->death_date);
    }

    public function getAgeAttribute(): ?int
    {
        if (!$this->birth_date) return null;
        $endDate = $this->death_date ?? now();
        return $this->birth_date->diffInYears($endDate);
    }
}
