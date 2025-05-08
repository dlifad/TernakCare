<?php

namespace App\Http\Controllers\Farmer;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ArticleController extends Controller
{
    /**
     * Display a listing of articles.
     */
    public function index(Request $request)
    {
        $query = Article::query();

        // Apply filters
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        if ($request->has('search')) {
            $query->where('title', 'like', '%' . $request->search . '%')
                ->orWhere('content', 'like', '%' . $request->search . '%');
        }

        // Get articles
        $articles = $query->orderBy('created_at', 'desc')->paginate(10);

        // Get all categories for filter
        $categories = Article::distinct('category')->pluck('category');

        return Inertia::render('Farmer/Article/Index', [
            'articles' => $articles,
            'categories' => $categories,
            'filters' => $request->only(['category', 'search']),
        ]);
    }

    /**
     * Display the specified article.
     */
    public function show($id)
    {
        $article = Article::findOrFail($id);

        // Get related articles from the same category
        $relatedArticles = Article::where('category', $article->category)
            ->where('id', '!=', $article->id)
            ->take(3)
            ->get();

        return Inertia::render('Farmer/Article/Show', [
            'article' => $article,
            'relatedArticles' => $relatedArticles,
        ]);
    }

    /**
     * Bookmark an article.
     */
    public function bookmark($id)
    {
        // This would typically use a pivot table relationship
        // For simplicity, we'll just return a success message
        return back()->with('message', 'Article bookmarked successfully.');
    }

    /**
     * Display bookmarked articles.
     */
    public function bookmarks()
    {
        // This would typically retrieve from a pivot table relationship
        // For simplicity, we'll just return an empty array
        return Inertia::render('Farmer/Article/Bookmarks', [
            'articles' => [],
        ]);
    }
}