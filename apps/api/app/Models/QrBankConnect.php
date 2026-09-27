<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QrBankConnect extends Model
{
    protected $table = 'qr_bank_connect';
    protected $fillable = [
        'user_id',
        'bin_bank',
        'number_account',
        'amount',
        'account_name',
        'description',
        'tax_id',
        'company_name',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
