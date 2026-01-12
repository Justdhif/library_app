<?php

namespace App\Services;

use App\Models\Borrowing;
use App\Models\BorrowingItem;
use App\Models\BookCopy;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;

class BorrowingService
{
    public function getAllBorrowings()
    {
        $perPage = request()->get('per_page', 15);
        $search = request()->get('search');

        $query = Borrowing::query();

        // Apply search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($userQuery) use ($search) {
                    $userQuery->where('username', 'like', "%{$search}%")
                              ->orWhere('email', 'like', "%{$search}%");
                })
                ->orWhereHas('bookCopy.book', function ($bookQuery) use ($search) {
                    $bookQuery->where('title', 'like', "%{$search}%");
                });
            });
        }

        // Apply filters
        if (request()->has('user_id')) {
            $query->where('user_id', request()->get('user_id'));
        }
        if (request()->has('status')) {
            $query->where('status', request()->get('status'));
        }

        return $query->with(['user.profile', 'bookCopy.book.authors', 'items.bookCopy.book.authors', 'approvedBy'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function getStats()
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->month;
        $thisYear = Carbon::now()->year;

        return [
            'total_borrowings' => Borrowing::count(),
            'active_borrowings' => Borrowing::whereIn('status', ['borrowed', 'approved'])->count(),
            'pending_borrowings' => Borrowing::where('status', 'pending')->count(),
            'overdue_borrowings' => Borrowing::where('status', 'overdue')->count(),
            'borrowings_today' => Borrowing::whereDate('created_at', $today)->count(),
            'borrowings_this_month' => Borrowing::whereMonth('created_at', $thisMonth)
                ->whereYear('created_at', $thisYear)
                ->count(),
            'returned_this_month' => Borrowing::where('status', 'returned')
                ->whereMonth('updated_at', $thisMonth)
                ->whereYear('updated_at', $thisYear)
                ->count(),
        ];
    }

    public function createBorrowing(array $data): Borrowing
    {
        $user = User::findOrFail($data['user_id']);
        $bookCopyIds = $data['book_copy_ids'] ?? [$data['book_copy_id']]; // Support old format too

        // Validate all book copies
        $bookCopies = BookCopy::whereIn('id', $bookCopyIds)->get();

        if ($bookCopies->count() !== count($bookCopyIds)) {
            throw new \Exception('One or more book copies not found');
        }

        // Check if all book copies are available
        foreach ($bookCopies as $bookCopy) {
            if ($bookCopy->status !== 'available') {
                throw new \Exception("Book copy '{$bookCopy->book->title}' is not available for borrowing");
            }
        }

        // Check borrowing limit (skip for guest users)
        if (!$user->hasRole('guest')) {
            $activeBorrowingsCount = $user->borrowings()
                ->whereIn('status', ['pending', 'approved', 'borrowed'])
                ->count();

            $totalAfterBorrow = $activeBorrowingsCount + count($bookCopyIds);

            if ($totalAfterBorrow > 5) {
                throw new \Exception('Borrowing limit exceeded. Maximum 5 books allowed');
            }

            // Check if user has overdue books or unpaid fines
            $hasOverdue = $user->borrowings()
                ->where('status', 'overdue')
                ->exists();

            $hasUnpaidFines = $user->fines()
                ->where('status', 'unpaid')
                ->exists();

            if ($hasOverdue || $hasUnpaidFines) {
                throw new \Exception('You have overdue books or unpaid fines');
            }
        }

        return DB::transaction(function () use ($user, $bookCopies, $data) {
            $borrowedDate = now();
            // Use custom due_date if provided, otherwise default to 14 days
            $dueDate = isset($data['due_date'])
                ? Carbon::parse($data['due_date'])
                : $borrowedDate->copy()->addDays(14); // 2 weeks

            // Check if this is a quick request (auto-approve)
            $isQuickRequest = $data['quick_request'] ?? false;
            $status = $isQuickRequest ? 'approved' : 'pending';

            // Create main borrowing record
            $borrowing = Borrowing::create([
                'user_id' => $user->id,
                'book_copy_id' => $bookCopies->first()->id, // Keep for backward compatibility
                'borrowed_date' => $borrowedDate,
                'due_date' => $dueDate,
                'status' => $status,
                'notes' => $data['notes'] ?? null,
                'approved_by' => $isQuickRequest ? auth()->id() : null,
            ]);

            // Create borrowing items for each book
            foreach ($bookCopies as $bookCopy) {
                BorrowingItem::create([
                    'borrowing_id' => $borrowing->id,
                    'book_copy_id' => $bookCopy->id,
                    'status' => 'borrowed',
                    'borrowed_date' => $borrowedDate,
                    'due_date' => $dueDate,
                ]);

                // Update book copy status to borrowed if approved, reserved if pending
                $bookCopy->update(['status' => $isQuickRequest ? 'borrowed' : 'reserved']);
            }

            return $borrowing->load(['items.bookCopy.book.authors', 'user.profile']);
        });
    }

    public function approveBorrowing(Borrowing $borrowing, User $approvedBy): Borrowing
    {
        if ($borrowing->status !== 'pending') {
            throw new \Exception('Only pending borrowings can be approved');
        }

        return DB::transaction(function () use ($borrowing, $approvedBy) {
            $borrowedAt = now();
            $dueDate = $borrowedAt->copy()->addDays(14); // 2 weeks

            $borrowing->update([
                'status' => 'approved',
                'approved_by' => $approvedBy->id,
                'approved_at' => now(),
                'borrowed_at' => $borrowedAt,
                'due_date' => $dueDate,
            ]);

            // Update all items to borrowed status
            foreach ($borrowing->items as $item) {
                $item->update([
                    'status' => 'borrowed',
                    'borrowed_date' => $borrowedAt,
                    'due_date' => $dueDate,
                ]);

                $item->bookCopy->update(['status' => 'borrowed']);
            }

            return $borrowing->load(['items.bookCopy.book.authors', 'user.profile', 'approvedBy']);
        });
    }

    public function returnBorrowing(Borrowing $borrowing, array $data): Borrowing
    {
        if (!in_array($borrowing->status, ['approved', 'borrowed', 'overdue'])) {
            throw new \Exception('Only borrowed books can be returned');
        }

        return DB::transaction(function () use ($borrowing, $data) {
            $returnDate = now();
            $itemsToReturn = isset($data['item_ids'])
                ? $borrowing->items()->whereIn('id', $data['item_ids'])->get()
                : $borrowing->items;

            foreach ($itemsToReturn as $item) {
                if ($item->status === 'returned') {
                    continue; // Skip already returned items
                }

                $isLate = $item->due_date && $returnDate->gt($item->due_date);

                $item->update([
                    'status' => 'returned',
                    'returned_date' => $returnDate,
                    'return_condition' => $data['condition'],
                    'return_notes' => $data['notes'] ?? null,
                ]);

                // Update book copy status based on condition
                $newStatus = match ($data['condition']) {
                    'lost' => 'lost',
                    'damaged' => 'maintenance',
                    default => 'available'
                };

                $item->bookCopy->update([
                    'status' => $newStatus,
                    'condition' => $data['condition'],
                ]);

                // Create fine if returned late
                if ($isLate && $item->due_date) {
                    $daysLate = $returnDate->diffInDays($item->due_date);
                    $fineAmount = $daysLate * 1000; // Rp 1.000 per day

                    $item->update(['fine_amount' => $fineAmount]);

                    $borrowing->fines()->create([
                        'user_id' => $borrowing->user_id,
                        'amount' => $fineAmount,
                        'reason' => "Late return: {$daysLate} days - " . $item->bookCopy->book->title,
                        'status' => 'unpaid',
                    ]);
                }

                // Create fine for damaged or lost books
                if (in_array($data['condition'], ['damaged', 'lost'])) {
                    $fineAmount = match ($data['condition']) {
                        'lost' => $item->bookCopy->book->price ?? 100000,
                        'damaged' => ($item->bookCopy->book->price ?? 100000) * 0.5,
                    };

                    $borrowing->fines()->create([
                        'user_id' => $borrowing->user_id,
                        'amount' => $fineAmount,
                        'reason' => ucfirst($data['condition']) . ' book - ' . $item->bookCopy->book->title,
                        'status' => 'unpaid',
                    ]);
                }
            }

            // Check if all items are returned
            $allReturned = $borrowing->items()->where('status', '!=', 'returned')->count() === 0;
            if ($allReturned) {
                $borrowing->update([
                    'status' => 'returned',
                    'returned_at' => $returnDate,
                ]);
            }

            return $borrowing->load(['items.bookCopy.book.authors', 'user.profile', 'fines']);
        });
    }

    public function renewBorrowing(Borrowing $borrowing): Borrowing
    {
        if (!in_array($borrowing->status, ['approved', 'borrowed'])) {
            throw new \Exception('Only borrowed books can be renewed');
        }

        if ($borrowing->renewed_count >= 2) {
            throw new \Exception('Maximum renewal limit reached');
        }

        return DB::transaction(function () use ($borrowing) {
            $newDueDate = $borrowing->due_date->copy()->addDays(14);

            $borrowing->update([
                'due_date' => $newDueDate,
                'renewed_count' => $borrowing->renewed_count + 1,
            ]);

            // Update all active items due dates
            foreach ($borrowing->items()->where('status', '!=', 'returned')->get() as $item) {
                $item->update(['due_date' => $newDueDate]);
            }

            return $borrowing->fresh(['items.bookCopy.book.authors', 'user.profile']);
        });
    }

    public function cancelBorrowing(Borrowing $borrowing): Borrowing
    {
        if ($borrowing->status !== 'pending') {
            throw new \Exception('Only pending borrowings can be cancelled');
        }

        return DB::transaction(function () use ($borrowing) {
            $borrowing->update(['status' => 'cancelled']);

            // Update all items to cancelled and release book copies
            foreach ($borrowing->items as $item) {
                $item->update(['status' => 'cancelled']);
                $item->bookCopy->update(['status' => 'available']);
            }

            return $borrowing->fresh(['items.bookCopy.book.authors', 'user.profile']);
        });
    }

    public function getUserHistory(User $user)
    {
        return Borrowing::with(['items.bookCopy.book.authors', 'fines'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(request()->get('per_page', 15));
    }

    public function getOverdueBorrowings()
    {
        return Borrowing::with(['user.profile', 'items.bookCopy.book.authors'])
            ->where('status', 'borrowed')
            ->where('due_date', '<', now())
            ->get()
            ->each(function ($borrowing) {
                $borrowing->update(['status' => 'overdue']);

                // Also mark individual items as overdue
                $borrowing->items()
                    ->where('status', 'borrowed')
                    ->where('due_date', '<', now())
                    ->update(['status' => 'overdue']);
            });
    }
}
