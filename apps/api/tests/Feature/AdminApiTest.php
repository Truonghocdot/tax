<?php

use App\Constants\UserRole;
use App\Models\User;
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
