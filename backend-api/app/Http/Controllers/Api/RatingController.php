<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rating;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Services\RatingService;
use App\Http\Requests\Rating\StoreRatingRequest;
use App\Http\Requests\Rating\UpdateRatingRequest;

class RatingController extends Controller
{
    use AuthorizesRequests, ApiResponse;

    protected $ratingService;

    public function __construct(RatingService $ratingService)
    {
        $this->ratingService = $ratingService;
    }

    public function index(Request $request)
    {
        $ratings = $this->ratingService->getAllRatings($request->all());
        return $this->successResponse($ratings);
    }

    public function store(StoreRatingRequest $request)
    {
        $this->authorize('create', Rating::class);

        try {
            $rating = $this->ratingService->createRating(auth()->id(), $request->validated());
            return $this->createdResponse($rating, 'Rating submitted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function show(Rating $rating)
    {
        $rating->load(['user.profile', 'ratable']);
        return $this->successResponse($rating);
    }

    public function update(UpdateRatingRequest $request, Rating $rating)
    {
        $this->authorize('update', $rating);

        try {
            $rating = $this->ratingService->updateRating($rating, $request->validated());
            return $this->successResponse($rating, 'Rating updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function destroy(Rating $rating)
    {
        $this->authorize('delete', $rating);

        try {
            $this->ratingService->deleteRating($rating);
            return $this->noContentResponse('Rating deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function helpful(Rating $rating)
    {
        try {
            $rating = $this->ratingService->markAsHelpful($rating);
            return $this->successResponse($rating, 'Rating marked as helpful');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function notHelpful(Rating $rating)
    {
        $rating->markAsNotHelpful();
        return $this->successResponse($rating->fresh(), 'Rating marked as not helpful');
    }

    public function myRating(Request $request)
    {
        $request->validate([
            'ratable_type' => 'required|string',
            'ratable_id' => 'required|integer',
        ]);

        $rating = Rating::where('ratable_type', $request->ratable_type)
            ->where('ratable_id', $request->ratable_id)
            ->where('user_id', auth()->id())
            ->first();

        if (!$rating) {
            return $this->notFoundResponse('No rating found');
        }

        return $this->successResponse($rating);
    }

    public function verified()
    {
        $ratings = $this->ratingService->getVerifiedRatings();
        return $this->successResponse($ratings);
    }
}
