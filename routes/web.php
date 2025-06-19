<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\ArticleController as AdminArticleController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
// use App\Http\Controllers\DashboardController; // Kemungkinan tidak terpakai jika dialihkan ke dashboard peran
use App\Http\Controllers\Doctor\ConsultationController as DoctorConsultationController;
use App\Http\Controllers\Doctor\DashboardController as DoctorDashboardController;
use App\Http\Controllers\Doctor\HistoryController as DoctorHistoryController;
use App\Http\Controllers\Doctor\ProfileController as DoctorProfileController;
use App\Http\Controllers\Farmer\ActivityController as FarmerActivityController;
use App\Http\Controllers\Farmer\ArticleController as FarmerArticleController;
use App\Http\Controllers\Farmer\CartController as FarmerCartController;
use App\Http\Controllers\Farmer\CheckoutController as FarmerCheckoutController;
use App\Http\Controllers\Farmer\ConsultationController as FarmerConsultationController;
use App\Http\Controllers\Farmer\HomeController as FarmerHomeController;
use App\Http\Controllers\Farmer\MarketplaceController as FarmerMarketplaceController;
use App\Http\Controllers\Farmer\ProfileController as FarmerProfileController;
// use App\Http\Controllers\Farmer\TransactionController as FarmerTransactionController; // Transaksi farmer biasanya terkait checkout
use App\Http\Controllers\ProfileController as MainProfileController;
use App\Http\Controllers\Shop\DashboardController as ShopDashboardController;
use App\Http\Controllers\Shop\HistoryController as ShopHistoryController;
use App\Http\Controllers\Shop\ProductController as ShopProductController;
use App\Http\Controllers\Shop\ProfileController as ShopProfileController;
use App\Http\Controllers\Shop\TransactionController as ShopTransactionController;
use App\Http\Controllers\PaymentController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Halaman Utama
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('welcome');

// --- RUTE AUTENTIKASI (GUEST) ---
Route::middleware('guest')->group(function () {
    Route::get('login', [AuthenticatedSessionController::class, 'showLoginForm'])->name('login'); // Menggunakan showLoginForm dari controller Anda
    Route::post('login', [AuthenticatedSessionController::class, 'login']);

    Route::get('register', [AuthenticatedSessionController::class, 'createFarmer'])->name('register');
    Route::post('register', [AuthenticatedSessionController::class, 'storeFarmer']);
    Route::get('register/doctor', [AuthenticatedSessionController::class, 'createDoctor'])->name('register.doctor');
    Route::post('register/doctor', [AuthenticatedSessionController::class, 'storeDoctor']);
    Route::get('register/shop', [AuthenticatedSessionController::class, 'createShop'])->name('register.shop');
    Route::post('register/shop', [AuthenticatedSessionController::class, 'storeShop']);

    Route::get('forgot-password', [AuthenticatedSessionController::class, 'forgotPassword'])->name('password.request');
    Route::post('forgot-password', [AuthenticatedSessionController::class, 'sendResetLink'])->name('password.email');
    Route::get('reset-password/{token}', [AuthenticatedSessionController::class, 'resetPassword'])->name('password.reset');
    Route::post('reset-password', [AuthenticatedSessionController::class, 'updatePassword'])->name('password.update');
});

// --- RUTE VERIFIKASI EMAIL & MENUNGGU PERSETUJUAN (AUTH) ---
Route::middleware('auth')->group(function () {
    Route::get('email/verify', [AuthenticatedSessionController::class, 'showVerificationNotice'])->name('verification.notice');
    Route::get('email/verify/{id}/{hash}', [AuthenticatedSessionController::class, 'verifyEmail'])
        ->middleware(['signed', 'throttle:6,1'])->name('verification.verify');
    Route::post('email/verification-notification', [AuthenticatedSessionController::class, 'resendVerificationEmail'])
        ->middleware(['throttle:6,1'])->name('verification.send');

    Route::get('awaiting-verification', [AuthenticatedSessionController::class, 'awaitingVerification'])
        ->middleware('verified') // Hanya jika email sudah diverifikasi, baru menunggu approval admin
        ->name('awaiting.verification');
});

