<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Borrowing;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Services\BorrowingService;
use App\Http\Requests\Borrowing\StoreBorrowingRequest;
use App\Http\Requests\Borrowing\ReturnBorrowingRequest;

class BorrowingController extends Controller
{
    use AuthorizesRequests, ApiResponse;

    protected $borrowingService;

    public function __construct(BorrowingService $borrowingService)
    {
        $this->borrowingService = $borrowingService;
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', Borrowing::class);

        $borrowings = $this->borrowingService->getAllBorrowings();
        return $this->successResponse($borrowings);
    }

    public function stats()
    {
        $this->authorize('viewAny', Borrowing::class);

        $stats = $this->borrowingService->getStats();
        return $this->successResponse($stats);
    }

    public function store(StoreBorrowingRequest $request)
    {
        $this->authorize('create', Borrowing::class);

        try {
            $borrowing = $this->borrowingService->createBorrowing($request->validated());
            return $this->createdResponse($borrowing, 'Borrowing request created successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function show(Borrowing $borrowing)
    {
        $this->authorize('view', $borrowing);
        $borrowing->load([
            'user.profile',
            'bookCopy.book.authors',
            'items.bookCopy.book.authors',
            'approvedBy'
        ]);
        return $this->successResponse($borrowing);
    }

    public function approve(Borrowing $borrowing)
    {
        $this->authorize('approve', $borrowing);

        try {
            $borrowing = $this->borrowingService->approveBorrowing($borrowing, auth()->user());
            return $this->successResponse($borrowing, 'Borrowing approved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function renew(Borrowing $borrowing)
    {
        $this->authorize('renew', $borrowing);

        try {
            $borrowing = $this->borrowingService->renewBorrowing($borrowing);
            return $this->successResponse($borrowing, 'Borrowing renewed successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function cancel(Borrowing $borrowing)
    {
        $this->authorize('cancel', $borrowing);

        try {
            $borrowing = $this->borrowingService->cancelBorrowing($borrowing);
            return $this->successResponse($borrowing, 'Borrowing cancelled successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function overdue()
    {
        $this->authorize('viewAny', Borrowing::class);

        $borrowings = $this->borrowingService->getOverdueBorrowings();
        return $this->successResponse($borrowings);
    }

    public function myBorrowings(Request $request)
    {
        $borrowings = $this->borrowingService->getUserHistory($request->user());
        return $this->successResponse($borrowings);
    }
}
