<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Fine;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Services\FineService;
use App\Http\Requests\Fine\PayFineRequest;

class FineController extends Controller
{
    use AuthorizesRequests, ApiResponse;

    protected $fineService;

    public function __construct(FineService $fineService)
    {
        $this->fineService = $fineService;
    }

    public function index()
    {
        $this->authorize('viewAny', Fine::class);

        $fines = $this->fineService->getAllFines();
        return $this->successResponse($fines);
    }

    public function show(Fine $fine)
    {
        $this->authorize('view', $fine);

        $fine->load([
            'user.profile',
            'borrowing.bookCopy.book.publisher',
            'borrowing.bookCopy.book.authors',
            'waivedBy',
        ]);

        return $this->successResponse($fine);
    }

    public function pay(PayFineRequest $request, Fine $fine)
    {
        $this->authorize('pay', $fine);

        try {
            $fine = $this->fineService->payFine($fine, $request->validated());
            return $this->successResponse($fine, 'Payment recorded successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function waive(Request $request, Fine $fine)
    {
        $this->authorize('waive', $fine);

        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        try {
            $fine = $this->fineService->waiveFine($fine, $request->user(), $request->reason);
            return $this->successResponse($fine, 'Fine waived successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function myFines(Request $request)
    {
        $fines = $this->fineService->getUserFines($request->user());
        return $this->successResponse($fines);
    }

    public function unpaid()
    {
        $this->authorize('viewAny', Fine::class);

        $fines = $this->fineService->getUnpaidFines();
        return $this->successResponse($fines);
    }

    public function summary()
    {
        $this->authorize('viewAny', Fine::class);

        $summary = $this->fineService->getUserFineSummary();
        return $this->successResponse($summary);
    }
}
