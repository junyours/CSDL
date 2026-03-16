<?php

namespace App\Events;

use App\Models\UserViolationRecord;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Queue\SerializesModels;

class ViolationIssued implements ShouldBroadcastNow
{
    use SerializesModels;

    public $record;

    public function __construct(UserViolationRecord $record)
    {
        $this->record = $record;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('violations'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'violation.issued';
    }
}