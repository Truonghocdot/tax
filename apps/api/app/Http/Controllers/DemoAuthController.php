<?php

namespace App\Http\Controllers;

use App\Constants\UserRole;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DemoAuthController extends Controller
{
    /**
     * Create or refresh a regular demo user and return a Sanctum token.
     *
     * This endpoint is deliberately separate from the real login flow. It is
     * available only when explicitly enabled in a non-production environment.
     */
    public function login(Request $request): JsonResponse
    {
        if (! $this->isEnabled()) {
            return response()->json([
                'status' => false,
                'message' => 'Demo login is disabled.',
            ], 404);
        }

        $data = $request->validate([
            'identifier' => ['nullable', 'string', 'max:255', 'required_without:username'],
            'username' => ['nullable', 'string', 'max:255', 'required_without:identifier'],
            'password' => ['required', 'string', 'max:255'],
            'name' => ['nullable', 'string', 'max:255'],
        ]);

        $identifier = trim((string) ($data['identifier'] ?? $data['username'] ?? ''));
        if ($identifier === '') {
            return response()->json([
                'status' => false,
                'message' => 'Identifier is required.',
            ], 422);
        }

        $user = DB::transaction(function () use ($data, $identifier): User {
            $user = User::query()
                ->where(function ($query) use ($identifier): void {
                    $query->where('username', $identifier)
                        ->orWhere('email', $identifier)
                        ->orWhere('phone', $identifier);
                })
                ->first();

            if ($user?->isAdmin()) {
                abort(response()->json([
                    'status' => false,
                    'message' => 'Demo login cannot be used for an admin account.',
                ], 403));
            }

            $attributes = [
                'name' => $data['name'] ?? $user?->name ?? $identifier,
                'password' => Hash::make($data['password']),
                'role' => UserRole::USER->value,
                'is_active' => true,
            ];

            if (! $user) {
                $attributes['username'] = $identifier;

                if (filter_var($identifier, FILTER_VALIDATE_EMAIL)) {
                    $attributes['email'] = $identifier;
                } elseif (preg_match('/^\\+?[0-9\\s().-]{7,30}$/', $identifier) === 1) {
                    $attributes['phone'] = $identifier;
                }

                $user = User::create($attributes);
            } else {
                $user->forceFill($attributes)->save();
            }

            return $user->fresh();
        });

        // Keep repeated demo logins from accumulating disposable tokens while
        // leaving any normal application tokens untouched.
        $user->tokens()->where('name', 'demo-auth')->delete();
        $token = $user->createToken('demo-auth')->plainTextToken;

        return response()->json([
            'status' => true,
            'message' => 'Demo login successful.',
            'data' => [
                'token' => $token,
                'user' => new UserResource($user->load('profile', 'banks.bank', 'qrBank')),
                'demo' => true,
            ],
        ]);
    }

    private function isEnabled(): bool
    {
        return (bool) config('demo.login_enabled', false)
            && config('app.env') !== 'production'
            && ! app()->environment('production');
    }
}
