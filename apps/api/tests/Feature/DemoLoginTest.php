<?php

use App\Constants\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    config([
        'app.env' => 'testing',
        'demo.login_enabled' => true,
    ]);
});

test('demo login upserts a regular user and returns a sanctum token', function () {
    $first = $this->postJson('/api/demo/login', [
        'username' => 'demo-user@example.test',
        'password' => 'first-password',
    ]);

    $first
        ->assertOk()
        ->assertJsonPath('status', true)
        ->assertJsonPath('data.user.username', 'demo-user@example.test')
        ->assertJsonPath('data.user.email', 'demo-user@example.test')
        ->assertJsonPath('data.user.role', UserRole::USER->value)
        ->assertJsonPath('data.user.is_active', true)
        ->assertJsonPath('data.demo', true)
        ->assertJsonStructure(['data' => ['token', 'user']]);

    $user = User::where('username', 'demo-user@example.test')->firstOrFail();
    expect(User::count())->toBe(1)
        ->and(Hash::check('first-password', $user->password))->toBeTrue();

    $second = $this->postJson('/api/demo/login', [
        'identifier' => 'demo-user@example.test',
        'password' => 'second-password',
        'name' => 'Demo User',
    ])->assertOk();

    $user->refresh();
    expect(User::count())->toBe(1)
        ->and($user->name)->toBe('Demo User')
        ->and(Hash::check('second-password', $user->password))->toBeTrue();

    $this->withToken($second->json('data.token'))
        ->getJson('/api/user')
        ->assertOk()
        ->assertJsonPath('data.username', 'demo-user@example.test');
});

test('demo login is unavailable when the feature flag is disabled', function () {
    config(['demo.login_enabled' => false]);

    $this->postJson('/api/demo/login', [
        'username' => 'disabled-demo',
        'password' => 'password',
    ])->assertNotFound()->assertJsonPath('status', false);

    expect(User::count())->toBe(0);
});

test('demo login remains unavailable in production even when enabled', function () {
    config([
        'app.env' => 'production',
        'demo.login_enabled' => true,
    ]);

    $this->postJson('/api/demo/login', [
        'username' => 'production-demo',
        'password' => 'password',
    ])->assertNotFound();

    expect(User::count())->toBe(0);
});

test('demo login cannot take over an admin account', function () {
    User::factory()->create([
        'username' => 'demo-admin',
        'role' => UserRole::ADMIN->value,
        'is_active' => true,
    ]);

    $this->postJson('/api/demo/login', [
        'username' => 'demo-admin',
        'password' => 'password',
    ])->assertForbidden();
});
