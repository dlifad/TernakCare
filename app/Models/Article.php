<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'slug',
        'content',
        'featured_image',
        'category',
        'is_published',
        'featured'
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'featured' => 'boolean',
    ];

    // Relasi dengan user
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Accessor untuk format gambar
    public function getFeaturedImageUrlAttribute()
    {
        if ($this->featured_image) {
            return asset('storage/' . $this->featured_image);
        }
        
        return asset('images/default-article.jpg');
    }

    // Accessor untuk mempersingkat konten
    public function getExcerptAttribute()
    {
        return \Str::limit(strip_tags($this->content), 150);
    }
}