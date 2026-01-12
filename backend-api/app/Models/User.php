<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens, SoftDeletes, LogsActivity;

    protected $fillable = [
        'username',
        'email',
        'password',
        'status',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['username', 'email', 'status'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    // Relationships
    public function profile()
    {
        return $this->hasOne(Profile::class);
    }

    public function borrowings()
    {
        return $this->hasMany(Borrowing::class);
    }

    public function activeBorrowings()
    {
        return $this->borrowings()->whereIn('status', ['pending', 'approved', 'active']);
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    public function fines()
    {
        return $this->hasMany(Fine::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function ratings()
    {
        return $this->hasMany(Rating::class);
    }

    public function createdBooks()
    {
        return $this->hasMany(Book::class, 'created_by');
    }

    public function notifications()
    {
        return $this->morphMany('Illuminate\Notifications\DatabaseNotification', 'notifiable')->orderBy('created_at', 'desc');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('username', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%")
              ->orWhereHas('profile', function ($profileQuery) use ($search) {
                  $profileQuery->where('full_name', 'like', "%{$search}%");
              });
        });
    }

    public function scopeMembers($query)
    {
        return $query->whereHas('profile', fn($q) => $q->where('role', 'member'));
    }

    // Helper Methods
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    // Role Helper Methods
    public function hasRole(string $role): bool
    {
        return $this->profile && $this->profile->role === $role;
    }

    public function hasAnyRole(array $roles): bool
    {
        return $this->profile && in_array($this->profile->role, $roles);
    }

    public function isSuperAdmin(): bool
    {
        return $this->hasRole('super-admin');
    }

    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    public function isLibrarian(): bool
    {
        return $this->hasRole('librarian');
    }

    public function isMember(): bool
    {
        return $this->hasRole('member');
    }

    public function hasActiveBorrowings(): bool
    {
        return $this->activeBorrowings()->exists();
    }

    public function hasUnpaidFines(): bool
    {
        return $this->fines()->where('status', '!=', 'paid')->exists();
    }

    public function canBorrow(): bool
    {
        return $this->isActive() && !$this->hasUnpaidFines();
    }

    public function updatedBooks()
    {
        return $this->hasMany(Book::class, 'updated_by');
    }

    public function scopeInactive($query)
    {
        return $query->where('status', 'inactive');
    }

    public function scopeSuspended($query)
    {
        return $query->where('status', 'suspended');
    }

    public function isSuspended(): bool
    {
        return $this->status === 'suspended';
    }

    public function hasOverdueBorrowings(): bool
    {
        return $this->borrowings()
            ->where('status', 'active')
            ->where('due_date', '<', now())
            ->exists();
    }
}
