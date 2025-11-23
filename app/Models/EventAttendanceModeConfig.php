<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventAttendanceModeConfig extends Model
{
    protected $fillable = [
        'is_strict_mode',
    ];
}
