<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Book extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'title', 'slug', 'isbn', 'isbn13', 'description', 'publisher_id',
        'publication_year', 'edition', 'pages', 'language',
        'cover_image', 'format', 'average_rating',
        'total_ratings', 'total_copies', 'available_copies', 'is_featured',
        'is_active', 'created_by', 'updated_by',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'average_rating' => 'decimal:2',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
    ];

    // Accessors
    public function getCoverImageAttribute($value): ?string
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

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logOnly(['title', 'isbn', 'is_active'])->logOnlyDirty();
    }

    // Relationships
    public function publisher() { return $this->belongsTo(Publisher::class); }
    public function categories() { return $this->belongsToMany(Category::class, 'book_category')->withTimestamps(); }
    public function authors() { return $this->belongsToMany(Author::class, 'author_book')->withPivot('order')->withTimestamps()->orderByPivot('order'); }
    public function copies() { return $this->hasMany(BookCopy::class); }
    public function availableCopies() { return $this->copies()->where('status', 'available'); }
    public function borrowings() { return $this->hasManyThrough(Borrowing::class, BookCopy::class, 'book_id', 'book_copy_id'); }
    public function reservations() { return $this->hasMany(Reservation::class); }
    public function tags() { return $this->morphToMany(Tag::class, 'taggable', 'taggables')->withPivot('tagged_by')->withTimestamps(); }
    public function comments() { return $this->morphMany(Comment::class, 'commentable'); }
    public function ratings() { return $this->morphMany(Rating::class, 'ratable'); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
    public function updater() { return $this->belongsTo(User::class, 'updated_by'); }

    // Scopes
    public function scopeActive($query) { return $query->where('is_active', true); }
    public function scopeFeatured($query) { return $query->where('is_featured', true); }
    public function scopeAvailable($query) { return $query->where('available_copies', '>', 0); }
    public function scopeSearch($query, $term) {
        return $query->where(function ($q) use ($term) {
            $q->where('title', 'like', "%{$term}%")->orWhere('description', 'like', "%{$term}%")
              ->orWhere('isbn', 'like', "%{$term}%")->orWhere('isbn13', 'like', "%{$term}%");
        });
    }
    public function scopeByAuthor($query, $authorId) { return $query->whereHas('authors', fn($q) => $q->where('authors.id', $authorId)); }
    public function scopeByCategory($query, $categoryId) { return $query->whereHas('categories', fn($q) => $q->where('categories.id', $categoryId)); }
    public function scopeByPublisher($query, $publisherId) { return $query->where('publisher_id', $publisherId); }

    // Helper Methods
    public function isAvailable(): bool { return $this->available_copies > 0; }
    public function updateAvailability(): void {
        $this->available_copies = $this->copies()->where('status', 'available')->count();
        $this->total_copies = $this->copies()->count();
        $this->save();
    }
    public function updateRating(): void {
        $this->update([
            'average_rating' => $this->ratings()->avg('rating') ?? 0,
            'total_ratings' => $this->ratings()->count(),
        ]);
    }
}
