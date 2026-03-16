<?php

namespace App\Http\Controllers\Security;

use App\Http\Controllers\Controller;
use App\Models\UserViolationRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $today = Carbon::today();

        $totalIssuedTicketToday = UserViolationRecord::where('issued_by', Auth::id())
            ->whereDate('issued_date_time', $today)
            ->count();

        $userInformation = Auth::user()->information;

        return Inertia::render('Security/Dashboard/Index', [
            'totalIssuedTicketToday' => $totalIssuedTicketToday,
            'userInformation' => $userInformation,
        ]);
    }
}
