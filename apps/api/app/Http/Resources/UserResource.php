<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $profile = $this->profile;
        $banks = $this->banks;
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'username' => $this->username,
            'phone' => $this->phone,
            'role' => (int) $this->role,
            'is_active' => (bool) $this->is_active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'front_cccd' => $this->front_cccd ? url($this->front_cccd) : null,
            'back_cccd' => $this->back_cccd ? url($this->back_cccd) : null,
            'holding_cccd' => $this->holding_cccd ? url($this->holding_cccd) : null,
            'profile' => [
                'bussiness_name' => $profile->bussiness_name ?? null,
                'tax_code' => $profile->tax_code ?? null,
                'company_representative' => $profile->company_representative ?? null,
                'bussiness_address' => $profile->bussiness_address ?? null,
                'bussiness_phone' => $profile->bussiness_phone ?? null,
                'charter_capital' => $profile->charter_capital ?? null,
                'date_of_establishment' => $profile->date_of_establishment ?? null,
                'primary_business_lines' => $profile->primary_business_lines ?? null,
                'number_account' => $profile->number_account ?? null,
                'bank_name' => $profile->bank_name ?? null,
            ],
            'banks' => UserBankResource::collection($banks),
            'qr_bank' => QrBankConnectResource::make($this->qrBank),
        ];
    }
}
