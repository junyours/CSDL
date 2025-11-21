<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $fillable = [
        'school_year_id',
        'event_name',
        'location_id',
        'event_date',
        'attendance_type',
        'start_time',
        'end_time',
        'attendance_duration',
        'first_start_time',
        'first_end_time',
        'second_start_time',
        'second_end_time',
        'participant_course_id',
        'participant_year_level_id',
        'sanction_id',
        'is_cancelled',
        'status',
    ];

    protected $casts = [
        'participant_course_id' => 'array',
        'participant_year_level_id' => 'array',
    ];

    // Relation to Location
    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    // Relation to Sanction
    public function sanction()
    {
        return $this->belongsTo(Sanction::class);
    }

    public function attendances()
    {
        return $this->hasMany(EventAttendance::class);
    }

    public function sanctionSettlements()
    {
        return $this->hasMany(EventSanctionSettlement::class, 'event_id', 'id');
    }

}
