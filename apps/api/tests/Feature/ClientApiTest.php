<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('client api exceptions return json with a request id', function () {
    $response = $this->getJson('/api/user');

    $response->assertUnauthorized()
        ->assertHeader('X-Request-Id')
        ->assertJsonPath('status', false);
});

test('client registration creates a pending user and returns a request id', function () {
    $response = $this->postJson('/api/register', [
        'phone' => '0900000099',
        'username' => 'client-register',
        'password' => 'Password123',
        'password_confirmation' => 'Password123',
    ]);

    $response->assertOk()
        ->assertHeader('X-Request-Id')
        ->assertJsonPath('status', true)
        ->assertJsonPath('data.username', 'client-register')
        ->assertJsonPath('data.is_active', false);

    $this->assertDatabaseHas('users', [
        'phone' => '0900000099',
        'username' => 'client-register',
        'is_active' => false,
    ]);
});

test('client registration rejects duplicate credentials with a request id', function () {
    $this->postJson('/api/register', [
        'phone' => '0900000098',
        'username' => 'existing-client',
        'password' => 'Password123',
        'password_confirmation' => 'Password123',
    ])->assertOk();

    $response = $this->postJson('/api/register', [
        'phone' => '0900000098',
        'username' => 'existing-client',
        'password' => 'Password123',
        'password_confirmation' => 'Password123',
    ]);

    $response->assertStatus(422)
        ->assertHeader('X-Request-Id')
        ->assertJsonPath('status', false);

    expect(User::where('username', 'existing-client')->count())->toBe(1);
});
