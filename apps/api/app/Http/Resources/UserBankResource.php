<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserBankResource extends JsonResource
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
            'account_number' => $this->account_number ?? null,
            'account_name' => $this->account_name ?? null,
            'bank_id' => $this->bank_id ?? null,
            'type' => $this->type ?? null,
            'tag_number' => $this->tag_number ?? null,
            'number_account' => $this->number_account ?? null,
            'expired_date' => $this->expired_date ?? null,
            'status' => $this->status ?? null,
            'branch' => $this->branch ?? null,
            'account_holder_name' => $this->account_holder_name ?? null,
            'bank' => $this->whenLoaded('bank'),
        ];
    }
}
