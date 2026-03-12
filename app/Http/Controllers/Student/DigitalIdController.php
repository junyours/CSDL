<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\UserInformation;
use App\Models\UserViolationRecord;
use App\Services\SisApiService;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DigitalIDController extends Controller
{
    public function index(SisApiService $sisApi)
    {
        $user = auth()->user();
        $studentData = null;
        $userInfoData = null;
        $userCreatedAt = $user->created_at ? $user->created_at->format('Y-m-d') : null;

        if ($user->user_role === 'student') {

            $studentData = $this->fetchStudentData($user->user_id_no, $sisApi);

        } else {

            $userInfoData = UserInformation::where('user_id_no', $user->user_id_no)
                ->select([
                    'first_name',
                    'middle_name',
                    'last_name',
                    'email_address',
                ])
                ->first();
        }

        return Inertia::render('Student/DigitalID/Index', [
            'studentData' => $studentData,
            'userInfoData' => $userInfoData,
            'userCreatedAt' => $userCreatedAt,
        ]);

    }

    private function fetchStudentData($userIdNo, SisApiService $sisApi)
    {
        $query = http_build_query([
            'user_id_no' => [$userIdNo]
        ]);

        $response = $sisApi->get("/api/student-enrollment?{$query}");

        if (!$response->ok()) {
            return null;
        }

        $student = collect($response->json())->first();

        if (!$student) {
            return null;
        }

        return [
            'first_name' => $student['first_name'] ?? null,
            'middle_name' => $student['middle_name'] ?? null,
            'last_name' => $student['last_name'] ?? null,
            'gender' => $student['gender'] ?? null,
            'birthday' => $student['birthday'] ?? null,
            'email_address' => $student['email_address'] ?? null,
            'contact_number' => $student['contact_number'] ?? null,
            'present_address' => $student['present_address'] ?? null,
            'zip_code' => $student['zip_code'] ?? null,
        ];
    }

    public function download()
    {
        $user = Auth::user();

        $data = [
            'userIdNo' => $user->user_id_no,
            'user' => $user
        ];

        $pdf = Pdf::loadView('pdf.digital-id', $data)
            ->setPaper('a4');

        return $pdf->stream('digital-id.pdf');
    }
}