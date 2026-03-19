<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BootstrapController;
use App\Http\Controllers\Api\CustomersController;
use App\Http\Controllers\Api\LicenseController;
use App\Http\Controllers\Api\OrdersController;
use App\Http\Controllers\Api\ServicesController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\UsersController;
use App\Http\Controllers\Api\Admin\AdminAuthController;
use App\Http\Controllers\Api\Admin\AuditLogController;
use App\Http\Controllers\Api\Admin\CompanyManagementController;
use App\Http\Controllers\Api\Admin\ImpersonationController;
use App\Http\Controllers\Api\Admin\UserManagementController;
use App\Http\Controllers\Api\Support\MessageController as SupportMessageController;
use App\Http\Controllers\Api\Support\TicketController as SupportTicketController;
use Illuminate\Support\Facades\Route;

Route::get('/bootstrap', [BootstrapController::class, 'index']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::post('/settings/register', [SettingsController::class, 'register']);
Route::get('/settings', [SettingsController::class, 'show']);
Route::put('/settings', [SettingsController::class, 'update']);

Route::get('/users', [UsersController::class, 'index']);
Route::post('/users', [UsersController::class, 'store']);
Route::put('/users/{id}', [UsersController::class, 'update']);
Route::delete('/users/{id}', [UsersController::class, 'destroy']);

Route::post('/customers', [CustomersController::class, 'store']);
Route::put('/customers/{id}', [CustomersController::class, 'update']);
Route::delete('/customers/{id}', [CustomersController::class, 'destroy']);

Route::post('/services', [ServicesController::class, 'store']);
Route::put('/services/{id}', [ServicesController::class, 'update']);
Route::delete('/services/{id}', [ServicesController::class, 'destroy']);

Route::post('/orders', [OrdersController::class, 'store']);
Route::put('/orders/{id}', [OrdersController::class, 'update']);
Route::patch('/orders/{id}/status', [OrdersController::class, 'updateStatus']);
Route::delete('/orders/{id}', [OrdersController::class, 'destroy']);

Route::prefix('admin')->group(function () {
    Route::post('/auth/login', [AdminAuthController::class, 'login']);
});

Route::middleware(['support.actor'])->group(function () {
    Route::get('/license/check', [LicenseController::class, 'check']);

    Route::middleware(['license.valid'])->group(function () {
        Route::post('/support/tickets', [SupportTicketController::class, 'store']);
        Route::get('/support/tickets', [SupportTicketController::class, 'index']);
        Route::get('/support/tickets/{id}', [SupportTicketController::class, 'show']);
        Route::post('/support/messages', [SupportMessageController::class, 'store']);
    });

    Route::prefix('admin')->middleware(['platform.role:super_admin,support'])->group(function () {
        Route::get('/companies', [CompanyManagementController::class, 'index']);
        Route::post('/companies/{id}/suspend', [CompanyManagementController::class, 'suspend']);

        Route::get('/users', [UserManagementController::class, 'index']);
        Route::post('/users/{id}/block', [UserManagementController::class, 'block']);
        Route::post('/users/{id}/reset-password', [UserManagementController::class, 'resetPassword']);

        Route::post('/impersonate/{user_id}', [ImpersonationController::class, 'create']);
        Route::get('/audit-logs', [AuditLogController::class, 'index']);
    });
});
