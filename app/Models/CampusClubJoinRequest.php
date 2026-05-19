<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CampusClubJoinRequest extends Model
{
    protected $fillable = [
        'club_id',
        'user_id',
        'status',
        'message',
    ];

    public function club()
    {
        return $this->belongsTo(CampusClub::class, 'club_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
