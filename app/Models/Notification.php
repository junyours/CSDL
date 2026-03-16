<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'courses_id', //nullable
        'year_levels_id', //nullable
        'notifiable_type',
        'data',
        'created_at',
    ];

    protected $casts = [
        'courses_id' => 'array',
        'year_levels_id' => 'array',
    ];

    public $timestamps = false;
}
