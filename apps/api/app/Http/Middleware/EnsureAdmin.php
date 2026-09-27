<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->isAdmin()) {
            return response()->json([
                'status' => false,
                'message' => 'Bạn không có quyền truy cập khu vực quản trị.',
            ], 403);
        }

        return $next($request);
    }
}
