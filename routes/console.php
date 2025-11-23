<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;   // ← This was missing

// Keep the default inspire command (optional)
Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// This is the correct way in Laravel 12 — no return closure!
Schedule::command('queue:work database --stop-when-empty --tries=3 --sleep=3 --max-time=60')
    ->everyMinute()
    ->withoutOverlapping(10)   // waits 10 minutes before allowing another run
    ->onOneServer()            // prevents duplicates if you have multiple servers
    ->environments(['production'])
    ->appendOutputTo(storage_path('logs/queue-scheduler.log')); // optional: for debugging