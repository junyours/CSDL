<?php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use App\Models\UserInformation;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'user_id_no',
        'password',
        'user_role',
        'face_enrolled',
        'profile_photo',
        'remember_token',
    ];

    protected $hidden = [
        'password'
    ];

    public function isSuperAdmin()
    {
        return $this->user_role === 'super_admin';
    }

    public function isAdmin()
    {
        return $this->user_role === 'admin';
    }
    public function isSecurity()
    {
        return $this->user_role === 'security';
    }
    public function isStudent()
    {
        return $this->user_role === 'student';
    }

    public function setUserIdNoAttribute($value)
    {
        $this->attributes['user_id_no'] = strtoupper($value);
    }

    public function information()
    {
        return $this->hasOne(UserInformation::class, 'user_id_no', 'user_id_no');
    }
}
