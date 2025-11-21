<?php

use App\Http\Controllers\ApiEnrollmentSystemController;
use App\Http\Controllers\AttendanceAnomalyController;
use App\Http\Controllers\EventAttendanceController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\EventSanctionSettlementController;
use App\Http\Controllers\PostAnnouncementController;
use App\Http\Controllers\SanctionController;
use App\Http\Controllers\UserFaceController;
use App\Http\Controllers\UserStudentCouncilController;
use App\Http\Controllers\ViolationController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserInformationController;
use App\Http\Controllers\LocationController;

Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/face-enrolled', [AuthController::class, 'updateFaceEnrolled']);
    Route::post('/update-profile-photo', [AuthController::class, 'updateProfilePhoto']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    Route::post('/create-user', [UserInformationController::class, 'store']);
    Route::get('/user-info/{user_id_no}', [UserInformationController::class, 'show']);
    Route::get('/school-structure-api', [UserInformationController::class, 'fetchSchoolStructureAPI']);
    Route::get('/students-api', [UserInformationController::class, 'fetchAllStudentAPI']);
    Route::get('/student-enrollment-api', [UserInformationController::class, 'getStudentEnrollmentAPI']);
    Route::get('/count-student-users', [UserInformationController::class, 'countStudentUsers']);

    // Sanction routes
    Route::get('/sanctions', [SanctionController::class, 'index']);
    Route::post('/sanctions', [SanctionController::class, 'store']);
    Route::patch('/sanctions/{sanction}/status', [SanctionController::class, 'edit']);
    Route::patch('/sanctions/{sanction}', [SanctionController::class, 'update']);

    Route::get('/locations', [LocationController::class, 'index']);
    Route::post('/locations', [LocationController::class, 'store']);
    Route::put('/locations/{location}', [LocationController::class, 'destroy']);

    Route::get('/violations', [ViolationController::class, 'index']);
    Route::post('/violations', [ViolationController::class, 'store']);
    Route::put('/violations/{violation}', [ViolationController::class, 'update']);
    Route::delete('/violations/{violation}', [ViolationController::class, 'destroy']);

    Route::get('/events', [EventController::class, 'index']);
    Route::post('/events', [EventController::class, 'store']);
    Route::get('/my-events', [EventController::class, 'getStudentEventsAPI']);
    Route::get('/event-participants/{id}', [EventController::class, 'getEventParticipants']);


    // Route::get('/announcements', [PostAnnouncementController::class, 'index']);
    // Route::post('/announcements', [PostAnnouncementController::class, 'store']);
    // Route::put('/announcements/{postAnnouncement}', [PostAnnouncementController::class, 'update']);
    // Route::delete('/announcements/{postAnnouncement}', [PostAnnouncementController::class, 'destroy']);

    Route::get('/es-school-years', [ApiEnrollmentSystemController::class, 'fetchSchoolYears']);
    Route::get('/es-enrolled-students', [ApiEnrollmentSystemController::class, 'fetchEnrolledStudents']);

    Route::post('/user-faces', [UserFaceController::class, 'store']);
    Route::get('/user-faces', [UserFaceController::class, 'index']);

    Route::post('/event-attendances', [EventAttendanceController::class, 'store']);
    Route::get('/event-attendances', [EventAttendanceController::class, 'index']);
    Route::get('/student-sanctions', [EventAttendanceController::class, 'getStudentSanctionsAPI']);

    Route::get('/event-sanction-settlements', [EventSanctionSettlementController::class, 'index']);
    Route::post('/event-sanction-settlements', [EventSanctionSettlementController::class, 'store']);
    Route::post('/event-sanction-settlements/update', [EventSanctionSettlementController::class, 'update']);

    Route::get('/user-student-councils', [UserStudentCouncilController::class, 'index']);
    Route::post('/user-student-councils', [UserStudentCouncilController::class, 'store']);
    Route::get('/search-user', [UserStudentCouncilController::class, 'searchUsers']);
    Route::delete('/user-student-councils/{id}', [UserStudentCouncilController::class, 'destroy']);
    Route::get('/check-student-council', [UserStudentCouncilController::class, 'checkMembership']);


    // other protected APIs...
});
