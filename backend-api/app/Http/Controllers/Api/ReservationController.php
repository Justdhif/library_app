<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Book;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Services\ReservationService;
use App\Http\Requests\Reservation\StoreReservationRequest;

class ReservationController extends Controller
{
    use AuthorizesRequests, ApiResponse;

    protected $reservationService;

    public function __construct(ReservationService $reservationService)
    {
        $this->reservationService = $reservationService;
    }

    public function index()
    {
        $this->authorize('viewAny', Reservation::class);

        $reservations = $this->reservationService->getAllReservations();
        return $this->successResponse($reservations);
    }

    public function stats()
    {
        $this->authorize('viewAny', Reservation::class);

        $stats = $this->reservationService->getStats();
        return $this->successResponse($stats);
    }

    public function store(StoreReservationRequest $request)
    {
        $this->authorize('create', Reservation::class);

        try {
            $reservation = $this->reservationService->createReservation($request->user(), $request->validated());
            return $this->createdResponse($reservation, 'Reservation created successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function show(Reservation $reservation)
    {
        $this->authorize('view', $reservation);

        $reservation->load(['user.profile', 'book.publisher', 'book.authors', 'bookCopy']);
        return $this->successResponse($reservation);
    }

    public function markAsReady(Request $request, Reservation $reservation)
    {
        $this->authorize('update', $reservation);

        $request->validate([
            'book_copy_id' => 'required|exists:book_copies,id',
        ]);

        try {
            $reservation = $this->reservationService->markAsReady($reservation, $request->book_copy_id);
            return $this->successResponse($reservation, 'Reservation marked as ready');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function fulfill(Reservation $reservation)
    {
        $this->authorize('update', $reservation);

        try {
            $reservation = $this->reservationService->fulfillReservation($reservation);
            return $this->successResponse($reservation, 'Reservation fulfilled successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function approve(Reservation $reservation)
    {
        $this->authorize('update', $reservation);

        try {
            $reservation = $this->reservationService->approveReservation($reservation);
            return $this->successResponse($reservation, 'Reservation approved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function reject(Reservation $reservation)
    {
        $this->authorize('update', $reservation);

        try {
            $reservation = $this->reservationService->rejectReservation($reservation);
            return $this->successResponse($reservation, 'Reservation rejected');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function cancel(Reservation $reservation)
    {
        $this->authorize('cancel', $reservation);

        try {
            $this->reservationService->cancelReservation($reservation);
            return $this->successResponse($reservation, 'Reservation cancelled successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function myReservations(Request $request)
    {
        $reservations = $this->reservationService->getUserReservations($request->user());
        return $this->successResponse($reservations);
    }

    public function queue(Book $book)
    {
        $queue = $this->reservationService->getBookQueue($book);
        return $this->successResponse($queue);
    }
}
