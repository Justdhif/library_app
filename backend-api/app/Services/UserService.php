<?php

namespace App\Services;

use App\Models\User;
use App\Helpers\AvatarHelper;
use Illuminate\Support\Facades\Hash;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;

class UserService
{
    public function getAllUsers()
    {
        $perPage = request()->get('per_page', 15);
        $search = request()->get('search');

        $query = User::query();

        // Apply search if provided
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('username', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhereHas('profile', function ($profileQuery) use ($search) {
                      $profileQuery->where('full_name', 'like', "%{$search}%");
                  });
            });
        }

        // Apply filters
        if (request()->has('status')) {
            $query->where('status', request()->get('status'));
        }

        // Apply role filter if provided
        if (request()->has('role')) {
            $query->whereHas('profile', function ($q) {
                $q->where('role', request()->get('role'));
            });
        }

        // Exclude super-admin role
        $query->whereHas('profile', function ($q) {
            $q->where('role', '!=', 'super-admin');
        });

        // Order by role priority: admin > librarian > member
        $query->leftJoin('profiles', 'users.id', '=', 'profiles.user_id')
        ->select('users.*')
        ->orderByRaw("CASE
            WHEN profiles.role = 'admin' THEN 1
            WHEN profiles.role = 'librarian' THEN 2
            WHEN profiles.role = 'member' THEN 3
            ELSE 4
        END")
        ->orderBy('users.created_at', 'desc');

        // Always eager load relationships
        $paginator = $query->with(['profile'])
            ->paginate($perPage);

        // Ensure relationships are loaded on each item
        $paginator->getCollection()->load(['profile']);

        return $paginator;
    }

    public function createUser(array $data): User
    {
        $user = User::create([
            'username' => $data['username'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'status' => $data['status'] ?? 'active',
        ]);

        // Handle avatar upload or generate default
        $avatarPath = null;
        if (isset($data['avatar']) && $data['avatar'] instanceof \Illuminate\Http\UploadedFile) {
            $avatarPath = $data['avatar']->store('avatars', 'public');
        } else {
            // Generate default avatar using DiceBear
            $avatarPath = AvatarHelper::generateDefaultAvatar($user->id);
        }

        // Create profile with role
        $user->profile()->create([
            'full_name' => $data['full_name'],
            'phone' => $data['phone'] ?? null,
            'address' => $data['address'] ?? null,
            'city' => $data['city'] ?? null,
            'state' => $data['state'] ?? null,
            'postal_code' => $data['postal_code'] ?? null,
            'gender' => $data['gender'] ?? null,
            'bio' => $data['bio'] ?? null,
            'date_of_birth' => $data['date_of_birth'] ?? null,
            'avatar' => $avatarPath,
            'role' => $data['role'] ?? 'member',
        ]);

        return $user->fresh(['profile']);
    }

    public function updateUser(User $user, array $data): User
    {
        // Update user fields
        $updateData = array_filter([
            'username' => $data['username'] ?? $user->username,
            'email' => $data['email'] ?? $user->email,
            'status' => $data['status'] ?? $user->status,
        ], fn($value) => $value !== null);

        if (isset($data['password'])) {
            $updateData['password'] = Hash::make($data['password']);
        }

        $user->update($updateData);

        // Handle avatar upload
        $avatarPath = null;
        if (isset($data['avatar']) && $data['avatar'] instanceof \Illuminate\Http\UploadedFile) {
            // Delete old avatar if exists
            if ($user->profile?->avatar) {
                \Storage::disk('public')->delete($user->profile->avatar);
            }
            $avatarPath = $data['avatar']->store('avatars', 'public');
        }

        // Update profile
        $profileData = array_filter([
            'full_name' => $data['full_name'] ?? null,
            'phone' => $data['phone'] ?? null,
            'address' => $data['address'] ?? null,
            'city' => $data['city'] ?? null,
            'state' => $data['state'] ?? null,
            'postal_code' => $data['postal_code'] ?? null,
            'gender' => $data['gender'] ?? null,
            'bio' => $data['bio'] ?? null,
            'date_of_birth' => $data['date_of_birth'] ?? null,
        ], fn($value) => $value !== null);

        if ($avatarPath) {
            $profileData['avatar'] = $avatarPath;
        }

        // Update role if provided
        if (isset($data['role'])) {
            $profileData['role'] = $data['role'];
        }

        if (!empty($profileData)) {
            $user->profile()->updateOrCreate(
                ['user_id' => $user->id],
                $profileData
            );
        }

        return $user->fresh(['profile']);
    }

    public function deleteUser(User $user): bool
    {
        return $user->delete();
    }

    public function updateStatus(User $user, string $status): User
    {
        $user->update(['status' => $status]);
        return $user->fresh();
    }

    public function getUserHistory(User $user): array
    {
        return [
            'borrowings' => $user->borrowings()
                ->with('bookCopy.book')
                ->latest()
                ->take(10)
                ->get(),
            'reservations' => $user->reservations()
                ->with('book')
                ->latest()
                ->take(10)
                ->get(),
            'fines' => $user->fines()
                ->with('borrowing.bookCopy.book')
                ->latest()
                ->take(10)
                ->get(),
            'comments' => $user->comments()
                ->with('commentable')
                ->latest()
                ->take(10)
                ->get(),
            'ratings' => $user->ratings()
                ->with('book')
                ->latest()
                ->take(10)
                ->get(),
        ];
    }

    public function getUserStatistics(User $user): array
    {
        return [
            'total_borrowings' => $user->borrowings()->count(),
            'active_borrowings' => $user->borrowings()
                ->whereIn('status', ['pending', 'approved', 'borrowed'])
                ->count(),
            'total_fines' => $user->fines()->sum('amount'),
            'unpaid_fines' => $user->fines()
                ->where('status', 'unpaid')
                ->sum('amount'),
            'total_comments' => $user->comments()->count(),
            'total_ratings' => $user->ratings()->count(),
        ];
    }
}
