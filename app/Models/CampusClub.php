<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CampusClub extends Model
{
    protected $fillable = [
        'club_name',
        'club_logo_path',
        'club_cbl_file_path',
        'status'
    ];

    public function members()
    {
        return $this->hasMany(CampusClubUser::class, 'club_id');
    }

    public function joinRequests()
    {
        return $this->hasMany(CampusClubJoinRequest::class, 'club_id');
    }
}
