<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    protected $table = "profiles";

    protected $fillable = [
        'user_id',
        'bussiness_name',
        'tax_code',
        'company_representative',
        'bussiness_address',
        'bussiness_phone',
        'charter_capital',
        'date_of_establishment',
        'primary_business_lines',
        'number_account',
        'bank_name',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
