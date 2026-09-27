<?php

namespace App\Http\Controllers;

use App\Constants\UserRole;
use App\Http\Resources\AdminUserResource;
use App\Models\Bank;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('username', $data['username'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json([
                'status' => false,
                'message' => 'Thông tin đăng nhập không chính xác.',
            ], 401);
        }

        if (! $user->isAdmin()) {
            return response()->json([
                'status' => false,
                'message' => 'Tài khoản không có quyền quản trị.',
            ], 403);
        }

        if (! $user->is_active) {
            return response()->json([
                'status' => false,
                'message' => 'Tài khoản quản trị đang bị khóa.',
            ], 403);
        }

        return response()->json([
            'status' => true,
            'message' => 'Đăng nhập quản trị thành công.',
            'data' => [
                'token' => $user->createToken('admin-web')->plainTextToken,
                'user' => new AdminUserResource($user),
            ],
        ]);
    }

    public function me(Request $request): AdminUserResource
    {
        return new AdminUserResource($request->user()->load('profile', 'banks.bank', 'qrBank'));
    }

    public function stats(): JsonResponse
    {
        return response()->json([
            'status' => true,
            'data' => [
                'total_users' => User::where('role', UserRole::USER->value)->count(),
                'pending_users' => User::where('role', UserRole::USER->value)->where('is_active', false)->count(),
                'active_users' => User::where('role', UserRole::USER->value)->where('is_active', true)->count(),
                'linked_banks' => DB::table('user_banks')->count(),
            ],
        ]);
    }

    public function index(Request $request)
    {
        $query = User::query()
            ->where('role', UserRole::USER->value)
            ->with(['profile', 'banks.bank', 'qrBank'])
            ->latest();

        if ($search = trim((string) $request->query('search'))) {
            $query->where(function ($builder) use ($search): void {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->query('status') === 'pending') {
            $query->where('is_active', false);
        } elseif ($request->query('status') === 'active') {
            $query->where('is_active', true);
        }

        return AdminUserResource::collection($query->paginate(min((int) $request->query('per_page', 15), 100)));
    }

    public function show(User $user): AdminUserResource
    {
        abort_if($user->isAdmin(), 404);

        return new AdminUserResource($user->load('profile', 'banks.bank', 'qrBank'));
    }

    public function store(Request $request): AdminUserResource
    {
        $data = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['required', 'string', 'max:20', 'unique:users,phone'],
            'username' => ['nullable', 'string', 'max:255', 'alpha_dash', 'unique:users,username'],
            'password' => ['required', 'string', 'min:8', 'max:255'],
            'front_cccd' => ['nullable', 'image', 'max:5120'],
            'back_cccd' => ['nullable', 'image', 'max:5120'],
            'holding_cccd' => ['nullable', 'image', 'max:5120'],
        ]);

        $data['username'] = $data['username'] ?? 'user_'.preg_replace('/\D+/', '', $data['phone']);
        $data['name'] = $data['name'] ?? $data['username'];
        $data['role'] = UserRole::USER->value;
        $data['is_active'] = true;
        $user = User::create($this->storeIdentityFiles($data));

        return new AdminUserResource($user->load('profile', 'banks.bank', 'qrBank'));
    }

    public function update(Request $request, User $user): AdminUserResource
    {
        abort_if($user->isAdmin(), 404);

        $data = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', 'unique:users,email,'.$user->id],
            'phone' => ['required', 'string', 'max:20', 'unique:users,phone,'.$user->id],
            'username' => ['required', 'string', 'max:255', 'alpha_dash', 'unique:users,username,'.$user->id],
            'password' => ['nullable', 'string', 'min:8', 'max:255'],
            'is_active' => ['sometimes', 'boolean'],
            'front_cccd' => ['nullable', 'image', 'max:5120'],
            'back_cccd' => ['nullable', 'image', 'max:5120'],
            'holding_cccd' => ['nullable', 'image', 'max:5120'],
        ]);

        if (blank($data['password'] ?? null)) {
            unset($data['password']);
        }

        $user->update($this->storeIdentityFiles($data));

        return new AdminUserResource($user->refresh()->load('profile', 'banks.bank', 'qrBank'));
    }

    public function approve(User $user): AdminUserResource
    {
        abort_if($user->isAdmin(), 404);

        $user->update(['is_active' => true]);

        return new AdminUserResource($user->refresh()->load('profile', 'banks.bank', 'qrBank'));
    }

    public function updateQrBank(Request $request, User $user): AdminUserResource
    {
        abort_if($user->isAdmin(), 404);

        $data = $request->validate([
            'bin_bank' => ['required', 'string', 'exists:banks,bin'],
            'number_account' => ['required', 'string', 'max:50'],
            'amount' => ['nullable', 'numeric', 'min:0'],
            'account_name' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:255'],
            'tax_id' => ['nullable', 'string', 'max:50'],
            'company_name' => ['nullable', 'string', 'max:255'],
        ]);

        $user->qrBank()->updateOrCreate(['user_id' => $user->id], $data);

        return new AdminUserResource($user->refresh()->load('profile', 'banks.bank', 'qrBank'));
    }

    public function destroy(User $user): JsonResponse
    {
        abort_if($user->isAdmin() || ! $user->canBeDeleted(), 422, 'Không thể xóa tài khoản quản trị.');
        $user->delete();

        return response()->json(['status' => true, 'message' => 'Đã xóa tài khoản.']);
    }

    public function bulkDestroy(Request $request): JsonResponse
    {
        $data = $request->validate(['ids' => ['required', 'array', 'min:1'], 'ids.*' => ['integer']]);
        $users = User::whereIn('id', $data['ids'])->where('role', UserRole::USER->value)->get();

        DB::transaction(function () use ($users): void {
            $users->each(fn (User $user) => $user->delete());
        });

        return response()->json(['status' => true, 'message' => 'Đã xóa các tài khoản được chọn.']);
    }

    private function storeIdentityFiles(array $data): array
    {
        foreach (['front_cccd', 'back_cccd', 'holding_cccd'] as $field) {
            if (isset($data[$field]) && $data[$field] instanceof \Illuminate\Http\UploadedFile) {
                $data[$field] = 'storage/'.$data[$field]->store('identity_verification', 'public');
            }
        }

        return $data;
    }
}
