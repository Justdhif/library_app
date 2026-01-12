<?php

namespace App\Services;

use App\Models\User;
use App\Helpers\AvatarHelper;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthService
{
    public function register(array $data): array
    {
        // Create username from email
        $username = explode('@', $data['email'])[0] . rand(1000, 9999);

        $user = User::create([
            'username' => $username,
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'status' => 'active',
        ]);

        // Create profile with data from registration
        // Role is stored in profile, default is 'member'
        // Use DiceBear Avatar if no custom avatar provided
        $avatarUrl = !empty($data['avatar'])
            ? $data['avatar']
            : AvatarHelper::generateDefaultAvatar($user->id);

        $user->profile()->create([
            'role' => $data['role'] ?? 'member',
            'full_name' => $data['full_name'],
            'phone' => $data['phone'] ?? null,
            'address' => $data['address'] ?? null,
            'city' => $data['city'] ?? null,
            'state' => $data['state'] ?? null,
            'postal_code' => $data['postal_code'] ?? null,
            'country' => $data['country'] ?? null,
            'date_of_birth' => $data['date_of_birth'] ?? null,
            'gender' => $data['gender'] ?? null,
            'avatar' => $avatarUrl,
            'bio' => $data['bio'] ?? null,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user->load(['profile']),
            'token' => $token,
        ];
    }

    public function login(array $credentials): ?array
    {
        if (!Auth::attempt($credentials)) {
            return null;
        }

        $user = Auth::user();

        if ($user->status !== 'active') {
            Auth::logout();
            throw new \Exception('Your account is not active');
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user->load('profile'),
            'token' => $token,
        ];
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
    }

    public function changePassword(User $user, string $currentPassword, string $newPassword): bool
    {
        if (!Hash::check($currentPassword, $user->password)) {
            throw new \Exception('Current password is incorrect');
        }

        $user->update([
            'password' => Hash::make($newPassword),
        ]);

        return true;
    }

    public function getProfile(User $user): User
    {
        return $user->load('profile');
    }
}
