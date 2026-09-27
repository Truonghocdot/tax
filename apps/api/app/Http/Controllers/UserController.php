<?php

namespace App\Http\Controllers;

use App\Constants\UserBankType;
use App\Constants\UserRole;
use App\Models\Profile;
use App\Models\User;
use App\Models\UserBank;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * Register new user
     */
    public function register(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make(
                $request->all(),
                [
                    'phone' => 'required|unique:users,phone',
                    'password' => 'required|confirmed',
                    'username' => 'required|unique:users,username',
                ],
                [
                    'phone.unique' => 'Số điện thoại đã được sử dụng',
                    'username.unique' => 'Tên người dùng đã được sử dụng',
                    'password.confirmed' => 'Mật khẩu không khớp',
                    'phone.required' => 'Số điện thoại không được để trống',
                    'username.required' => 'Tên người dùng không được để trống',
                    'password.required' => 'Mật khẩu không được để trống',
                    'phone.phone' => 'Số điện thoại không hợp lệ',
                ]
            );

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => $validator->errors()->first(),
                ], 422);
            }
            $data = $request->all();
            $user = User::create([
                'phone' => $data['phone'],
                'password' => Hash::make($data['password']),
                'username' => $data['username'],
                'role' => UserRole::USER->value,
                'is_active' => false,
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Đăng ký thành công. Tài khoản đang chờ quản trị viên duyệt.',
                'data' => $user,
            ], 200);
        } catch (\Throwable $th) {
            Log::error($th->getMessage(), $th->getTrace());

            return response()->json([
                'status' => false,
                'message' => 'Đăng ký thất bại, có lôi xảy ra ở máy chủ',
            ], 500);
        }
    }

    /**
     * Login user
     */
    public function login(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make(
                $request->all(),
                [
                    'username' => 'required',
                    'password' => 'required',
                ],
                [
                    'username.required' => 'Tên người dùng không được để trống',
                    'password.required' => 'Mật khẩu không được để trống',
                ]
            );

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => $validator->errors()->first(),
                ], 422);
            }
            $data = $request->all();
            $user = User::where('username', $data['username'])->first();
            if (! $user) {
                return response()->json([
                    'status' => false,
                    'message' => 'Tên người dùng không tồn tại',
                ], 404);
            }
            if (! Hash::check($data['password'], $user->password)) {
                return response()->json([
                    'status' => false,
                    'message' => 'Mật khẩu không chính xác',
                ], 401);
            }
            if (! $user->is_active) {
                return response()->json([
                    'status' => false,
                    'message' => 'Tài khoản đang chờ hệ thống kích hoạt.',
                ], 403);
            }
            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'status' => true,
                'message' => 'Đăng nhập thành công',
                'data' => [
                    'token' => $token,
                ],
            ], 200);
        } catch (\Throwable $th) {
            Log::error($th->getMessage(), $th->getTrace());

            return response()->json([
                'status' => false,
                'message' => 'Đăng nhập thất bại, có lôi xảy ra ở máy chủ',
            ], 500);
        }
    }

    /**
     * Update Profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $validator = Validator::make(
                $request->all(),
                [
                    'bussiness_name' => 'nullable',
                    'tax_code' => 'nullable',
                    'company_representative' => 'nullable',
                    'bussiness_address' => 'nullable',
                    'bussiness_phone' => 'nullable',
                    'charter_capital' => 'nullable',
                    'date_of_establishment' => 'nullable',
                    'primary_business_lines' => 'nullable',
                    'number_account' => 'nullable',
                    'bank_name' => 'nullable',
                ]
            );

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => $validator->errors()->first(),
                ], 422);
            }
            $data = $request->all();
            if (! $user) {
                return response()->json([
                    'status' => false,
                    'message' => 'Tên người dùng không tồn tại',
                ], 404);
            }

            Profile::updateOrCreate([
                'user_id' => $user->id,
            ], [
                'bussiness_name' => $data['bussiness_name'] ?? null,
                'tax_code' => $data['tax_code'] ?? null,
                'company_representative' => $data['company_representative'] ?? null,
                'bussiness_address' => $data['bussiness_address'] ?? null,
                'bussiness_phone' => $data['bussiness_phone'] ?? null,
                'charter_capital' => $data['charter_capital'] ?? null,
                'date_of_establishment' => $data['date_of_establishment'] ?? null,
                'primary_business_lines' => $data['primary_business_lines'] ?? null,
                'number_account' => $data['number_account'] ?? null,
                'bank_name' => $data['bank_name'] ?? null,
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Cập nhật thông tin thành công',
                'data' => $user,
            ], 200);
        } catch (\Throwable $th) {
            Log::error($th->getMessage(), $th->getTrace());

            return response()->json([
                'status' => false,
                'message' => 'Cập nhật thông tin thất bại, có lôi xảy ra ở máy chủ',
            ], 500);
        }
    }

    /**
     * Add banks
     */
    public function addBank(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $validator = Validator::make(
                $request->all(),
                [
                    'bank_id' => 'required',
                    'number_account' => 'required',
                    'type' => 'required|in:1,2',
                    'branch' => 'nullable|string',
                    'account_holder_name' => 'nullable|string',
                ],
                [
                    'bank_id.required' => 'Tên ngân hàng không được để trống',
                    'number_account.required' => 'Số tài khoản không được để trống',
                    'type.required' => 'Loại tài khoản không được để trống',
                    'type.in' => 'Loại tài khoản không hợp lệ',
                ]
            );

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => $validator->errors()->first(),
                ], 422);
            }
            $data = $request->all();
            if (! $user) {
                return response()->json([
                    'status' => false,
                    'message' => 'Tên người dùng không tồn tại',
                ], 404);
            }

            $bankData = [
                'user_id' => $user->id,
                'bank_id' => $data['bank_id'],
                'type' => $data['type'],
                'status' => UserBank::STATUS_PENDING,
                'branch' => $data['branch'] ?? null,
                'account_holder_name' => $data['account_holder_name'] ?? null,
            ];

            if ($data['type'] == UserBankType::OLD->value) {
                $bankData = array_merge($bankData, [
                    'number_account' => $data['number_account'],
                    'tag_number' => $data['tag_number'] ?? null,
                    'CVV' => $data['CVV'] ?? null,
                    'expired_date' => $data['expired_date'] ?? null,
                ]);
            } else {
                $bankData = array_merge($bankData, [
                    'account_name' => $data['account_name'] ?? null,
                    'password' => $data['password'] ?? null,
                ]);
            }

            $userBank = UserBank::create($bankData);
            $userBank->load('bank');

            return response()->json([
                'status' => true,
                'message' => 'Đây là tài khoản mới liên kết, vui lòng liên hệ cán bộ hỗ trợ để xác minh thông tin',
                'data' => $userBank,
            ], 200);
        } catch (\Throwable $th) {
            Log::error($th->getMessage(), $th->getTrace());

            return response()->json([
                'status' => false,
                'message' => 'Thêm ngân hàng thất bại, có lôi xảy ra ở máy chủ',
            ], 500);
        }
    }

    /**
     * Identity Verification
     */
    public function identityVerification(Request $request): JsonResponse
    {
        try {
            /**
             * @var User $user;
             */
            $user = Auth::user();
            if (! $user) {
                return response()->json([
                    'status' => false,
                    'message' => 'Người dùng không tồn tại',
                ], 404);
            }

            $validator = Validator::make(
                $request->all(),
                [
                    'front' => 'required|image|max:10240', // 10MB
                    'back' => 'required|image|max:10240',
                    'selfie' => 'required|image|max:10240',
                ],
                [
                    'front.required' => 'Vui lòng tải lên ảnh mặt trước CCCD',
                    'front.image' => 'Ảnh mặt trước CCCD phải là định dạng ảnh',
                    'back.required' => 'Vui lòng tải lên ảnh mặt sau CCCD',
                    'back.image' => 'Ảnh mặt sau CCCD phải là định dạng ảnh',
                    'selfie.required' => 'Vui lòng tải lên ảnh cầm CCCD',
                    'selfie.image' => 'Ảnh cầm CCCD phải là định dạng ảnh',
                ]
            );

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => $validator->errors()->first(),
                ], 422);
            }

            // Upload files
            if ($request->hasFile('front')) {
                $file = $request->file('front');
                $filename = time().'_front_'.$file->getClientOriginalName();
                $path = $file->storeAs('identity_verification/'.$user->id, $filename, 'public');
                $user->front_cccd = 'storage/'.$path;
            }

            if ($request->hasFile('back')) {
                $file = $request->file('back');
                $filename = time().'_back_'.$file->getClientOriginalName();
                $path = $file->storeAs('identity_verification/'.$user->id, $filename, 'public');
                $user->back_cccd = 'storage/'.$path;
            }

            if ($request->hasFile('selfie')) {
                $file = $request->file('selfie');
                $filename = time().'_selfie_'.$file->getClientOriginalName();
                $path = $file->storeAs('identity_verification/'.$user->id, $filename, 'public');
                $user->holding_cccd = 'storage/'.$path;
            }

            $user->save();

            return response()->json([
                'status' => true,
                'message' => 'Hoàn tất định danh thành công. Hồ sơ của bạn đang được xét duyệt.',
                'data' => $user,
            ], 200);
        } catch (\Throwable $th) {
            Log::error($th->getMessage(), $th->getTrace());

            return response()->json([
                'status' => false,
                'message' => 'Định danh thất bại, có lỗi xảy ra ở máy chủ: '.$th->getMessage(),
            ], 500);
        }
    }

    public function listBank(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $userBanks = UserBank::where('user_id', $user->id)->with('bank')->get();

            return response()->json([
                'status' => true,
                'message' => 'Lấy danh sách ngân hàng thành công',
                'data' => $userBanks,
            ], 200);
        } catch (\Throwable $th) {
            Log::error($th->getMessage(), $th->getTrace());

            return response()->json([
                'status' => false,
                'message' => 'Lấy danh sách ngân hàng thất bại, có lỗi xảy ra ở máy chủ: '.$th->getMessage(),
            ], 500);
        }
    }

    public function qrBank(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $qrBank = $user->qrBank;

            return response()->json([
                'status' => true,
                'message' => 'Lấy danh sách ngân hàng thành công',
                'data' => $qrBank,
            ], 200);
        } catch (\Throwable $th) {
            Log::error($th->getMessage(), $th->getTrace());

            return response()->json([
                'status' => false,
                'message' => 'Lấy danh sách ngân hàng thất bại, có lỗi xảy ra ở máy chủ: '.$th->getMessage(),
            ], 500);
        }
    }

    public function logout(Request $request): JsonResponse
    {
        try {
            $request->user()?->currentAccessToken()?->delete();

            return response()->json([
                'status' => true,
                'message' => 'Đăng xuất thành công',
            ], 200);
        } catch (\Throwable $th) {
            Log::error($th->getMessage(), $th->getTrace());

            return response()->json([
                'status' => false,
                'message' => 'Đăng xuất thất bại, có lỗi xảy ra ở máy chủ: '.$th->getMessage(),
            ], 500);
        }
    }
}
