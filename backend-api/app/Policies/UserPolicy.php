<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\Response;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'librarian']);
    }

    public function view(User $user, User $model): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'librarian']) || $user->id === $model->id;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }

    public function update(User $user, User $model): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']) || $user->id === $model->id;
    }

    public function delete(User $user, User $model): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']) && $user->id !== $model->id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, User $model): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, User $model): bool
    {
        return false;
    }
}
