<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Comment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'commentable_type',
        'commentable_id',
        'user_id',
        'parent_id',
        'content',
        'is_approved',
        'is_flagged',
        'likes_count',
    ];

    protected $casts = [
        'is_approved' => 'boolean',
        'is_flagged' => 'boolean',
        'likes_count' => 'integer',
    ];

    // Polymorphic Relationship
    public function commentable()
    {
        return $this->morphTo();
    }

    // Regular Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function parent()
    {
        return $this->belongsTo(Comment::class, 'parent_id');
    }

    public function replies()
    {
        return $this->hasMany(Comment::class, 'parent_id')->orderBy('created_at');
    }

    // Scopes
    public function scopeApproved($query)
    {
        return $query->where('is_approved', true);
    }

    public function scopeRoot($query)
    {
        return $query->whereNull('parent_id');
    }

    public function scopeFlagged($query)
    {
        return $query->where('is_flagged', true);
    }

    // Helper Methods
    public function isRoot(): bool
    {
        return is_null($this->parent_id);
    }

    public function hasReplies(): bool
    {
        return $this->replies()->exists();
    }

    public function approve(): void
    {
        $this->update(['is_approved' => true]);
    }

    public function flag(): void
    {
        $this->update(['is_flagged' => true]);
    }

    public function like(): void
    {
        $this->increment('likes_count');
    }
}
