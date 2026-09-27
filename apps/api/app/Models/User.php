<?php

namespace App\Models;

use App\Constants\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'username',
        'role',
        'is_active',
        'front_cccd',
        'back_cccd',
        'holding_cccd',
        'verification_video',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::deleting(fn (User $user): bool => $user->canBeDeleted());
    }

    public function isAdmin(): bool
    {
        return (int) $this->role === UserRole::ADMIN->value;
    }

    public function canBeDeleted(): bool
    {
        return ! $this->isAdmin();
    }

    public function profile()
    {
        return $this->hasOne(Profile::class);
    }

    public function banks()
    {
        return $this->hasMany(UserBank::class);
    }

    public function qrBank()
    {
        return $this->hasOne(QrBankConnect::class);
    }
}
