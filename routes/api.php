
<?php

use Illuminate\Support\Facades\Route;

Route::prefix('admin')->middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/dashboard/stats', [App\Http\Controllers\Admin\DashboardController::class, 'getStats']);
    Route::get('/users/pending', [App\Http\Controllers\Admin\DashboardController::class, 'getPendingUsers']);
    Route::get('/users/farmers', [App\Http\Controllers\Admin\DashboardController::class, 'getFarmers']);
    Route::get('/users/doctors', [App\Http\Controllers\Admin\DashboardController::class, 'getDoctors']);
    Route::get('/users/shops', [App\Http\Controllers\Admin\DashboardController::class, 'getShops']);
    Route::post('/users/{id}/approve', [App\Http\Controllers\Admin\DashboardController::class, 'approveUser']);
    Route::post('/users/{id}/suspend', [App\Http\Controllers\Admin\DashboardController::class, 'suspendUser']);
});

