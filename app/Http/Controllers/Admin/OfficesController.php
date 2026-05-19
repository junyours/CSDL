<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OfficesController extends Controller
{
    public function adminOfficeIndex() {
        return Inertia::render('Admin/Offices/Index');
    }
}
