<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\ArticleController as AdminArticleController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
// use App\Http\Controllers\AuthenticatedSessionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Doctor\ConsultationController as DoctorConsultationController;
use App\Http\Controllers\Doctor\DashboardController as DoctorDashboardController;
use App\Http\Controllers\Doctor\HistoryController as DoctorHistoryController;
use App\Http\Controllers\Doctor\ProfileController as DoctorProfileController;
use App\Http\Controllers\Farmer\ActivityController;
use App\Http\Controllers\Farmer\ArticleController as FarmerArticleController;
use App\Http\Controllers\Farmer\ConsultationController;
use App\Http\Controllers\Farmer\HomeController;
use App\Http\Controllers\Farmer\MarketplaceController;
use App\Http\Controllers\Farmer\ProfileController;
use App\Http\Controllers\Farmer\TransactionController as FarmerTransactionController;
use App\Http\Controllers\ProfileController as MainProfileController;
use App\Http\Controllers\Shop\DashboardController as ShopDashboardController;
use App\Http\Controllers\Shop\HistoryController as ShopHistoryController;
use App\Http\Controllers\Shop\ProductController;
use App\Http\Controllers\Shop\ProfileController as ShopProfileController;
use App\Http\Controllers\Shop\TransactionController;
use App\Http\Controllers\PaymentController;
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
    Route::get('/login', [AuthenticatedSessionController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'login']);

    // Halaman registrasi
    Route::get('/register', [AuthenticatedSessionController::class, 'createFarmer'])->name('register');
    Route::post('/register', [AuthenticatedSessionController::class, 'storeFarmer']);

    Route::get('/register/doctor', [AuthenticatedSessionController::class, 'createDoctor'])->name('register.doctor');
    Route::post('/register/doctor', [AuthenticatedSessionController::class, 'storeDoctor']);

    Route::get('/register/shop', [AuthenticatedSessionController::class, 'createShop'])->name('register.shop');
    Route::post('/register/shop', [AuthenticatedSessionController::class, 'storeShop']);

    // Password reset
    Route::get('forgot-password', [AuthenticatedSessionController::class, 'forgotPassword'])
        ->name('password.request');
    Route::post('forgot-password', [AuthenticatedSessionController::class, 'sendResetLink'])
        ->name('password.email');
    Route::get('reset-password/{token}', [AuthenticatedSessionController::class, 'resetPassword'])
        ->name('password.reset');
    Route::post('reset-password', [AuthenticatedSessionController::class, 'updatePassword'])
        ->name('password.update');
});

// Rute Verifikasi Email
Route::get('/email/verify', [AuthenticatedSessionController::class, 'showVerificationNotice'])
    ->middleware('auth')
    ->name('verification.notice');

Route::get('/email/verify/{id}/{hash}', [AuthenticatedSessionController::class, 'verifyEmail'])
    ->middleware(['signed', 'throttle:6,1'])
    ->name('verification.verify');

Route::post('/email/verification-notification', [AuthenticatedSessionController::class, 'resendVerificationEmail'])
    ->middleware(['auth', 'throttle:6,1'])
    ->name('verification.send');

// Halaman Menunggu Verifikasi Admin
Route::get('/awaiting-verification', [AuthenticatedSessionController::class, 'awaitingVerification'])
    ->middleware(['auth', 'verified'])
    ->name('awaiting.verification');

// Logout
Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
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
// Admin routes
Route::middleware(['auth', 'admin'])->prefix('admin')->group(function () {
    // Dashboard view
    Route::get('/dashboard', [AdminDashboardController::class, 'dashboard'])->name('admin.dashboard');


    // API endpoints for admin dashboard
    Route::get('/dashboard/stats', [AdminDashboardController::class, 'getStats']);
    Route::get('/users/pending', [AdminDashboardController::class, 'getPendingUsers']);
    Route::get('/users/farmers', [AdminDashboardController::class, 'getFarmers']);
    Route::get('/users/doctors', [AdminDashboardController::class, 'getDoctors']);
    Route::get('/users/shops', [AdminDashboardController::class, 'getShops']);

    // Detail & action
    Route::get('/users/{id}', [AdminDashboardController::class, 'userDetail'])->name('admin.user.detail');
    Route::post('/users/{id}/approve', [AdminDashboardController::class, 'approveUser']);
    Route::post('/users/{id}/reject', [AdminDashboardController::class, 'rejectUser']);

    // ✅ Taruh di sini saja agar rapi
    Route::post('/users/{id}/toggle-status', [AdminDashboardController::class, 'toggleActive'])
        ->name('admin.users.toggle-status');

    // Article management routes
    Route::resource('articles', AdminArticleController::class)->names('admin.articles');
    Route::put('articles/{article}/toggle-featured', [AdminArticleController::class, 'toggleFeatured'])->name('admin.articles.toggle-featured');
    Route::put('articles/{article}/toggle-published', [AdminArticleController::class, 'togglePublished'])->name('admin.articles.toggle-published');
});