// --- LOGOUT (AUTH) ---
Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->middleware('auth')->name('logout');

// --- RUTE UMUM SETELAH LOGIN (AUTH & VERIFIED) ---
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        $user = Auth::user();
        // Asumsi ada kolom 'is_active' dan 'is_approved' di tabel users
        // Admin bisa bypass pengecekan is_active/is_approved untuk mengakses dashboardnya sendiri
        if ($user->role !== 'admin' && (!$user->is_active || $user->is_approved === false || is_null($user->is_approved))) {
            // Jika user belum aktif atau belum disetujui (dan bukan admin), arahkan ke halaman menunggu
            return redirect()->route('awaiting.verification');
        }

        switch ($user->role) {
            case 'admin': return redirect()->route('admin.dashboard');
            case 'doctor': return redirect()->route('doctor.dashboard');
            case 'shop': return redirect()->route('shop.dashboard');
            default: return redirect()->route('farmer.home'); // Default untuk farmer
        }
    })->name('dashboard');

    Route::get('profile', [MainProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('profile', [MainProfileController::class, 'update'])->name('profile.update');
    Route::delete('profile', [MainProfileController::class, 'destroy'])->name('profile.destroy');
});

// --- RUTE ADMIN ---
Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('dashboard', [AdminDashboardController::class, 'dashboard'])->name('dashboard');
    Route::get('dashboard/stats', [AdminDashboardController::class, 'getStats'])->name('dashboard.stats');
    Route::get('users/pending', [AdminDashboardController::class, 'getPendingUsers'])->name('users.pending');
    Route::get('users/farmers', [AdminDashboardController::class, 'getFarmers'])->name('users.farmers');
    Route::get('users/doctors', [AdminDashboardController::class, 'getDoctors'])->name('users.doctors');
    Route::get('users/shops', [AdminDashboardController::class, 'getShops'])->name('users.shops');
    Route::get('users/{user}', [AdminDashboardController::class, 'userDetail'])->name('user.show'); // Menggunakan {user} untuk route model binding
    Route::post('users/{user}/approve', [AdminDashboardController::class, 'approveUser'])->name('user.approve');
    Route::post('users/{user}/reject', [AdminDashboardController::class, 'rejectUser'])->name('user.reject');
    Route::post('users/{user}/toggle-status', [AdminDashboardController::class, 'toggleActive'])->name('user.toggle-status');

    Route::resource('articles', AdminArticleController::class);
    Route::put('articles/{article}/toggle-featured', [AdminArticleController::class, 'toggleFeatured'])->name('articles.toggle-featured');
    Route::put('articles/{article}/toggle-published', [AdminArticleController::class, 'togglePublished'])->name('articles.toggle-published');
});

// --- RUTE DOKTER ---
Route::middleware(['auth', 'verified', 'role:doctor'])->prefix('doctor')->name('doctor.')->group(function () {
    Route::get('dashboard', [DoctorDashboardController::class, 'index'])->name('dashboard');
    Route::post('consultations/{consultation}/accept', [DoctorDashboardController::class, 'accept'])->name('consultations.accept');
    Route::post('consultations/{consultation}/decline', [DoctorDashboardController::class, 'decline'])->name('consultations.decline');

    Route::resource('consultations', DoctorConsultationController::class)->only(['index', 'show']); // 'show' akan menampilkan detail & chat
    Route::patch('consultations/{consultation}/approve', [DoctorConsultationController::class, 'approve'])->name('consultations.approve');
    Route::patch('consultations/{consultation}/reject', [DoctorConsultationController::class, 'reject'])->name('consultations.reject');
    Route::patch('consultations/{consultation}/complete', [DoctorConsultationController::class, 'complete'])->name('consultations.complete');
    Route::post('consultations/{consultation}/messages', [DoctorConsultationController::class, 'sendMessage'])->name('consultations.messages.send');

    Route::get('history', [DoctorHistoryController::class, 'index'])->name('history.index');
    Route::get('history/{consultation}', [DoctorHistoryController::class, 'show'])->name('history.show');
    Route::get('history/export', [DoctorHistoryController::class, 'export'])->name('history.export');
    Route::get('profile', [DoctorProfileController::class, 'edit'])->name('profile.edit');
    Route::post('profile', [DoctorProfileController::class, 'update'])->name('profile.update'); // Sebaiknya PATCH
    Route::post('password/update', [DoctorProfileController::class, 'updatePassword'])->name('profile.password.update'); // Nama lebih spesifik
    Route::post('settings/update', [DoctorProfileController::class, 'updateSettings'])->name('profile.settings.update'); // Nama lebih spesifik
});

