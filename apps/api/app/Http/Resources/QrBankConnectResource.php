<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QrBankConnectResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'bin_bank' => $this->bin_bank,
            'number_account' => $this->number_account,
            'amount' => $this->amount,
            'account_name' => $this->account_name,
            'description' => $this->description ?? '',
            'tax_id' => $this->tax_id,
            'company_name' => $this->company_name,
        ];
    }
}
    
