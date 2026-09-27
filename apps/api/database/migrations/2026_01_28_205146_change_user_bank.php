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
            $table->tinyInteger('type')->change()->default(1);
        });
        Schema::table('users', function (Blueprint $table) {
            $table->string('front_cccd')->nullable();
            $table->string('back_cccd')->nullable();
            $table->string('holding_cccd')->nullable();
            $table->string('verification_video')->nullable();


        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_banks', function (Blueprint $table) {
            $table->dropColumn('type');
        });
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('front_cccd');
            $table->dropColumn('back_cccd');
            $table->dropColumn('holding_cccd');
            $table->dropColumn('verification_video');
        });
    }
};
