<?php

namespace App\Http\Controllers\Farmer;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Doctor;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeController extends Controller
{
    /**
     * Display the farmer's home page with featured content.
     */
    public function index()
    {
        // Get featured articles
        $featuredArticles = Article::where('featured', true)
            ->orderBy('created_at', 'desc')
            ->take(3)
            ->get();

        // Get available doctors
        $availableDoctors = Doctor::whereHas('user', function ($query) {
            $query->where('status', 'active');
        })->with('user')
            ->take(5)
            ->get();

        // Get featured products
        $featuredProducts = Product::where('featured', true)
            ->with('shop.user')
            ->take(6)
            ->get();

        return Inertia::render('Farmer/Home', [
            'featuredArticles' => $featuredArticles,
            'availableDoctors' => $availableDoctors,
            'featuredProducts' => $featuredProducts,
        ]);
    }
}