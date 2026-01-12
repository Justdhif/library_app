<?php

namespace App\Policies;

use App\Models\Borrowing;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class BorrowingPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'librarian']);
    }

    public function view(User $user, Borrowing $borrowing): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'librarian']) || $user->id === $borrowing->user_id;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'librarian', 'member']);
    }

    public function update(User $user, Borrowing $borrowing): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'librarian']);
    }

    public function delete(User $user, Borrowing $borrowing): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }

    public function approve(User $user, Borrowing $borrowing): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'librarian']);
    }

    public function return(User $user, Borrowing $borrowing): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'librarian']);
    }

    public function renew(User $user, Borrowing $borrowing): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'librarian']) || $user->id === $borrowing->user_id;
    }

    public function cancel(User $user, Borrowing $borrowing): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'librarian']) || $user->id === $borrowing->user_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Borrowing $borrowing): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Borrowing $borrowing): bool
    {
        return false;
    }
}
