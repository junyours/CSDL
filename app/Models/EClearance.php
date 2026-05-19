<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EClearance extends Model
{
    protected $fillable = [
        'school_year_id',
        'is_active',
        'is_deleted',
    ];
}
