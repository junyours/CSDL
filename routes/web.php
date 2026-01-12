<?php

use App\Http\Controllers\Admin\EventController;
use App\Http\Controllers\Admin\LocationController;
use App\Http\Controllers\Admin\SanctionController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\ViolationController;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use App\Http\Controllers\Auth\LoginController;

// PUBLIC
Route::get('/login', [LoginController::class, 'show'])->name('login');
Route::post('/login', [LoginController::class, 'login'])->name('login.attempt');

// AUTH ONLY
Route::middleware(['auth'])->group(function () {

    Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

    // ADMIN AREA
    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/dashboard', function () {
            return Inertia::render('Admin/Dashboard');
        })->name('admin.dashboard');

        Route::get('/setup-violation', [ViolationController::class, 'index'])->name('setup.violation.index');
        Route::get('/setup/violation/create', [ViolationController::class, 'create'])->name('setup.violation.create');
        Route::post('/setup/violation', [ViolationController::class, 'store'])->name('setup.violation.store');
        Route::patch('/setup/violation/{violation}', [ViolationController::class, 'update'])->name('setup.violation.update');

        Route::get('/setup-sanction', [SanctionController::class, 'index'])->name('setup.sanction.index');
        Route::post('/setup/sanction/store', [SanctionController::class, 'store'])->name('setup.sanction.store');
        Route::patch('/setup/sanction/{sanction}', [SanctionController::class, 'update'])->name('setup.sanction.update');

        Route::get('/setup-location', [LocationController::class, 'index'])->name('setup.location.index');
        Route::post('/setup/location/store', [LocationController::class, 'store'])->name('setup.location.store');
        Route::patch('/setup/location/{id}/move-to-bin', [LocationController::class, 'moveToBin']);

        Route::get('/manage-event', [EventController::class, 'index'])->name('manage.event.index');
        Route::get('/event/create', [EventController::class, 'create'])->name('manage.event.create');
        Route::post('/event/store', [EventController::class, 'store'])->name('manage.event.store');
        Route::get('/event/{event}/edit', [EventController::class, 'edit'])->name('manage.event.edit');
        Route::put('/event/{event}', [EventController::class, 'update'])->name('manage.event.update');

        Route::get('/manage-user', [UserController::class, 'index'])->name('manage.user.index');

    });

    // SECURITY AREA
    Route::middleware('role:security')->group(function () {
        Route::get('/security/dashboard', function () {
            return Inertia::render('Security/Dashboard');
        })->name('security.dashboard');
    });

    // STUDENT AREA
    Route::middleware('role:student')->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('Student/Dashboard');
        })->name('student.dashboard');
    });

});

// Route::get('/', function () {
//     return view('welcome');
// });

Route::get('/', function () {
    return Inertia::render('WelcomePage'); // Matches resources/js/WelcomePage.jsx
});

Route::get('/open-app', function (Request $request) {
    $userId = $request->query('user_id_no');
    $deepLink = "myapp://login?user_id_no={$userId}";
    $playStoreUrl = "https://myocc.fun/";

    return <<<HTML
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8" />
        <title>MyOCC App</title>
    </head>
    <body>
        <script>
            // Try to open the app
            window.location = "{$deepLink}";

            // If not installed, fallback to Play Store after 2 seconds
            setTimeout(() => {
                window.location = "{$playStoreUrl}";
            }, 2000);
        </script>
        <p>If the app doesn't open automatically, <a href="{$playStoreUrl}">click here to open Play Store</a>.</p>
    </body>
    </html>
    HTML;
});


// Route::get('/web-login', [AuthController::class, 'showLoginForm'])->name('login');
// Route::post('/web-login', [AuthController::class, 'loginWeb'])->name('login.post');
// Route::post('/web-logout', [AuthController::class, 'logoutWeb'])->name('logout');

// Route::middleware('auth')->group(function () {
//     Route::get('/dashboard', [AuthController::class, 'dashboard'])->name('dashboard');

//     // List of events
//     Route::get('/dashboard/events', [EventController::class, 'indexWeb'])->name('dashboard.events');

//     // Manage specific event
//     Route::get('/dashboard/events/{id}', [EventController::class, 'showWeb'])->name('dashboard.events.show');

//     Route::get('/attendance/search', [EventAttendanceController::class, 'showMyEventAttendanceWeb'])
//         ->name('attendance.search');


//     Route::get('/qr-scanner', function () {
//         return view('qr-scanner');
//     })->name('qr.scanner');
// });

view()->composer('*', function ($view) {
    $apkPath = storage_path('app/public/apk');
    $latestApk = null;
    $version = 'Latest';

    if (is_dir($apkPath)) {
        $files = File::files($apkPath);
        // Sort by modified time DESC and get the newest one
        usort($files, fn($a, $b) => $b->getMTime() <=> $a->getMTime());
        $latestApk = $files[0] ?? null;

        if ($latestApk) {
            // Extract version from filename (supports: myOCC-v1.2.3.apk, app-v9.0.apk, etc.)
            if (preg_match('/[vV]?([\d\.]+)\.apk$/i', $latestApk->getFilename(), $matches)) {
                $version = 'v' . $matches[1];
            }
        }
    }

    $apkUrl = $latestApk ? asset('storage/apk/' . $latestApk->getFilename()) : '#';

    $view->with(compact('apkUrl', 'version'));
});


Route::get('/download-apk', function () {
    $apkPath = storage_path('app/public/apk');
    $files = File::files($apkPath);

    usort($files, fn($a, $b) => $b->getMTime() <=> $a->getMTime());
    $latest = $files[0] ?? null;

    if (!$latest) {
        abort(404);
    }

    return response()->download($latest->getRealPath(), $latest->getFilename());
});

