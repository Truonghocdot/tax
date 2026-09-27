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
        Schema::table('user_banks', function (Blueprint $table) {
            $table->enum('status', ['pending', 'verified', 'rejected'])->default('pending')->after('type');
            $table->string('branch')->nullable()->after('status');
            $table->string('account_holder_name')->nullable()->after('branch');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_banks', function (Blueprint $table) {
            $table->dropColumn(['status', 'branch', 'account_holder_name']);
        });
    }
};
