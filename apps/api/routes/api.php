<?php

use App\Http\Controllers\CommonController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\DemoAuthController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;   

Route::get('/user', function (Request $request) {
    return new \App\Http\Resources\UserResource($request->user());
})->middleware('auth:sanctum');

Route::post('/login', [UserController::class, 'login']);
Route::post('/demo/login', [DemoAuthController::class, 'login']);
Route::post('/register', [UserController::class, 'register']);
Route::post('/logout', [UserController::class, 'logout'])->middleware('auth:sanctum');
Route::post('/admin/login', [AdminController::class, 'login']);

Route::get('banks', [CommonController::class, 'banks']);

Route::post('/identity-verification', [UserController::class, 'identityVerification'])->middleware('auth:sanctum');
Route::post('/user/update-profile', [UserController::class, 'updateProfile'])->middleware('auth:sanctum');
Route::post('/user/add-bank', [UserController::class, 'addBank'])->middleware('auth:sanctum');
Route::get('/user/list-bank', [UserController::class, 'listBank'])->middleware('auth:sanctum');
Route::get('/qr-bank', [UserController::class, 'qrBank'])->middleware('auth:sanctum');

Route::prefix('admin')->middleware(['auth:sanctum', 'admin'])->group(function (): void {
    Route::get('/me', [AdminController::class, 'me']);
    Route::get('/stats', [AdminController::class, 'stats']);
    Route::get('/users', [AdminController::class, 'index']);
    Route::post('/users', [AdminController::class, 'store']);
    Route::post('/users/bulk-delete', [AdminController::class, 'bulkDestroy']);
    Route::get('/users/{user}', [AdminController::class, 'show']);
    Route::match(['post', 'patch'], '/users/{user}', [AdminController::class, 'update']);
    Route::delete('/users/{user}', [AdminController::class, 'destroy']);
    Route::post('/users/{user}/approve', [AdminController::class, 'approve']);
    Route::put('/users/{user}/qr-bank', [AdminController::class, 'updateQrBank']);
});
