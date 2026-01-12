<?php

namespace App\Services;

use App\Models\Comment;
use App\Models\User;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;

class CommentService
{
    public function getAllComments(array $filters = [])
    {
        $perPage = request()->get('per_page', 15);
        $search = request()->get('search');

        $query = Comment::query();

        // Apply search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('content', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($userQuery) use ($search) {
                      $userQuery->where('username', 'like', "%{$search}%");
                  });
            });
        }

        // Apply filters
        if (isset($filters['commentable_type']) && isset($filters['commentable_id'])) {
            $query->where('commentable_type', $filters['commentable_type'])
                  ->where('commentable_id', $filters['commentable_id']);
        }
        if (request()->has('user_id')) {
            $query->where('user_id', request()->get('user_id'));
        }
        if (request()->has('is_approved')) {
            $query->where('is_approved', request()->get('is_approved'));
        }

        return $query->where('parent_id', null) // root comments only
            ->with(['user.profile', 'replies.user.profile'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function createComment(int $userId, array $data): Comment
    {
        return Comment::create([
            'user_id' => $userId,
            'commentable_type' => $data['commentable_type'],
            'commentable_id' => $data['commentable_id'],
            'content' => $data['content'],
            'parent_id' => $data['parent_id'] ?? null,
            'is_approved' => false, // Requires approval
        ])->load('user.profile');
    }

    public function updateComment(Comment $comment, array $data): Comment
    {
        $comment->update([
            'content' => $data['content'],
            'is_approved' => false, // Re-approval needed
        ]);

        return $comment->fresh();
    }

    public function deleteComment(Comment $comment): bool
    {
        // Delete replies first
        $comment->replies()->delete();

        return $comment->delete();
    }

    public function approveComment(Comment $comment): Comment
    {
        $comment->approve();
        return $comment->fresh();
    }

    public function getPendingComments()
    {
        return Comment::where('is_approved', false)
            ->where('is_flagged', false)
            ->with(['user.profile', 'commentable'])
            ->latest()
            ->paginate(15);
    }

    public function getFlaggedComments()
    {
        return Comment::flagged()
            ->with(['user.profile', 'commentable'])
            ->latest()
            ->paginate(15);
    }

    public function getCommentsByEntity(string $type, int $id)
    {
        return Comment::with(['user', 'replies.user'])
            ->where('commentable_type', $type)
            ->where('commentable_id', $id)
            ->whereNull('parent_id')
            ->where('is_approved', true)
            ->orderBy('created_at', 'desc')
            ->paginate(request()->get('per_page', 15));
    }
}
