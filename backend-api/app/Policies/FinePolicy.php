<?php

namespace App\Policies;

use App\Models\Fine;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class FinePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'librarian']);
    }

    public function view(User $user, Fine $fine): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'librarian']) || $user->id === $fine->user_id;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'librarian']);
    }

    public function update(User $user, Fine $fine): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'librarian']);
    }

    public function delete(User $user, Fine $fine): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }

    public function pay(User $user, Fine $fine): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'librarian']) || $user->id === $fine->user_id;
    }

    public function waive(User $user, Fine $fine): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'librarian']);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Fine $fine): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Fine $fine): bool
    {
        return false;
    }
}
