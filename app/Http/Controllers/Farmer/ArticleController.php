<?php

namespace App\Http\Controllers\Farmer;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ArticleController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search', '');
        $category = $request->input('category', '');

        $articles = Article::query()
            ->where('is_published', 1)
            ->orderByDesc('created_at')
            ->when($search, function ($q, $search) {
                $q->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('content', 'like', "%{$search}%");
                });
            })
            ->when($category, fn($q) => $q->where('category', $category))
            ->paginate(9)
            ->withQueryString();

        return Inertia::render('Farmer/Article/Index', [
            'auth' => [
                'user' => auth()->user(),
            ],
            'articles' => $articles,
            'filters' => [
                'search' => $search,
                'category' => $category,
            ],
        ]);
    }

    public function show($slug)
    {
        $article = Article::where('slug', $slug)
            ->where('is_published', 1)
            ->firstOrFail();

        return Inertia::render('Farmer/Article/Detail', [
            'article' => $article,
            'auth' => [
                'user' => auth()->user(),
            ],
        ]);
    }
}