// --- RUTE TOKO ---
Route::middleware(['auth', 'verified', 'role:shop'])->prefix('shop')->name('shop.')->group(function () {
    Route::get('dashboard', [ShopDashboardController::class, 'index'])->name('dashboard');

    Route::get('manage-products', [ShopProductController::class, 'index'])->name('manage-products.index');
    Route::get('products/create', [ShopProductController::class, 'create'])->name('products.create');
    Route::post('products', [ShopProductController::class, 'store'])->name('products.store');
    Route::get('products/{product}/edit', [ShopProductController::class, 'edit'])->name('products.edit');
    Route::put('products/{product}', [ShopProductController::class, 'update'])->name('products.update');
    Route::delete('products/{product}', [ShopProductController::class, 'destroy'])->name('products.destroy');
    Route::put('products/{product}/stock', [ShopProductController::class, 'updateStock'])->name('products.update-stock');
    Route::put('products/{product}/toggle-active', [ShopProductController::class, 'toggleActive'])->name('products.toggle-active');

    Route::get('transactions', [ShopTransactionController::class, 'index'])->name('transactions.index');
    Route::get('transactions/{transaction}', [ShopTransactionController::class, 'show'])->name('transactions.show');
    Route::post('transactions/{transaction}/update-status', [ShopTransactionController::class, 'updateStatus'])->name('transactions.update-status');

    Route::get('history', [ShopHistoryController::class, 'index'])->name('history.index');
    Route::get('history/{transaction}', [ShopHistoryController::class, 'show'])->name('history.show'); // Parameter lebih baik {transaction}

    Route::get('profile', [ShopProfileController::class, 'show'])->name('profile.show'); // Atau 'edit'
    Route::post('profile/update', [ShopProfileController::class, 'update'])->name('profile.update'); // Sebaiknya PATCH
    Route::post('password/update', [ShopProfileController::class, 'updatePassword'])->name('profile.password.update'); // Nama lebih spesifik
});

