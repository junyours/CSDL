<?php

namespace App\Providers;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Inertia::share([
            'auth' => function () {
                return [
                    'user' => Auth::user() ? [
                        'id' => Auth::user()->id,
                        'user_id_no' => Auth::user()->user_id_no,
                        'user_role' => Auth::user()->user_role,
                        'profile_photo' => Auth::user()->profile_photo,
                    ] : null,
                ];
            },
            'flash' => function () {
                return [
                    'success' => session('success'),
                    'error' => session('error'),
                ];
            },

            // Add APK info here
            'apkInfo' => function () {
                $apkPath = storage_path('app/public/apk');
                $latestApk = null;
                $version = 'Latest';

                if (is_dir($apkPath)) {
                    $files = File::files($apkPath);
                    usort($files, fn($a, $b) => $b->getMTime() <=> $a->getMTime());
                    $latestApk = $files[0] ?? null;

                    if ($latestApk && preg_match('/[vV]?([\d\.]+)\.apk$/i', $latestApk->getFilename(), $matches)) {
                        $version = 'v' . $matches[1];
                    }
                }

                $apkUrl = $latestApk ? asset('storage/apk/' . $latestApk->getFilename()) : '#';

                return [
                    'apkUrl' => $apkUrl,
                    'version' => $version,
                ];
            },
        ]);
    }
}
