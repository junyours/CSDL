<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class SendUserCredentialsMail extends Mailable
{
    use SerializesModels;

    public $userName;
    public $userId;
    public $password;
    public $appLink;

    public function __construct($userId, $userName, $password, $appLink)
    {
        $this->userName = $userName;
        $this->userId = $userId;
        $this->password = $password;
        $this->appLink = $appLink;
    }

    public function build()
    {
        return $this->subject('MyOCC Login')
            ->view('emails.user-credentials');
    }
}
