<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\VerificationController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Doctor\ConsultationController as DoctorConsultationController;
use App\Http\Controllers\Doctor\DashboardController as DoctorDashboardController;
use App\Http\Controllers\Doctor\HistoryController as DoctorHistoryController;
use App\Http\Controllers\Doctor\ProfileController as DoctorProfileController;
use App\Http\Controllers\Farmer\ActivityController;
use App\Http\Controllers\Farmer\ArticleController;
use App\Http\Controllers\Farmer\ConsultationController;
use App\Http\Controllers\Farmer\HomeController;
use App\Http\Controllers\Farmer\MarketplaceController;
use App\Http\Controllers\Farmer\ProfileController;
use App\Http\Controllers\ProfileController as MainProfileController;
use App\Http\Controllers\Shop\DashboardController as ShopDashboardController;
use App\Http\Controllers\Shop\HistoryController as ShopHistoryController;
use App\Http\Controllers\Shop\ProductController;
use App\Http\Controllers\Shop\ProfileController as ShopProfileController;
use App\Http\Controllers\Shop\TransactionController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Halaman utama
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Rute Autentikasi
Route::middleware('guest')->group(function () {
    // Halaman login
    Route::get('/login', [AuthController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);

    // Halaman registrasi
    Route::get('/register', [AuthController::class, 'createFarmer'])->name('register');
    Route::post('/register', [AuthController::class, 'storeFarmer']);
    
    Route::get('/register/doctor', [AuthController::class, 'createDoctor'])->name('register.doctor');
    Route::post('/register/doctor', [AuthController::class, 'storeDoctor']);
    
    Route::get('/register/shop', [AuthController::class, 'createShop'])->name('register.shop');
    Route::post('/register/shop', [AuthController::class, 'storeShop']);
    
    // Password reset
    Route::get('forgot-password', [AuthController::class, 'forgotPassword'])
        ->name('password.request');
    Route::post('forgot-password', [AuthController::class, 'sendResetLink'])
        ->name('password.email');
    Route::get('reset-password/{token}', [AuthController::class, 'resetPassword'])
        ->name('password.reset');
    Route::post('reset-password', [AuthController::class, 'updatePassword'])
        ->name('password.update');
});

// Rute Verifikasi Email
Route::get('/email/verify', [AuthController::class, 'showVerificationNotice'])
    ->middleware('auth')
    ->name('verification.notice');

Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
    ->middleware(['signed', 'throttle:6,1'])
    ->name('verification.verify');

Route::post('/email/verification-notification', [AuthController::class, 'resendVerificationEmail'])
    ->middleware(['auth', 'throttle:6,1'])
    ->name('verification.send');

// Halaman Menunggu Verifikasi Admin
Route::get('/awaiting-verification', [AuthController::class, 'awaitingVerification'])
    ->middleware(['auth', 'verified'])
    ->name('awaiting.verification');

// Logout
Route::post('/logout', [AuthController::class, 'logout'])
    ->middleware('auth')
    ->name('logout');

// Rute yang memerlukan autentikasi
Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard berdasarkan peran
    Route::get('/dashboard', function () {
        $user = Auth::user();
        
        if ($user->role === 'admin') {
            return redirect()->route('admin.dashboard');
        } elseif ($user->role === 'doctor') {
            return redirect()->route('doctor.dashboard');
        } elseif ($user->role === 'shop') {
            return redirect()->route('shop.dashboard');
        } else { // Farmer atau role lainnya
            return redirect()->route('farmer.home');
        }
    })->name('dashboard');
    
    // Profil
    Route::get('/profile', [MainProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [MainProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [MainProfileController::class, 'destroy'])->name('profile.destroy');
});

// Rute admin
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
    
    // Verifikasi Pengguna
    Route::get('/verification', [VerificationController::class, 'index'])->name('verification.index');
    Route::post('/verification/doctor/{id}/approve', [VerificationController::class, 'approveDoctor'])
        ->name('verification.approve.doctor');
    Route::post('/verification/doctor/{id}/reject', [VerificationController::class, 'rejectDoctor'])
        ->name('verification.reject.doctor');
    Route::post('/verification/shop/{id}/approve', [VerificationController::class, 'approveShop'])
        ->name('verification.approve.shop');
    Route::post('/verification/shop/{id}/reject', [VerificationController::class, 'rejectShop'])
        ->name('verification.reject.shop');
        
    // Mengelola User
    Route::patch('/users/{user}/activate', [AdminDashboardController::class, 'activateUser'])->name('users.activate');
    Route::patch('/users/{user}/deactivate', [AdminDashboardController::class, 'deactivateUser'])->name('users.deactivate');
});

