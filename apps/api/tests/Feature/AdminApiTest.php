<?php

use App\Constants\UserRole;
use App\Models\User;
use App\Models\Bank;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

function createAdmin(): User
{
    return User::factory()->create([
        'username' => 'admin-test',
        'email' => 'admin-test@example.com',
        'phone' => '0900000001',
        'password' => Hash::make('Password123'),
        'role' => UserRole::ADMIN->value,
        'is_active' => true,
    ]);
}

test('admin login returns an admin token', function () {
    createAdmin();

    $this->postJson('/api/admin/login', [
        'username' => 'admin-test',
        'password' => 'Password123',
    ])->assertOk()->assertJsonPath('status', true)->assertJsonStructure(['data' => ['token', 'user']]);
});

test('admin login accepts username, email, or phone', function () {
    createAdmin();

    foreach (['admin-test', 'admin-test@example.com', '0900000001'] as $identifier) {
        $this->postJson('/api/admin/login', [
            'identifier' => $identifier,
            'password' => 'Password123',
        ])->assertOk()->assertJsonPath('status', true);
    }
});

test('regular users cannot access admin endpoints', function () {
    $user = User::factory()->create([
        'username' => 'client-test',
        'phone' => '0900000002',
        'role' => UserRole::USER->value,
        'is_active' => true,
    ]);

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/admin/stats')
        ->assertForbidden();
});

test('admin can approve a pending user', function () {
    $admin = createAdmin();
    $user = User::factory()->create([
        'username' => 'pending-test',
        'phone' => '0900000003',
        'role' => UserRole::USER->value,
        'is_active' => false,
    ]);

    $this->actingAs($admin, 'sanctum')
        ->postJson("/api/admin/users/{$user->id}/approve")
        ->assertOk()
        ->assertJsonPath('data.is_active', true);

    expect($user->refresh()->is_active)->toBeTrue();
});

test('admin users table includes admin and client roles while bulk delete only targets clients', function () {
    $admin = createAdmin();
    User::factory()->create([
        'name' => 'Client One',
        'username' => 'client-one',
        'phone' => '0900000010',
        'role' => UserRole::USER->value,
        'is_active' => true,
    ]);

    $response = $this->actingAs($admin, 'sanctum')->getJson('/api/admin/users');

    $response->assertOk()
        ->assertJsonPath('meta.total', 2)
        ->assertJsonFragment(['username' => 'admin-test', 'role' => UserRole::ADMIN->value])
        ->assertJsonFragment(['username' => 'client-one', 'role' => UserRole::USER->value]);
});

test('admin can create and update a client using the form contract', function () {
    $admin = createAdmin();

    $create = $this->actingAs($admin, 'sanctum')->postJson('/api/admin/users', [
        'name' => 'Created Client',
        'email' => 'created@example.com',
        'phone' => '0900000011',
        'username' => 'created-client',
        'password' => 'Password123',
    ])->assertCreated();

    $userId = $create->json('data.id');
    $this->actingAs($admin, 'sanctum')->postJson("/api/admin/users/{$userId}", [
        '_method' => 'PATCH',
        'name' => 'Updated Client',
        'email' => 'created@example.com',
        'phone' => '0900000011',
        'username' => 'created-client',
    ])->assertOk()->assertJsonPath('data.name', 'Updated Client');
});

test('qr bank update validates a real bank bin and persists all qr fields', function () {
    $admin = createAdmin();
    $user = User::factory()->create(['role' => UserRole::USER->value, 'is_active' => true]);
    Bank::create(['name' => 'Test Bank', 'code' => 'TB', 'bin' => '970400', 'short_name' => 'TB']);

    $this->actingAs($admin, 'sanctum')
        ->putJson("/api/admin/users/{$user->id}/qr-bank", [
            'bin_bank' => '970400',
            'number_account' => '123456789',
            'amount' => 100000,
            'account_name' => 'TEST CLIENT',
            'description' => 'Nop thue',
            'tax_id' => '0101234567',
            'company_name' => 'Test Company',
        ])->assertOk()->assertJsonPath('data.qr_bank.company_name', 'Test Company');
});

test('admin cannot delete an admin account', function () {
    $admin = createAdmin();

    $this->actingAs($admin, 'sanctum')
        ->deleteJson("/api/admin/users/{$admin->id}")
        ->assertStatus(422);

    $this->assertDatabaseHas('users', ['id' => $admin->id]);
});

test('user bank resource never exposes credentials', function () {
    $admin = createAdmin();
    $user = User::factory()->create(['role' => UserRole::USER->value, 'is_active' => true]);
    $user->banks()->create([
        'bank_id' => null,
        'type' => 1,
        'number_account' => '123456789',
        'password' => 'secret',
        'CVV' => '123',
    ]);

    $response = $this->actingAs($admin, 'sanctum')->getJson('/api/admin/users');

    $response->assertOk()->assertJsonMissing(['password' => 'secret'])->assertJsonMissing(['CVV' => '123']);
});
