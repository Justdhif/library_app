<?php

namespace App\Services;

use App\Models\BookReturn;
use App\Models\Borrowing;
use App\Models\User;
use App\Models\BookCopy;
use App\Models\FineType;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReturnService
{
    /**
     * Get all returns with filters
     */
    public function getAllReturns(array $filters = [])
    {
        $query = BookReturn::with([
            'borrowing.user.profile',
            'borrowing.items.bookCopy.book',
            'processedBy.profile',
            'returnedBy.profile',
            'approvedBy.profile',
        ]);

        // Filter by approval status
        if (isset($filters['approval_status'])) {
            $query->where('approval_status', $filters['approval_status']);
        }

        // Search
        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->whereHas('borrowing.user', function ($q2) use ($search) {
                    $q2->where('email', 'like', "%{$search}%")
                       ->orWhereHas('profile', function ($q3) use ($search) {
                           $q3->where('full_name', 'like', "%{$search}%");
                       });
                })
                ->orWhereHas('borrowing.items.bookCopy.book', function ($q2) use ($search) {
                    $q2->where('title', 'like', "%{$search}%")
                       ->orWhere('isbn', 'like', "%{$search}%");
                });
            });
        }

        // Filter by date range
        if (isset($filters['from_date'])) {
            $query->whereDate('returned_date', '>=', $filters['from_date']);
        }
        if (isset($filters['to_date'])) {
            $query->whereDate('returned_date', '<=', $filters['to_date']);
        }

        // Filter by condition
        if (isset($filters['condition'])) {
            $query->where('return_condition', $filters['condition']);
        }

        // Filter by fine status
        if (isset($filters['fine_status'])) {
            switch ($filters['fine_status']) {
                case 'with_fine':
                    $query->withFines();
                    break;
                case 'paid':
                    $query->paidFines();
                    break;
                case 'unpaid':
                    $query->unpaidFines();
                    break;
            }
        }

        // Sorting
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $order = $filters['order'] ?? 'desc';
        $query->orderBy($sortBy, $order);

        return $query->paginate($filters['per_page'] ?? 15);
    }

    /**
     * Get return statistics
     */
    public function getStats()
    {
        $today = Carbon::today();

        return [
            'returned_today' => BookReturn::today()->count(),
            'pending_returns' => Borrowing::whereIn('status', ['active', 'overdue'])->count(),
            'total_fines_collected' => BookReturn::paidFines()->sum('fine_amount'),
            'average_return_time' => $this->calculateAverageReturnTime(),
            'unpaid_fines' => BookReturn::unpaidFines()->sum('fine_amount'),
            'returns_this_month' => BookReturn::whereMonth('returned_date', $today->month)
                ->whereYear('returned_date', $today->year)
                ->count(),
        ];
    }

    /**
     * Process a book return
     */
    public function processReturn(Borrowing $borrowing, User $processor, array $data)
    {
        if ($borrowing->status === 'returned') {
            throw new \Exception('This borrowing has already been returned');
        }

        return DB::transaction(function () use ($borrowing, $processor, $data) {
            $condition = $data['condition'] ?? 'good';
            $fineAmount = 0;
            $approvalStatus = 'approved'; // Default approved for good/new condition

            // Determine approval status and fine based on book condition
            if (in_array($condition, ['new', 'good'])) {
                // No fine, auto approved
                $approvalStatus = 'approved';
                $fineAmount = 0;
            } elseif (in_array($condition, ['fair', 'poor', 'damaged'])) {
                // Get fine from master data
                $fineType = FineType::getByCondition($condition);

                if ($fineType) {
                    $fineAmount = $fineType->amount;
                } else {
                    // Fallback jika tidak ada di master
                    $fineAmount = match($condition) {
                        'fair' => 25000,
                        'poor' => 50000,
                        'damaged' => 100000,
                        default => 0,
                    };
                }

                // Status rejected, need approval
                $approvalStatus = 'rejected';
            }

            // Add overdue fine if applicable
            $overdueFine = $this->calculateOverdueFine($borrowing);
            $fineAmount += $overdueFine;

            // Create return record
            $return = BookReturn::create([
                'borrowing_id' => $borrowing->id,
                'returned_by' => $borrowing->user_id,
                'processed_by' => $processor->id,
                'returned_date' => now(),
                'return_condition' => $condition,
                'notes' => $data['return_notes'] ?? null,
                'damage_description' => $data['return_notes'] ?? null,
                'fine_amount' => $fineAmount,
                'fine_paid' => false,
                'fine_waived' => false,
                'approval_status' => $approvalStatus,
            ]);

            // If auto-approved (good/new condition), update borrowing and book copy status
            if ($approvalStatus === 'approved') {
                $borrowing->update([
                    'status' => 'returned',
                    'returned_date' => now(),
                    'return_condition' => $condition,
                    'return_notes' => $data['return_notes'] ?? null,
                ]);

                // Update book copy status to available
                if ($borrowing->bookCopy) {
                    $borrowing->bookCopy->update([
                        'status' => 'available',
                        'condition' => $condition,
                    ]);
                }
            }

            $return->load([
                'borrowing.user.profile',
                'borrowing.bookCopy.book',
                'processedBy.profile',
            ]);

            return $return;
        });
    }

    /**
     * Search borrowing for return
     */
    public function searchBorrowing(string $query)
    {
        $borrowing = Borrowing::with([
            'user.profile',
            'bookCopy.book',
        ])
        ->where(function ($q) use ($query) {
            // Search by borrowing ID
            $q->where('id', $query)
                // Search by user email
                ->orWhereHas('user', function ($q2) use ($query) {
                    $q2->where('email', 'like', "%{$query}%");
                })
                // Search by book ISBN
                ->orWhereHas('bookCopy.book', function ($q2) use ($query) {
                    $q2->where('isbn', 'like', "%{$query}%");
                });
        })
        ->whereIn('status', ['active', 'overdue'])
        ->get();

        if ($borrowing->isEmpty()) {
            throw new \Exception('No active borrowing found');
        }

        return $borrowing;
    }

    /**
     * Pay fine
     */
    public function payFine(BookReturn $return, array $data)
    {
        if ($return->fine_paid || $return->fine_waived) {
            throw new \Exception('Fine has already been paid or waived');
        }

        $return->update([
            'fine_paid' => true,
            'fine_payment_date' => now(),
            'fine_payment_method' => $data['payment_method'] ?? 'cash',
        ]);

        return $return;
    }

    /**
     * Waive fine
     */
    public function waiveFine(BookReturn $return, User $waiver)
    {
        if ($return->fine_paid) {
            throw new \Exception('Fine has already been paid');
        }

        $return->update([
            'fine_waived' => true,
            'notes' => ($return->notes ? $return->notes . ' | ' : '') .
                      "Fine waived by {$waiver->username} on " . now()->format('Y-m-d H:i:s'),
        ]);

        return $return;
    }

    /**
     * Calculate overdue fine amount
     */
    protected function calculateOverdueFine(Borrowing $borrowing): float
    {
        $dueDate = Carbon::parse($borrowing->due_date);
        $returnDate = now();

        // No fine if returned on time
        if ($returnDate->lte($dueDate)) {
            return 0;
        }

        // Calculate overdue days
        $overdueDays = $dueDate->diffInDays($returnDate);

        // Fine rate: Rp 5,000 per day
        $finePerDay = 5000;

        return $overdueDays * $finePerDay;
    }

    /**
     * Calculate fine amount (keeping for backward compatibility)
     */
    protected function calculateFine(Borrowing $borrowing): float
    {
        return $this->calculateOverdueFine($borrowing);
    }

    /**
     * Calculate average return time
     */
    protected function calculateAverageReturnTime(): int
    {
        $returns = BookReturn::with('borrowing')
            ->whereHas('borrowing')
            ->get();

        if ($returns->isEmpty()) {
            return 0;
        }

        $totalDays = $returns->sum(function ($return) {
            $borrowDate = Carbon::parse($return->borrowing->borrowed_date);
            $returnDate = Carbon::parse($return->returned_date);
            return $borrowDate->diffInDays($returnDate);
        });

        return round($totalDays / $returns->count());
    }

    /**
     * Export returns data
     */
    public function exportReturns(array $filters = [])
    {
        $returns = $this->getAllReturns($filters)->items();

        $filename = 'returns-' . now()->format('Y-m-d-His') . '.csv';
        $filepath = storage_path('app/' . $filename);

        $handle = fopen($filepath, 'w');

        // Header
        fputcsv($handle, [
            'ID',
            'Member Name',
            'Member Email',
            'Book Title',
            'ISBN',
            'Borrowed Date',
            'Due Date',
            'Returned Date',
            'Days Late',
            'Condition',
            'Fine Amount',
            'Fine Status',
            'Processed By',
        ]);

        // Data
        foreach ($returns as $return) {
            fputcsv($handle, [
                $return->id,
                $return->borrowing->user->profile->full_name ?? $return->borrowing->user->username,
                $return->borrowing->user->email,
                $return->borrowing->bookCopy->book->title,
                $return->borrowing->bookCopy->book->isbn,
                $return->borrowing->borrowed_date->format('Y-m-d'),
                $return->borrowing->due_date->format('Y-m-d'),
                $return->returned_date->format('Y-m-d'),
                $return->calculateLateDays(),
                $return->return_condition,
                $return->fine_amount,
                $return->isFinePaid() ? 'Paid/Waived' : 'Unpaid',
                $return->processedBy->username ?? '-',
            ]);
        }

        fclose($handle);

        return $filepath;
    }

    /**
     * Approve a return
     */
    public function approveReturn(BookReturn $return, User $approver, ?string $notes = null)
    {
        if ($return->approval_status !== 'pending') {
            throw new \Exception('This return has already been processed');
        }

        return DB::transaction(function () use ($return, $approver, $notes) {
            $return->update([
                'approval_status' => 'approved',
                'approved_by' => $approver->id,
                'approved_at' => now(),
                'approval_notes' => $notes,
            ]);

            // Update borrowing status to returned
            $return->borrowing->update([
                'status' => 'returned',
            ]);

            // Update all borrowing items to returned
            foreach ($return->borrowing->items as $item) {
                $item->update(['status' => 'returned']);

                // Update book copy status to available
                $item->bookCopy->update(['status' => 'available']);
            }

            $return->load([
                'borrowing.user.profile',
                'borrowing.items.bookCopy.book',
                'approvedBy.profile',
            ]);

            return $return;
        });
    }

    /**
     * Reject a return
     */
    public function rejectReturn(BookReturn $return, User $rejector, ?string $notes = null)
    {
        if ($return->approval_status !== 'pending') {
            throw new \Exception('This return has already been processed');
        }

        $return->update([
            'approval_status' => 'rejected',
            'approved_by' => $rejector->id,
            'approved_at' => now(),
            'approval_notes' => $notes,
        ]);

        $return->load([
            'borrowing.user.profile',
            'borrowing.items.bookCopy.book',
            'approvedBy.profile',
        ]);

        return $return;
    }
}
