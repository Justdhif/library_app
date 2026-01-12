<?php

namespace App\Services;

use App\Models\Rating;
use App\Models\User;
use App\Models\Book;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;

class RatingService
{
    public function getAllRatings(array $filters = [])
    {
        $perPage = request()->get('per_page', 15);
        $search = request()->get('search');

        $query = Rating::query();

        // Apply search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('review', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($userQuery) use ($search) {
                      $userQuery->where('username', 'like', "%{$search}%");
                  });
            });
        }

        // Apply filters
        if (isset($filters['ratable_type']) && isset($filters['ratable_id'])) {
            $query->where('ratable_type', $filters['ratable_type'])
                  ->where('ratable_id', $filters['ratable_id']);
        }
        if (isset($filters['rating'])) {
            $query->where('rating', $filters['rating']);
        }
        if (request()->has('user_id')) {
            $query->where('user_id', request()->get('user_id'));
        }

        return $query->whereNotNull('review') // only with review
            ->with(['user.profile', 'ratable'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function createRating(int $userId, array $data): Rating
    {
        // Check if user already rated
        $existing = Rating::where('ratable_type', $data['ratable_type'])
            ->where('ratable_id', $data['ratable_id'])
            ->where('user_id', $userId)
            ->first();

        if ($existing) {
            throw new \Exception('You have already rated this item. Use update instead.');
        }

        // Check if verified purchase (if book)
        $isVerified = false;
        if ($data['ratable_type'] === 'App\Models\Book') {
            $user = \App\Models\User::find($userId);
            $isVerified = $user->borrowings()
                ->whereHas('bookCopy', fn($q) => $q->where('book_id', $data['ratable_id']))
                ->where('status', 'returned')
                ->exists();
        }

        $rating = Rating::create([
            'ratable_type' => $data['ratable_type'],
            'ratable_id' => $data['ratable_id'],
            'user_id' => $userId,
            'rating' => $data['rating'],
            'review' => $data['review'] ?? null,
            'is_verified_purchase' => $isVerified,
        ]);

        // Update book rating
        if ($data['ratable_type'] === 'App\Models\Book') {
            $book = \App\Models\Book::find($data['ratable_id']);
            $book->updateRating();
        }

        return $rating->load('user.profile');
    }

    public function updateRating(Rating $rating, array $data): Rating
    {
        $rating->update(array_filter([
            'rating' => $data['rating'] ?? null,
            'review' => $data['review'] ?? null,
        ]));

        // Update book rating
        if ($rating->ratable_type === 'App\Models\Book') {
            $rating->ratable->updateRating();
        }

        return $rating->fresh();
    }

    public function deleteRating(Rating $rating): bool
    {
        $ratableType = $rating->ratable_type;
        $ratable = $rating->ratable;

        $result = $rating->delete();

        // Update book rating
        if ($ratableType === 'App\Models\Book') {
            $ratable->updateRating();
        }

        return $result;
    }

    public function markAsHelpful(Rating $rating): Rating
    {
        $rating->markAsHelpful();
        return $rating->fresh();
    }

    public function getVerifiedRatings()
    {
        return Rating::verified()
            ->withReview()
            ->with(['user.profile', 'ratable'])
            ->latest()
            ->paginate(15);
    }

    public function getBookRatings(int $bookId)
    {
        return Rating::with('user')
            ->where('ratable_type', 'App\Models\Book')
            ->where('ratable_id', $bookId)
            ->orderBy('helpful_count', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(request()->get('per_page', 15));
    }

    public function updateBookAverageRating(int $bookId): void
    {
        $book = \App\Models\Book::find($bookId);
        if ($book) {
            $book->updateRating();
        }
    }
}
