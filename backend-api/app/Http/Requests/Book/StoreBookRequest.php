<?php

namespace App\Http\Requests\Book;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization handled by policy
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'isbn' => 'nullable|string|max:13|unique:books',
            'isbn13' => 'nullable|string|max:13|unique:books',
            'description' => 'nullable|string',
            'publisher_id' => 'required|exists:publishers,id',
            'publication_year' => 'nullable|integer|min:1000|max:' . date('Y'),
            'edition' => 'nullable|string|max:50',
            'pages' => 'nullable|integer|min:1',
            'language' => 'required|string|max:50',
            'price' => 'nullable|numeric|min:0',
            'format' => 'required|in:hardcover,paperback,ebook,audiobook',
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'authors' => 'required|array',
            'authors.*' => 'exists:authors,id',
            'categories' => 'required|array',
            'categories.*' => 'exists:categories,id',
            'total_copies' => 'required|integer|min:1|max:100',
            'condition' => 'required|in:new,good,fair,poor,damaged',
            'location' => 'nullable|string|max:255',
            'shelf_number' => 'nullable|string|max:50',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Book title is required',
            'publisher_id.required' => 'Publisher is required',
            'categories.required' => 'At least one category is required',
            'authors.required' => 'At least one author is required',
            'format.required' => 'Book format is required',
            'total_copies.required' => 'Total copies is required',
            'total_copies.min' => 'Total copies must be at least 1',
            'total_copies.max' => 'Total copies cannot exceed 100',
            'condition.required' => 'Book condition is required',
        ];
    }
}
