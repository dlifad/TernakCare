<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        $rules = [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category' => 'required|in:pakan,obat,peralatan',
        ];

        // Add image validation only for new products or when updating image
        if ($this->isMethod('post') || $this->hasFile('image') || 
            (is_string($this->image) && str_starts_with($this->image, 'data:image'))) {
            $rules['image'] = 'nullable|image|max:5120'; // 5MB max for uploaded files
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages()
    {
        return [
            'name.required' => 'Nama produk wajib diisi',
            'description.required' => 'Deskripsi produk wajib diisi',
            'price.required' => 'Harga wajib diisi',
            'price.numeric' => 'Harga harus berupa angka',
            'price.min' => 'Harga harus berupa angka positif',
            'stock.required' => 'Stok wajib diisi',
            'stock.integer' => 'Stok harus berupa angka bulat',
            'stock.min' => 'Stok harus berupa angka non-negatif',
            'category.required' => 'Kategori wajib dipilih',
            'category.in' => 'Kategori tidak valid',
            'image.image' => 'File harus berupa gambar',
            'image.max' => 'Ukuran gambar tidak boleh lebih dari 5MB',
        ];
    }
}