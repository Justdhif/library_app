<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Rating extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'ratable_type',
        'ratable_id',
        'user_id',
        'rating',
        'review',
        'is_verified_purchase',
        'helpful_count',
        'not_helpful_count',
    ];

    protected $casts = [
        'rating' => 'integer',
        'is_verified_purchase' => 'boolean',
        'helpful_count' => 'integer',
        'not_helpful_count' => 'integer',
    ];

    // Polymorphic Relationship
    public function ratable()
    {
        return $this->morphTo();
    }

    // Regular Relationship
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeVerified($query)
    {
        return $query->where('is_verified_purchase', true);
    }

    public function scopeByRating($query, int $rating)
    {
        return $query->where('rating', $rating);
    }

    public function scopeWithReview($query)
    {
        return $query->whereNotNull('review');
    }

    // Helper Methods
    public function markAsHelpful(): void
    {
        $this->increment('helpful_count');
    }

    public function markAsNotHelpful(): void
    {
        $this->increment('not_helpful_count');
    }

    public function getHelpfulnessRatioAttribute(): float
    {
        $total = $this->helpful_count + $this->not_helpful_count;
        if ($total === 0) return 0;
        return round(($this->helpful_count / $total) * 100, 2);
    }
}
