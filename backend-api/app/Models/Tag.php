<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'color',
        'usage_count',
    ];

    protected $casts = [
        'usage_count' => 'integer',
    ];

    // Polymorphic Relationships
    public function books()
    {
        return $this->morphedByMany(Book::class, 'taggable', 'taggables')
            ->withPivot('tagged_by')
            ->withTimestamps();
    }

    public function authors()
    {
        return $this->morphedByMany(Author::class, 'taggable', 'taggables')
            ->withPivot('tagged_by')
            ->withTimestamps();
    }

    // Scopes
    public function scopePopular($query, $limit = 10)
    {
        return $query->orderBy('usage_count', 'desc')->limit($limit);
    }

    // Helper Methods
    public function incrementUsage(): void
    {
        $this->increment('usage_count');
    }

    public function decrementUsage(): void
    {
        $this->decrement('usage_count');
    }
}
