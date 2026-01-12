<?php

namespace App\Policies;

use App\Models\Rating;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class RatingPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Rating $rating): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'librarian', 'member']);
    }

    public function update(User $user, Rating $rating): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'librarian']) || $user->id === $rating->user_id;
    }

    public function delete(User $user, Rating $rating): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'librarian']) || $user->id === $rating->user_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Rating $rating): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Rating $rating): bool
    {
        return false;
    }
}
