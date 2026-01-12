<?php

namespace Database\Seeders;

use App\Models\User;
use App\Helpers\AvatarHelper;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Create Super Admin
        $superAdmin = User::create([
            'username' => 'superadmin',
            'email' => 'superadmin@library.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'status' => 'active',
        ]);
        $superAdmin->profile()->create([
            'role' => 'super-admin',
            'full_name' => 'Super Administrator',
            'phone' => '081234567890',
            'address' => 'Library Headquarters',
            'city' => 'Jakarta',
            'country' => 'Indonesia',
            'avatar' => AvatarHelper::generateDefaultAvatar($superAdmin->id),
        ]);

        // Create Admin
        $admin = User::create([
            'username' => 'admin',
            'email' => 'admin@library.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'status' => 'active',
        ]);
        $admin->profile()->create([
            'role' => 'admin',
            'full_name' => 'Administrator',
            'phone' => '081234567891',
            'address' => 'Library Main Office',
            'city' => 'Jakarta',
            'country' => 'Indonesia',
            'avatar' => AvatarHelper::generateDefaultAvatar($admin->id),
        ]);

        // Create Librarian
        $librarian = User::create([
            'username' => 'librarian',
            'email' => 'librarian@library.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'status' => 'active',
        ]);
        $librarian->profile()->create([
            'role' => 'librarian',
            'full_name' => 'Head Librarian',
            'phone' => '081234567892',
            'address' => 'Library Branch',
            'city' => 'Bandung',
            'country' => 'Indonesia',
            'avatar' => AvatarHelper::generateDefaultAvatar($librarian->id),
        ]);

        // Create Member
        $member = User::create([
            'username' => 'member',
            'email' => 'member@library.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'status' => 'active',
        ]);
        $member->profile()->create([
            'role' => 'member',
            'full_name' => 'John Doe',
            'phone' => '081234567893',
            'address' => 'Jl. Contoh No. 123',
            'city' => 'Surabaya',
            'country' => 'Indonesia',
            'member_card_number' => 'MEM-001',
            'membership_start_date' => now(),
            'membership_expiry_date' => now()->addYear(),
            'avatar' => AvatarHelper::generateDefaultAvatar($member->id),
        ]);

        // Create additional members
        for ($i = 1; $i <= 5; $i++) {
            $user = User::create([
                'username' => "member{$i}",
                'email' => "member{$i}@library.com",
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'status' => 'active',
            ]);
            $user->profile()->create([
                'role' => 'member',
                'full_name' => "Member {$i}",
                'phone' => '0812345678' . (93 + $i),
                'address' => "Jl. Member {$i} No. {$i}",
                'city' => ['Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta', 'Semarang'][$i - 1],
                'country' => 'Indonesia',
                'member_card_number' => 'MEM-' . str_pad($i + 1, 3, '0', STR_PAD_LEFT),
                'membership_start_date' => now()->subDays(rand(30, 365)),
                'membership_expiry_date' => now()->addYear(),
                'avatar' => AvatarHelper::generateDefaultAvatar($user->id),
            ]);
        }

        $this->command->info('✅ Users seeded successfully!');
    }
}