// Rute dokter
Route::middleware(['auth', 'role:doctor', 'verified'])->prefix('doctor')->name('doctor.')->group(function () {
    // Dashboard
    Route::get('/dashboard', [DoctorDashboardController::class, 'index'])->name('dashboard');
    Route::post('/consultations/{id}/accept', [DoctorDashboardController::class, 'accept'])->name('consultations.accept');
    Route::post('/consultations/{id}/decline', [DoctorDashboardController::class, 'decline'])->name('consultations.decline');

    // Konsultasi
    Route::post('/consultations/filter-by-type', [DoctorConsultationController::class, 'filterByType'])->name('consultations.filter.type');
    Route::resource('consultations', DoctorConsultationController::class);
    Route::patch('/consultations/{consultation}/approve', [DoctorConsultationController::class, 'approve'])->name('consultations.approve');
    Route::patch('/consultations/{consultation}/reject', [DoctorConsultationController::class, 'reject'])->name('consultations.reject');
    Route::patch('/consultations/{consultation}/complete', [DoctorConsultationController::class, 'complete'])->name('consultations.complete');
    Route::get('/consultations/{consultation}/chat', [DoctorConsultationController::class, 'chat'])->name('consultations.chat');
    Route::post('/consultations/{consultation}/chat', [DoctorConsultationController::class, 'sendMessage'])->name('consultations.chat.send');

    // Riwayat dan Profil
    Route::get('/history', [DoctorHistoryController::class, 'index'])->name('history');
    Route::get('/profile', [DoctorProfileController::class, 'edit'])->name('profile.edit');
    Route::post('/profile', [DoctorProfileController::class, 'update'])->name('profile.update');
    Route::post('/password/update', [DoctorProfileController::class, 'updatePassword'])->name('password.update');
    Route::post('/settings/update', [DoctorProfileController::class, 'updateSettings'])->name('settings.update');
    Route::get('/history/{consultation}', [DoctorHistoryController::class, 'show'])->name('history.show');
    Route::get('/history/export', [DoctorHistoryController::class, 'export'])->name('export');

});

// Rute toko
Route::middleware(['auth', 'role:shop', 'verified'])->prefix('shop')->name('shop.')->group(function () {
    Route::get('/dashboard', [ShopDashboardController::class, 'index'])->name('dashboard');

    // Manajemen Produk
    Route::get('/manageproduct', [ProductController::class, 'index'])->name('manage-products.index');
    Route::post('/products', [ProductController::class, 'store'])->name('manage-products.store');
    Route::get('/products/create', [ProductController::class, 'create'])->name('manage-products.create');
    Route::get('/products/{product}/edit', [ProductController::class, 'edit'])->name('manage-products.edit');
    Route::put('/products/{product}', [ProductController::class, 'update'])->name('manage-products.update');
    Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('manage-products.destroy');
    Route::put('/products/{product}/stock', [ProductController::class, 'updateStock'])->name('manage-products.update-stock');
    Route::put('/products/{product}/toggle-active', [ProductController::class, 'toggleActive'])->name('manage-products.toggle-active');


    // Transaksi
    Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions.index');
    Route::get('/transactions/{transaction}', [TransactionController::class, 'show'])->name('transactions.show');
    Route::post('/transactions/{transaction}/update-status', [TransactionController::class, 'updateStatus'])->name('transactions.update-status');

    // Riwayat dan Profil
    Route::get('/history', [ShopHistoryController::class, 'index'])->name('history');
    Route::get('/history/{id}', [ShopHistoryController::class, 'show'])->name('history.show');

    // Route::get('/profile', [ShopProfileController::class, 'edit'])->name('profile.edit');
    // Route::patch('/profile', [ShopProfileController::class, 'update'])->name('profile.update');

    Route::get('/profile', [ShopProfileController::class, 'show'])->name('profile');
    Route::post('/profile/update', [ShopProfileController::class, 'update'])->name('profile.update');
    Route::post('/password/update', [ShopProfileController::class, 'updatePassword'])->name('password.update');

});

