<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Exception;

class SisApiService
{
    protected string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = config('services.sis.url');
    }

    public function getToken(): string
    {
        return Cache::remember('sis_api_token', now()->addHours(23), function () {
            $response = Http::post(
                $this->baseUrl . '/api/csg-attendance/login',
                [
                    'user_id_no' => config('services.sis.user_id'),
                    'password' => config('services.sis.password'),
                ]
            );

            if (!$response->ok()) {
                throw new Exception('Failed to login to SIS API');
            }

            return $response->json('token');
        });
    }

    public function get(string $endpoint)
    {
        return Http::withToken($this->getToken())
            ->get($this->baseUrl . $endpoint);
    }
}