// --- RUTE PETERNAK ---
Route::middleware(['auth', 'verified', 'role:farmer'])->prefix('farmer')->name('farmer.')->group(function () {
    Route::get('home', [FarmerHomeController::class, 'index'])->name('home');

    Route::prefix('consultations')->name('consultations.')->group(function () {
        Route::get('/', [FarmerConsultationController::class, 'index'])->name('index');
        Route::get('doctors/{consultationType?}', [FarmerConsultationController::class, 'index'])
            ->name('doctors')->where('consultationType', 'chat|video_call|visit'); // Pastikan type video_call
        Route::post('/', [FarmerConsultationController::class, 'store'])->name('store');
        Route::get('{consultation}', [FarmerConsultationController::class, 'show'])->name('show'); // Halaman detail & chat
        Route::get('{consultation}/chat', [FarmerConsultationController::class, 'chat'])->name('chat'); // Untuk tombol "Chat Sekarang"
        Route::post('{consultation}/messages', [FarmerConsultationController::class, 'sendMessage'])->name('messages.send');
        Route::put('{consultation}', [FarmerConsultationController::class, 'update'])->name('update');
        Route::delete('{consultation}', [FarmerConsultationController::class, 'destroy'])->name('destroy');
        Route::get('{consultation}/join-video', [FarmerConsultationController::class, 'joinVideoCall'])->name('join-video');
        Route::get('{consultation}/payment', [FarmerConsultationController::class, 'payment'])->name('payment');
        Route::post('{consultation}/payment/update', [FarmerConsultationController::class, 'updatePayment'])->name('payment.update');
        Route::get('{consultation}/payment-finish', [FarmerConsultationController::class, 'paymentFinish'])->name('payment.finish');
        Route::post('{consultation}/complete', [FarmerConsultationController::class, 'complete'])->name('complete');
        Route::get('history', [FarmerConsultationController::class, 'history'])->name('history'); // Seharusnya ini di luar prefix 'consultations' jika ini riwayat umum
    });
    // Jika 'consultations.history' adalah riwayat khusus konsultasi, maka peletakannya sudah benar.
    // Jika ini riwayat umum aktivitas farmer, mungkin lebih baik di:
    // Route::get('activity/consultations', [FarmerActivityController::class, 'consultationHistory'])->name('activity.consultations');


    Route::get('marketplace', [FarmerMarketplaceController::class, 'index'])->name('marketplace.index');
    Route::get('marketplace/product/{product}', [FarmerMarketplaceController::class, 'showProduct'])->name('marketplace.product.show');

    Route::prefix('marketplace')->name('marketplace.')->group(function () {
        Route::get('checkout', [FarmerCheckoutController::class, 'show'])->name('checkout');
        Route::post('checkout/process', [FarmerCheckoutController::class, 'process'])->name('checkout.process'); // Proses checkout produk tunggal
        Route::get('payment/success', [FarmerCheckoutController::class, 'paymentSuccess'])->name('payment.success');
    });

    Route::prefix('transaction')->name('transaction.')->group(function () { // Untuk transaksi dari cart
        Route::post('process-cart-order', [FarmerCheckoutController::class, 'process'])->name('processCartOrder'); // Asumsi method process menangani kedua jenis checkout
    });

    Route::prefix('cart')->name('cart.')->group(function () {
        Route::get('/', [FarmerCartController::class, 'index'])->name('index');
        Route::post('add', [FarmerCartController::class, 'add'])->name('add');
        Route::put('{cartItem}', [FarmerCartController::class, 'update'])->name('update');
        Route::delete('{cartItem}', [FarmerCartController::class, 'remove'])->name('remove');
        Route::get('checkout', [FarmerCartController::class, 'checkout'])->name('checkout'); // Halaman konfirmasi cart sebelum bayar
    });

    Route::get('artikel', [FarmerArticleController::class, 'index'])->name('articles.index');
    Route::get('artikel/{article:slug}', [FarmerArticleController::class, 'show'])->name('articles.show');

    Route::get('activity', [FarmerActivityController::class, 'index'])->name('activity.index');
    Route::get('activity/consultation/{consultation}', [FarmerActivityController::class, 'showConsultation'])->name('activity.consultation.show');
    Route::get('activity/transaction/{transaction}', [FarmerActivityController::class, 'showTransaction'])->name('activity.transaction.show');

    Route::get('profile', [FarmerProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('profile', [FarmerProfileController::class, 'update'])->name('profile.update'); // Menggunakan PATCH
    Route::post('profile/password', [FarmerProfileController::class, 'updatePassword'])->name('profile.password.update');
});

// --- RUTE PEMBAYARAN (UMUM & MIDTRANS) ---
Route::post('farmer/marketplace/payment/request-snap-token', [PaymentController::class, 'getSnapToken']) // Rute untuk meminta SnapToken
    ->middleware(['auth', 'verified', 'role:farmer'])
    ->name('farmer.marketplace.payment.request_snap_token');

// Rute ini harus dapat diakses oleh Midtrans tanpa middleware sesi/CSRF
Route::post('payment/midtrans/notification', [PaymentController::class, 'handlePaymentNotification'])
    ->name('payment.midtrans.notification');
// Route::post('payment/callback', [PaymentController::class, 'handlePaymentCallback'])->name('payment.callback'); // Jika ada callback lain

// --- FILE RUTE AUTH BAWAAN LARAVEL ---
// Pastikan tidak ada konflik dengan rute autentikasi yang sudah didefinisikan di atas.
// Jika auth.php hanya berisi rute seperti konfirmasi password, dll (yang memerlukan auth), maka aman.
// Jika auth.php juga mendefinisikan login, register, dll., maka lebih baik gunakan salah satu (definisi di atas atau dari auth.php).
require __DIR__.'/auth.php';