//Peternak
Route::middleware(['auth', 'role:farmer', 'verified'])->prefix('farmer')->name('farmer.')->group(function () {
    // Dashboard dan Home
    Route::get('/home', [HomeController::class, 'index'])->name('home');

    // Konsultasi Routes
    Route::prefix('consultations')->name('consultations.')->group(function () {
        // List all consultations with optional type filter
        Route::get('/', [ConsultationController::class, 'index'])->name('index');
        Route::get('/doctors/{consultationType?}', [ConsultationController::class, 'index'])
            ->name('doctors')
            ->where('consultationType', 'chat|video|visit');
        
        // Basic consultation resource routes (except create & edit which use separate forms)
        Route::get('/{consultation}', [ConsultationController::class, 'show'])->name('show');
        Route::post('/', [ConsultationController::class, 'store'])->name('store');
        Route::put('/{consultation}', [ConsultationController::class, 'update'])->name('update');
        Route::delete('/{consultation}', [ConsultationController::class, 'destroy'])->name('destroy');
            
        // Chat functionality
        Route::get('/{consultation}/chat', [ConsultationController::class, 'chat'])->name('chat');
        Route::post('/{consultation}/chat', [ConsultationController::class, 'sendMessage'])->name('chat.send');
        
        // Video call functionality
        Route::get('/{consultation}/join-video', [ConsultationController::class, 'joinVideoCall'])->name('join-video');
            
        // Payment functionality (updated for Midtrans)
        Route::get('/{consultation}/payment', [ConsultationController::class, 'payment'])->name('payment');
        Route::post('/{consultation}/payment/update', [ConsultationController::class, 'updatePayment'])->name('payment.update');
        Route::get('/{consultation}/payment-finish', [ConsultationController::class, 'paymentFinish'])->name('payment.finish');
        
        // Complete consultation
        Route::post('/{consultation}/complete', [ConsultationController::class, 'complete'])->name('complete');
            
        // History
        Route::get('/history', [ConsultationController::class, 'history'])->name('history');
    });

//     // Marketplace
//     Route::get('/marketplace', [MarketplaceController::class, 'index'])->name('marketplace');
//     Route::get('/marketplace/product/{id}', [MarketplaceController::class, 'showProduct'])->name('marketplace.product');
//     Route::get('/marketplace/checkout', [MarketplaceController::class, 'checkout'])->name('marketplace.checkout');
//     Route::post('/marketplace/process-order', [MarketplaceController::class, 'processOrder'])->name('marketplace.process-order');

//        // Transaction routes
//     Route::prefix('transaction')->name('transaction.')->group(function () {
//         Route::post('/process-cart-order', [FarmerTransactionController::class, 'processCartOrder'])->name('processCartOrder');
//         Route::get('/payment-confirmation/{transaction}', [FarmerTransactionController::class, 'paymentConfirmation'])->name('paymentConfirmation');
//         Route::post('/payment-confirmation', [FarmerTransactionController::class, 'processPaymentConfirmation'])->name('processPaymentConfirmation');
//     });

//     // Cart Routes
//     Route::get('/cart', [App\Http\Controllers\Farmer\CartController::class, 'index'])->name('cart.index');
//     Route::post('/cart/process-payment', [App\Http\Controllers\Farmer\CartController::class, 'processPayment'])->name('cart.process_payment');

//     Route::post('/cart/add', [App\Http\Controllers\Farmer\CartController::class, 'add'])->name('cart.add');
//     Route::put('/cart/{id}', [App\Http\Controllers\Farmer\CartController::class, 'update'])->name('cart.update');
//     Route::delete('/cart/{id}', [App\Http\Controllers\Farmer\CartController::class, 'remove'])->name('cart.remove');
//     Route::delete('/cart', [App\Http\Controllers\Farmer\CartController::class, 'clear'])->name('cart.clear');
//     Route::get('/cart/checkout', [App\Http\Controllers\Farmer\CartController::class, 'checkout'])->name('cart.checkout');
//     Route::post('/cart/checkout/process', [FarmerTransactionController::class, 'processCartOrder'])->name('cart.checkout.process');
//     Route::get('/cart/checkout/payment', [FarmerTransactionController::class, 'payment'])->name('cart.checkout.payment');   
    


//    // Route::get('/payment-confirmation/{transaction}', [MarketplaceController::class, 'paymentConfirmation'])->name('payment.confirmation');
//     Route::post('/process-payment-confirmation', [MarketplaceController::class, 'processPaymentConfirmation'])->name('payment.process');
        
    Route::get('/marketplace', [MarketplaceController::class, 'index'])->name('marketplace');
    Route::get('/marketplace/product/{id}', [MarketplaceController::class, 'showProduct'])->name('marketplace.product');

    Route::prefix('marketplace')->name('marketplace.')->group(function () {
        // Route untuk menampilkan halaman checkout
        Route::get('/checkout', [App\Http\Controllers\Farmer\CheckoutController::class, 'show'])
            ->name('checkout');
            
        // Route untuk memproses checkout (produk tunggal)
        Route::post('/checkout/process', [App\Http\Controllers\Farmer\CheckoutController::class, 'process'])
            ->name('checkout.process');
            
        // Route untuk halaman pembayaran
        Route::get('/payment', function () {
            return redirect()->route('farmer.marketplace.checkout');
        })->name('payment');
        
        // Route untuk halaman sukses pembayaran
        Route::get('/payment/success', [App\Http\Controllers\Farmer\CheckoutController::class, 'paymentSuccess'])
            ->name('payment.success');
    });
    
    // Transaction routes (untuk checkout dari cart)
    Route::prefix('transaction')->name('transaction.')->group(function () {
        // Route untuk memproses checkout dari cart
        Route::post('/process-cart-order', [App\Http\Controllers\Farmer\CheckoutController::class, 'process'])
            ->name('processCartOrder');
    });
    
    // Cart routes (jika belum ada)
    Route::prefix('cart')->name('cart.')->group(function () {
        Route::get('/', [App\Http\Controllers\Farmer\CartController::class, 'index'])
            ->name('index');
        Route::post('/add', [App\Http\Controllers\Farmer\CartController::class, 'add'])
            ->name('add');
        Route::put('/{item}', [App\Http\Controllers\Farmer\CartController::class, 'update'])
            ->name('update');
        Route::delete('/{item}', [App\Http\Controllers\Farmer\CartController::class, 'remove'])
            ->name('remove');
        Route::get('/checkout', [App\Http\Controllers\Farmer\CartController::class, 'checkout'])
            ->name('checkout');
    });

    // Artikel
    Route::get('/artikel', [App\Http\Controllers\Farmer\ArticleController::class, 'index'])->name('articles');
    Route::get('/artikel/{slug}', [App\Http\Controllers\Farmer\ArticleController::class, 'show'])->name('articles.show');

    // Riwayat Aktivitas
    Route::get('/activity', [ActivityController::class, 'index'])->name('activity');
    Route::get('/activity/consultation/{id}', [ActivityController::class, 'showConsultation'])->name('activity.consultation.show');
    Route::get('/activity/transaction/{id}', [ActivityController::class, 'showTransaction'])->name('activity.transaction.show');

    // Profil
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.update-password');
    Route::get('/placeholder/{width}/{height}', [ProfileController::class, 'placeholder']);
});

Route::post('/farmer/marketplace/payment', [PaymentController::class, 'getSnapToken'])
    ->name('farmer.marketplace.payment');
Route::post('/payment/callback', [App\Http\Controllers\PaymentController::class, 'handlePaymentCallback'])
    ->name('payment.callback');
Route::post('/payment/midtrans/notification', [App\Http\Controllers\PaymentController::class, 'handlePaymentNotification'])
    ->name('payment.midtrans.notification');



require __DIR__ . '/auth.php';
