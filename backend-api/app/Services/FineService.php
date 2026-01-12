<?php

namespace App\Services;

use App\Models\Fine;
use App\Models\User;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;

class FineService
{
    public function getAllFines()
    {
        $perPage = request()->get('per_page', 15);
        $search = request()->get('search');

        $query = Fine::query();

        // Apply search
        if ($search) {
            $query->whereHas('user', function ($userQuery) use ($search) {
                $userQuery->where('username', 'like', "%{$search}%")
                          ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Apply filters
        if (request()->has('user_id')) {
            $query->where('user_id', request()->get('user_id'));
        }
        if (request()->has('status')) {
            $query->where('status', request()->get('status'));
        }
        if (request()->has('type')) {
            $query->where('type', request()->get('type'));
        }

        return $query->with(['user.profile', 'borrowing.bookCopy.book', 'waivedBy'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function payFine(Fine $fine, array $data): Fine
    {
        $fine->recordPayment(
            $data['amount'],
            $data['payment_method'],
            $data['payment_reference'] ?? null
        );

        return $fine->fresh();
    }

    public function waiveFine(Fine $fine, User $waivedBy, string $reason): Fine
    {
        if ($fine->isPaid()) {
            throw new \Exception('Cannot waive a paid fine');
        }

        $fine->waive($waivedBy, $reason);

        return $fine->fresh(['waivedBy']);
    }

    public function getUserFines(User $user)
    {
        return $user->fines()
            ->with(['borrowing.bookCopy.book'])
            ->latest()
            ->paginate(15);
    }

    public function getUnpaidFines()
    {
        return Fine::unpaid()
            ->with(['user.profile', 'borrowing.bookCopy.book'])
            ->latest()
            ->paginate(15);
    }

    public function getUserFineSummary(): array
    {
        return [
            'total_unpaid' => Fine::unpaid()->sum('remaining_amount'),
            'total_overdue' => Fine::overdue()->sum('remaining_amount'),
            'count_unpaid' => Fine::unpaid()->count(),
            'count_overdue' => Fine::overdue()->count(),
        ];
    }
}
