<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BookReturn;
use App\Models\Borrowing;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Services\ReturnService;
use App\Http\Requests\Return\ProcessReturnRequest;
use App\Http\Requests\Return\PayFineRequest;

class ReturnController extends Controller
{
    use AuthorizesRequests, ApiResponse;

    protected $returnService;

    public function __construct(ReturnService $returnService)
    {
        $this->returnService = $returnService;
    }

    /**
     * Get all returns with filters
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', BookReturn::class);

        $returns = $this->returnService->getAllReturns($request->all());
        return $this->successResponse($returns);
    }

    /**
     * Get return statistics
     */
    public function stats()
    {
        $this->authorize('viewAny', BookReturn::class);

        $stats = $this->returnService->getStats();
        return $this->successResponse($stats);
    }

    /**
     * Process a book return
     */
    public function store(ProcessReturnRequest $request)
    {
        $this->authorize('create', BookReturn::class);

        try {
            $borrowing = Borrowing::findOrFail($request->borrowing_id);

            $return = $this->returnService->processReturn(
                $borrowing,
                auth()->user(),
                $request->validated()
            );

            return $this->createdResponse($return, 'Book returned successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    /**
     * Show return details
     */
    public function show(BookReturn $return)
    {
        $this->authorize('view', $return);

        $return->load([
            'borrowing.user.profile',
            'borrowing.bookCopy.book',
            'returnedBy.profile',
            'processedBy.profile',
        ]);

        return $this->successResponse($return);
    }

    /**
     * Search borrowing for return
     */
    public function search(Request $request)
    {
        $this->authorize('viewAny', BookReturn::class);

        try {
            $result = $this->returnService->searchBorrowing($request->input('query'));
            return $this->successResponse($result);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 404);
        }
    }

    /**
     * Pay fine
     */
    public function payFine(PayFineRequest $request, BookReturn $return)
    {
        $this->authorize('payFine', $return);

        try {
            $return = $this->returnService->payFine($return, $request->validated());
            return $this->successResponse($return, 'Fine paid successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    /**
     * Waive fine
     */
    public function waiveFine(BookReturn $return)
    {
        $this->authorize('waiveFine', $return);

        try {
            $return = $this->returnService->waiveFine($return, auth()->user());
            return $this->successResponse($return, 'Fine waived successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    /**
     * Approve a return
     */
    public function approve(Request $request, BookReturn $return)
    {
        $this->authorize('approve', $return);

        try {
            $return = $this->returnService->approveReturn(
                $return,
                auth()->user(),
                $request->input('approval_notes')
            );
            return $this->successResponse($return, 'Return approved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    /**
     * Reject a return
     */
    public function reject(Request $request, BookReturn $return)
    {
        $this->authorize('reject', $return);

        try {
            $return = $this->returnService->rejectReturn(
                $return,
                auth()->user(),
                $request->input('approval_notes')
            );
            return $this->successResponse($return, 'Return rejected');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    /**
     * Export returns data
     */
    public function export(Request $request)
    {
        $this->authorize('viewAny', BookReturn::class);

        try {
            $file = $this->returnService->exportReturns($request->all());
            return response()->download($file)->deleteFileAfterSend();
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }
}
