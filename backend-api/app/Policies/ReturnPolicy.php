<?php

namespace App\Policies;

use App\Models\BookReturn;
use App\Models\User;

class ReturnPolicy
{
    /**
     * Determine if user can view any returns
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'librarian']);
    }

    /**
     * Determine if user can view the return
     */
    public function view(User $user, BookReturn $return): bool
    {
        return $user->hasAnyRole(['super-admin', 'librarian']) ||
               $user->id === $return->returned_by;
    }

    /**
     * Determine if user can create returns
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'librarian']);
    }

    /**
     * Determine if user can pay fine
     */
    public function payFine(User $user, BookReturn $return): bool
    {
        return $user->hasAnyRole(['super-admin', 'librarian']) ||
               $user->id === $return->returned_by;
    }

    /**
     * Determine if user can waive fine
     */
    public function waiveFine(User $user, BookReturn $return): bool
    {
        return $user->hasRole('super-admin');
    }

    /**
     * Determine if user can approve return
     */
    public function approve(User $user, BookReturn $return): bool
    {
        return $user->hasAnyRole(['super-admin', 'librarian']);
    }

    /**
     * Determine if user can reject return
     */
    public function reject(User $user, BookReturn $return): bool
    {
        return $user->hasAnyRole(['super-admin', 'librarian']);
    }
}
