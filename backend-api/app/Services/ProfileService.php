<?php

namespace App\Services;

use App\Models\User;
use App\Models\Profile;
use App\Helpers\AvatarHelper;

class ProfileService
{
    public function updateProfile(User $user, array $data): Profile
    {
        $profile = $user->profile;

        if (!$profile) {
            // Create profile if not exists
            $profile = $user->profile()->create([
                'avatar' => AvatarHelper::generateDefaultAvatar($user->id),
            ]);
        }

        // If avatar is not provided or empty, keep the default DiceBear Avatar
        if (empty($data['avatar'])) {
            $data['avatar'] = AvatarHelper::generateDefaultAvatar($user->id);
        }

        $profile->update($data);

        return $profile->fresh();
    }

    public function getProfile(User $user): ?Profile
    {
        return $user->profile;
    }
}
