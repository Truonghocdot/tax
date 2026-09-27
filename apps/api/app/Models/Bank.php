<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bank extends Model
{
    protected $table = "banks";

    protected $fillable = [
        'name',
        'code',
        'logo',
        'bin',
        'short_name'
    ];

    public function userBanks()
    {
        return $this->hasMany(UserBank::class);
    }
}
