<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CampusClubUser extends Model
{
    protected $fillable = [
        'club_id',
        'user_id',
        'position',
        'is_admin',
        'is_active'
    ];
    protected $casts = [
        'is_admin' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function club()
    {
        return $this->belongsTo(CampusClub::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
