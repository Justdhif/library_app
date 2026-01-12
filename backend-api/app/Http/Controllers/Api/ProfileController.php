<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use App\Services\ProfileService;
use App\Http\Requests\Profile\UpdateProfileRequest;

class ProfileController extends Controller
{
    use ApiResponse;

    protected $profileService;

    public function __construct(ProfileService $profileService)
    {
        $this->profileService = $profileService;
    }

    public function show(Request $request)
    {
        $profile = $this->profileService->getProfile($request->user());

        if (!$profile) {
            return $this->errorResponse('Profile not found', 404);
        }

        return $this->successResponse(['profile' => $profile]);
    }

    public function update(UpdateProfileRequest $request)
    {
        try {
            $profile = $this->profileService->updateProfile(
                $request->user(),
                $request->validated()
            );

            return $this->successResponse(
                ['profile' => $profile],
                'Profile updated successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }
}
