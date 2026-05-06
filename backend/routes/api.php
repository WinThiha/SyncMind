<?php

use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\AIIssueController;
use App\Http\Controllers\MilestoneController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\IssueController;
use App\Http\Controllers\UserSettingsController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::get('/user/settings', [UserSettingsController::class, 'show']);
    Route::put('/user/settings', [UserSettingsController::class, 'update']);
    Route::put('/user/settings/password', [UserSettingsController::class, 'updatePassword'])->middleware('throttle:password-update');

    Route::apiResource('projects', ProjectController::class);
    Route::post('projects/{project}/transfer', [ProjectController::class, 'transferOwnership']);
    Route::apiResource('projects.members', \App\Http\Controllers\ProjectMemberController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::apiResource('projects.issues', IssueController::class);
    Route::apiResource('projects.milestones', MilestoneController::class);
    Route::post('projects/{project}/issues/{issue_key}/comments', [\App\Http\Controllers\CommentController::class, 'store']);
    Route::post('projects/{project}/issues/{issue_key}/ai/summarize', [AIIssueController::class, 'summarize']);
    Route::post('projects/{project}/ai/suggest-issue', [AIIssueController::class, 'suggest']);
    Route::get('projects/{project}/ai/similar-issues', [AIIssueController::class, 'similar']);
});

Route::prefix('auth')->group(function () {
    Route::post('/register', [RegisterController::class, 'register'])->middleware('throttle:auth');
    Route::post('/login', [LoginController::class, 'login'])->middleware('throttle:auth');
    Route::post('/logout', [LoginController::class, 'logout'])->middleware('auth:sanctum');
    Route::post('/google/callback', [GoogleAuthController::class, 'callback'])->middleware('throttle:auth');

    Route::get('/verify-email/{id}/{hash}', VerifyEmailController::class)
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');

    Route::post('/email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
        ->middleware(['auth:sanctum', 'throttle:6,1'])
        ->name('verification.send');
});
