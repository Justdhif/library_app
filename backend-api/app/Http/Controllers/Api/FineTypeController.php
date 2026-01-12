<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FineType;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;

class FineTypeController extends Controller
{
    use ApiResponse;

    /**
     * Get all active fine types
     */
    public function index()
    {
        $fineTypes = FineType::where('is_active', true)
            ->orderBy('amount')
            ->get();

        return $this->successResponse($fineTypes);
    }

    /**
     * Get fine info by book condition
     */
    public function getByCondition(Request $request)
    {
        $condition = $request->input('condition');

        if (!$condition) {
            return $this->errorResponse('Condition is required', 400);
        }

        $fineType = FineType::getByCondition($condition);

        if (!$fineType) {
            return $this->successResponse([
                'has_fine' => false,
                'amount' => 0,
                'message' => 'No fine for this condition',
            ]);
        }

        return $this->successResponse([
            'has_fine' => true,
            'fine_type' => $fineType,
            'amount' => $fineType->amount,
            'formatted_amount' => 'Rp ' . number_format($fineType->amount, 0, ',', '.'),
        ]);
    }
}