// Rute dokter
Route::middleware(['auth', 'role:doctor', 'verified'])->prefix('doctor')->name('doctor.')->group(function () {
    Route::get('/dashboard', [DoctorDashboardController::class, 'index'])->name('dashboard');
    
    // Konsultasi
    Route::resource('consultations', DoctorConsultationController::class);
    Route::patch('/consultations/{consultation}/approve', [DoctorConsultationController::class, 'approve'])->name('consultations.approve');
    Route::patch('/consultations/{consultation}/reject', [DoctorConsultationController::class, 'reject'])->name('consultations.reject');
    Route::patch('/consultations/{consultation}/complete', [DoctorConsultationController::class, 'complete'])->name('consultations.complete');
    Route::get('/consultations/{consultation}/chat', [DoctorConsultationController::class, 'chat'])->name('consultations.chat');
    Route::post('/consultations/{consultation}/chat', [DoctorConsultationController::class, 'sendMessage'])->name('consultations.chat.send');
    
    // Riwayat dan Profil
    Route::get('/history', [DoctorHistoryController::class, 'index'])->name('history');
    Route::get('/profile', [DoctorProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [DoctorProfileController::class, 'update'])->name('profile.update');
});

// Rute toko
Route::middleware(['auth', 'role:shop', 'verified'])->prefix('shop')->name('shop.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Manajemen Produk
    Route::prefix('manageproduct')->name('products.')->group(function () {
        Route::get('/', [ProductController::class, 'index'])->name('index');
        Route::get('/create', [ProductController::class, 'create'])->name('create');
        Route::post('/', [ProductController::class, 'store'])->name('store');
        Route::get('/{product}', [ProductController::class, 'show'])->name('show');
        Route::get('/{product}/edit', [ProductController::class, 'edit'])->name('edit');
        Route::put('/{product}', [ProductController::class, 'update'])->name('update');
        Route::delete('/{product}', [ProductController::class, 'destroy'])->name('destroy');
    });
    
    // Transaksi
    Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions.index');
    Route::get('/transactions/{transaction}', [TransactionController::class, 'show'])->name('transactions.show');
    Route::patch('/transactions/{transaction}/update-status', [TransactionController::class, 'updateStatus'])->name('transactions.update-status');
    
    // Riwayat dan Profil
    Route::get('/history', [ShopHistoryController::class, 'index'])->name('history');
    Route::get('/profile', [ShopProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ShopProfileController::class, 'update'])->name('profile.update');
});

// Rute petani
Route::middleware(['auth', 'role:farmer', 'verified'])->prefix('farmer')->name('farmer.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'farmerDashboard'])->name('dashboard');
    Route::get('/home', [HomeController::class, 'index'])->name('home');
    
    // Konsultasi
    Route::resource('consultations', ConsultationController::class);
    Route::get('/consultations/{consultation}/chat', [ConsultationController::class, 'chat'])->name('consultations.chat');
    Route::post('/consultations/{consultation}/chat', [ConsultationController::class, 'sendMessage'])->name('consultations.chat.send');
    
    // Marketplace
    Route::get('/marketplace', [MarketplaceController::class, 'index'])->name('marketplace');
    Route::get('/marketplace/shops/{shop}', [MarketplaceController::class, 'shopDetail'])->name('marketplace.shop');
    Route::get('/marketplace/products/{product}', [MarketplaceController::class, 'productDetail'])->name('marketplace.product');
    Route::post('/marketplace/cart/add', [MarketplaceController::class, 'addToCart'])->name('marketplace.cart.add');
    Route::get('/marketplace/cart', [MarketplaceController::class, 'viewCart'])->name('marketplace.cart');
    Route::delete('/marketplace/cart/{productId}', [MarketplaceController::class, 'removeFromCart'])->name('marketplace.cart.remove');
    Route::post('/marketplace/checkout', [MarketplaceController::class, 'checkout'])->name('marketplace.checkout');
    
    // Artikel dan Aktivitas
    Route::get('/articles', [ArticleController::class, 'index'])->name('articles');
    Route::get('/articles/{article:slug}', [ArticleController::class, 'show'])->name('articles.show');
    Route::get('/activity', [ActivityController::class, 'index'])->name('activity');
    
    // Profil
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.update-password');
});

require __DIR__ . '/auth.php';