<?php

namespace App\Services;

use App\Models\Reservation;
use App\Models\Book;
use App\Models\User;
use Carbon\Carbon;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;

class ReservationService
{
    public function getStats()
    {
        return [
            'total_reservations' => Reservation::count(),
            'pending_reservations' => Reservation::where('status', 'pending')->count(),
            'approved_reservations' => Reservation::where('status', 'approved')->count(),
            'expired_reservations' => Reservation::where('status', 'expired')->count(),
        ];
    }

    public function getAllReservations()
    {
        $perPage = request()->get('per_page', 15);
        $search = request()->get('search');

        $query = Reservation::query();

        // Apply search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($userQuery) use ($search) {
                    $userQuery->where('username', 'like', "%{$search}%")
                              ->orWhere('email', 'like', "%{$search}%");
                })
                ->orWhereHas('book', function ($bookQuery) use ($search) {
                    $bookQuery->where('title', 'like', "%{$search}%");
                });
            });
        }

        // Apply filters
        if (request()->has('user_id')) {
            $query->where('user_id', request()->get('user_id'));
        }
        if (request()->has('book_id')) {
            $query->where('book_id', request()->get('book_id'));
        }
        if (request()->has('status')) {
            $query->where('status', request()->get('status'));
        }

        return $query->with(['user.profile', 'book', 'bookCopy'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function createReservation(User $user, array $data): Reservation
    {
        // Check if user already has active reservation for this book
        $existing = Reservation::where('user_id', $user->id)
            ->where('book_id', $data['book_id'])
            ->whereIn('status', ['pending', 'ready'])
            ->exists();

        if ($existing) {
            throw new \Exception('You already have an active reservation for this book');
        }

        // Get queue position
        $queuePosition = Reservation::where('book_id', $data['book_id'])
            ->where('status', 'pending')
            ->max('queue_position') + 1;

        return Reservation::create([
            'user_id' => $user->id,
            'book_id' => $data['book_id'],
            'reservation_date' => now(),
            'expiry_date' => now()->addDays(7),
            'status' => 'pending',
            'queue_position' => $queuePosition,
            'notes' => $data['notes'] ?? null,
        ])->load('user.profile', 'book');
    }

    public function markAsReady(Reservation $reservation, int $bookCopyId): Reservation
    {
        if ($reservation->status !== 'pending') {
            throw new \Exception('Only pending reservations can be marked as ready');
        }

        $bookCopy = \App\Models\BookCopy::find($bookCopyId);
        if (!$bookCopy->isAvailable()) {
            throw new \Exception('Book copy is not available');
        }

        $reservation->markAsReady($bookCopy);

        // Mark book copy as reserved
        $bookCopy->update(['status' => 'reserved']);

        return $reservation->load('user.profile', 'book', 'bookCopy');
    }

    public function fulfillReservation(Reservation $reservation): Reservation
    {
        if ($reservation->status !== 'ready') {
            throw new \Exception('Only ready reservations can be fulfilled');
        }

        $reservation->markAsFulfilled();

        return $reservation->load('user.profile', 'book', 'bookCopy');
    }

    public function approveReservation(Reservation $reservation): Reservation
    {
        if ($reservation->status !== 'pending') {
            throw new \Exception('Only pending reservations can be approved');
        }

        $reservation->update([
            'status' => 'approved',
        ]);

        return $reservation->load('user.profile', 'book', 'bookCopy');
    }

    public function rejectReservation(Reservation $reservation): Reservation
    {
        if ($reservation->status !== 'pending') {
            throw new \Exception('Only pending reservations can be rejected');
        }

        $reservation->update([
            'status' => 'rejected',
        ]);

        return $reservation->load('user.profile', 'book', 'bookCopy');
    }

    public function cancelReservation(Reservation $reservation): bool
    {
        if (!in_array($reservation->status, ['pending', 'ready'])) {
            throw new \Exception('Only pending or ready reservations can be cancelled');
        }

        // If ready, free up the book copy
        if ($reservation->status === 'ready' && $reservation->bookCopy) {
            $reservation->bookCopy->update(['status' => 'available']);
        }

        return $reservation->update(['status' => 'cancelled']);
    }

    public function getUserReservations(User $user)
    {
        return $user->reservations()
            ->with(['book.publisher', 'book.authors', 'bookCopy'])
            ->latest()
            ->paginate(15);
    }

    public function getBookQueue(\App\Models\Book $book)
    {
        $reservations = Reservation::where('book_id', $book->id)
            ->where('status', 'pending')
            ->with('user.profile')
            ->orderBy('queue_position')
            ->get();

        return [
            'book' => $book,
            'queue' => $reservations,
            'total_in_queue' => $reservations->count(),
        ];
    }
}
