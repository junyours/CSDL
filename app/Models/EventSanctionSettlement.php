<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventSanctionSettlement extends Model
{
    protected $fillable = [
        'transaction_code',
        'event_id',
        'user_id_no',
        'sanction_id',
        'settlement_type',
        'amount_paid',
        'service_completed',
        'service_time_type',
        'settlement_logged_by',
        'status',
        'remarks',
        'transaction_date_time',
        'is_void'
    ];

    public function sanction()
    {
        return $this->belongsTo(Sanction::class);
    }

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function loggedBy()
    {
        return $this->belongsTo(UserStudentCouncil::class, 'settlement_logged_by');
    }
}
