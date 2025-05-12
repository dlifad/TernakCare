<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class ArticleController extends Controller
{
    /**
     * Display a listing of the articles.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $articles = Article::with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Admin/Articles/Index', [
            'articles' => $articles,
        ]);
    }

    /**
     * Show the form for creating a new article.
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        return Inertia::render('Admin/Articles/Create');
    }

    /**
     * Store a newly created article in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|max:255',
            'content' => 'required',
            'category' => 'nullable|max:255',
            'featured_image' => 'nullable|image|max:2048',
            'is_published' => 'boolean',
            'featured' => 'boolean',
        ]);

        $article = new Article();
        $article->user_id = auth()->id();
        $article->title = $request->title;
        $article->slug = Str::slug($request->title);
        $article->content = $request->content;
        $article->category = $request->category;
        $article->is_published = $request->is_published ?? false;
        $article->featured = $request->featured ?? false;

        if ($request->hasFile('featured_image')) {
            $path = $request->file('featured_image')->store('articles', 'public');
            $article->featured_image = $path;
        }

        $article->save();

        return redirect()->route('admin.articles.index')
            ->with('success', 'Artikel berhasil dibuat.');
    }

    /**
     * Display the specified article.
     *
     * @param  \App\Models\Article  $article
     * @return \Inertia\Response
     */
    public function show(Article $article)
    {
        return Inertia::render('Admin/Articles/Show', [
            'article' => $article,
        ]);
    }

    /**
     * Show the form for editing the specified article.
     *
     * @param  \App\Models\Article  $article
     * @return \Inertia\Response
     */
    public function edit(Article $article)
    {
        return Inertia::render('Admin/Articles/Edit', [
            'article' => $article,
        ]);
    }

    /**
     * Update the specified article in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Article  $article
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, Article $article)
    {
        $request->validate([
            'title' => 'required|max:255',
            'content' => 'required',
            'category' => 'nullable|max:255',
            'featured_image' => 'nullable|image|max:2048',
            'is_published' => 'boolean',
            'featured' => 'boolean',
        ]);

        $article->title = $request->title;
        $article->slug = Str::slug($request->title);
        $article->content = $request->content;
        $article->category = $request->category;
        $article->is_published = $request->is_published ?? false;
        $article->featured = $request->featured ?? false;

        if ($request->hasFile('featured_image')) {
            // Hapus gambar lama jika ada
            if ($article->featured_image) {
                Storage::disk('public')->delete($article->featured_image);
            }
            
            $path = $request->file('featured_image')->store('articles', 'public');
            $article->featured_image = $path;
        }

        $article->save();

        return redirect()->route('admin.articles.index')
            ->with('success', 'Artikel berhasil diperbarui.');
    }

    /**
     * Remove the specified article from storage.
     *
     * @param  \App\Models\Article  $article
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Article $article)
    {
        // Hapus gambar jika ada
        if ($article->featured_image) {
            Storage::disk('public')->delete($article->featured_image);
        }

        $article->delete();

        return redirect()->route('admin.articles.index')
            ->with('success', 'Artikel berhasil dihapus.');
    }

    /**
     * Toggle the featured status of an article.
     *
     * @param  \App\Models\Article  $article
     * @return \Illuminate\Http\RedirectResponse
     */
    public function toggleFeatured(Article $article)
    {
        $article->featured = !$article->featured;
        $article->save();

        return back()->with('success', 'Status artikel berhasil diperbarui.');
    }

    /**
     * Toggle the published status of an article.
     *
     * @param  \App\Models\Article  $article
     * @return \Illuminate\Http\RedirectResponse
     */
    public function togglePublished(Article $article)
    {
        $article->is_published = !$article->is_published;
        $article->save();

        return back()->with('success', 'Status publikasi berhasil diperbarui.');
    }
}