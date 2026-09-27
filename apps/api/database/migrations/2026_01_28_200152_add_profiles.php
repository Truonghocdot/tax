<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create("profiles", function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('bussiness_name')->nullable();
            $table->string('tax_code')->nullable();
            $table->string('company_representative')->nullable();
            $table->string('bussiness_address')->nullable();
            $table->string('bussiness_phone')->nullable();
            $table->string('charter_capital')->nullable();
            $table->string('date_of_establishment')->nullable();
            $table->string('primary_business_lines')->nullable();
            $table->string('number_account')->nullable();
            $table->string('bank_name')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profiles');
    }
};
