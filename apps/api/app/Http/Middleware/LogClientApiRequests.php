<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

class LogClientApiRequests
{
    private const SENSITIVE_FIELDS = [
        'password',
        'password_confirmation',
        'token',
        'access_token',
        'cvv',
        'expired_date',
        'front',
        'back',
        'selfie',
        'front_cccd',
        'back_cccd',
        'holding_cccd',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        if ($request->is('api/admin/*')) {
            return $next($request);
        }

        $requestId = (string) Str::uuid();
        $startedAt = microtime(true);
        $request->attributes->set('request_id', $requestId);

        Log::info('client_api.request.started', $this->context($request, [
            'request_id' => $requestId,
            'input' => $this->safeInput($request),
        ]));

        try {
            $response = $next($request);
        } catch (Throwable $exception) {
            $context = $this->context($request, [
                'request_id' => $requestId,
                'duration_ms' => $this->duration($startedAt),
                'exception' => $exception,
            ]);

            if ($this->isClientError($exception)) {
                Log::warning('client_api.request.exception', $context);
            } else {
                Log::error('client_api.request.exception', $context);
            }

            throw $exception;
        }

        $status = $response->getStatusCode();
        $context = $this->context($request, [
            'request_id' => $requestId,
            'status' => $status,
            'duration_ms' => $this->duration($startedAt),
        ]);

        if ($status >= 500) {
            Log::error('client_api.request.failed', $context);
        } elseif ($status >= 400) {
            Log::warning('client_api.request.rejected', $context);
        } else {
            Log::info('client_api.request.completed', $context);
        }

        $response->headers->set('X-Request-Id', $requestId);

        return $response;
    }

    /** @return array<string, mixed> */
    private function context(Request $request, array $extra = []): array
    {
        return array_merge([
            'method' => $request->method(),
            'path' => $request->path(),
            'route' => $request->route()?->getName(),
            'user_id' => $request->user()?->getAuthIdentifier(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ], $extra);
    }

    /** @return array<string, mixed> */
    private function safeInput(Request $request): array
    {
        $input = $request->except(self::SENSITIVE_FIELDS);

        foreach ($request->allFiles() as $key => $file) {
            unset($input[$key]);
            $input[$key] = [
                'uploaded' => true,
                'name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'mime' => $file->getMimeType(),
            ];
        }

        return $this->redact($input);
    }

    private function redact(mixed $value): mixed
    {
        if (! is_array($value)) {
            return $value;
        }

        $redacted = [];
        foreach ($value as $key => $item) {
            $redacted[$key] = in_array(strtolower((string) $key), self::SENSITIVE_FIELDS, true)
                ? '[REDACTED]'
                : $this->redact($item);
        }

        return $redacted;
    }

    private function duration(float $startedAt): float
    {
        return round((microtime(true) - $startedAt) * 1000, 2);
    }

    private function isClientError(Throwable $exception): bool
    {
        return $exception instanceof ValidationException
            || $exception instanceof AuthenticationException
            || $exception instanceof AuthorizationException
            || ($exception instanceof HttpExceptionInterface && $exception->getStatusCode() < 500);
    }
}
