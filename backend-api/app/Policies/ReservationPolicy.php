<?php

namespace App\Policies;

use App\Models\Reservation;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ReservationPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'librarian']);
    }

    public function view(User $user, Reservation $reservation): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'librarian']) || $user->id === $reservation->user_id;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'librarian', 'member']);
    }

    public function update(User $user, Reservation $reservation): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'librarian']);
    }

    public function delete(User $user, Reservation $reservation): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }

    public function cancel(User $user, Reservation $reservation): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'librarian']) || $user->id === $reservation->user_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Reservation $reservation): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Reservation $reservation): bool
    {
        return false;
    }
}
