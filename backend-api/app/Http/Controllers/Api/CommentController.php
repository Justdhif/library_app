<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Services\CommentService;
use App\Http\Requests\Comment\StoreCommentRequest;
use App\Http\Requests\Comment\UpdateCommentRequest;

class CommentController extends Controller
{
    use AuthorizesRequests, ApiResponse;

    protected $commentService;

    public function __construct(CommentService $commentService)
    {
        $this->commentService = $commentService;
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', Comment::class);

        $comments = $this->commentService->getAllComments($request->all());
        return $this->successResponse($comments);
    }

    public function store(StoreCommentRequest $request)
    {
        $this->authorize('create', Comment::class);

        try {
            $comment = $this->commentService->createComment(auth()->id(), $request->validated());
            return $this->createdResponse($comment, 'Comment submitted successfully. Awaiting approval.');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function show(Comment $comment)
    {
        $this->authorize('view', $comment);

        $comment->load([
            'user.profile',
            'commentable',
            'parent',
            'replies.user.profile',
        ]);

        return $this->successResponse($comment);
    }

    public function update(UpdateCommentRequest $request, Comment $comment)
    {
        $this->authorize('update', $comment);

        try {
            $comment = $this->commentService->updateComment($comment, $request->validated());
            return $this->successResponse($comment, 'Comment updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function destroy(Comment $comment)
    {
        $this->authorize('delete', $comment);

        try {
            $this->commentService->deleteComment($comment);
            return $this->noContentResponse('Comment deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function approve(Comment $comment)
    {
        $this->authorize('approve', $comment);

        try {
            $comment = $this->commentService->approveComment($comment);
            return $this->successResponse($comment, 'Comment approved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function flag(Comment $comment)
    {
        $this->authorize('flag', $comment);

        $comment->flag();
        return $this->successResponse($comment, 'Comment flagged successfully');
    }

    public function like(Comment $comment)
    {
        $comment->like();
        return $this->successResponse($comment->fresh(), 'Comment liked successfully');
    }

    public function pending()
    {
        $this->authorize('viewAny', Comment::class);

        $comments = $this->commentService->getPendingComments();
        return $this->successResponse($comments);
    }

    public function flagged()
    {
        $this->authorize('viewAny', Comment::class);

        $comments = $this->commentService->getFlaggedComments();
        return $this->successResponse($comments);
    }
}
