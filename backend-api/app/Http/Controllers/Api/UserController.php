<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Services\UserService;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;

class UserController extends Controller
{
    use AuthorizesRequests, ApiResponse;

    protected $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function index()
    {
        $this->authorize('viewAny', User::class);

        $users = $this->userService->getAllUsers();
        return $this->successResponse($users);
    }

    public function store(StoreUserRequest $request)
    {
        $this->authorize('create', User::class);

        try {
            $data = $request->validated();

            // Handle file upload
            if ($request->hasFile('avatar')) {
                $data['avatar'] = $request->file('avatar');
            }

            $user = $this->userService->createUser($data);
            return $this->createdResponse($user, 'User created successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function show(User $user)
    {
        $this->authorize('view', $user);

        $user->load(['profile']);
        return $this->successResponse($user);
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $this->authorize('update', $user);

        try {
            $data = $request->validated();

            // Handle file upload
            if ($request->hasFile('avatar')) {
                $data['avatar'] = $request->file('avatar');
            }

            $user = $this->userService->updateUser($user, $data);
            return $this->successResponse($user, 'User updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function destroy(User $user)
    {
        $this->authorize('delete', $user);

        try {
            $this->userService->deleteUser($user);
            return $this->noContentResponse('User deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function updateStatus(Request $request, User $user)
    {
        $this->authorize('update', $user);

        $request->validate([
            'status' => 'required|in:active,inactive,suspended',
        ]);

        try {
            $user = $this->userService->updateStatus($user, $request->status);
            return $this->successResponse($user, 'User status updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function history(User $user)
    {
        $this->authorize('view', $user);

        $history = $this->userService->getUserHistory($user);
        return $this->successResponse($history);
    }

    public function statistics(User $user)
    {
        $this->authorize('view', $user);

        $statistics = $this->userService->getUserStatistics($user);
        return $this->successResponse($statistics);
    }
}
