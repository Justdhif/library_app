<?php

namespace App\Http\Requests\Book;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBookRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization handled by policy
    }

    public function rules(): array
    {
        $bookId = $this->route('book');

        return [
            'title' => 'sometimes|string|max:255',
            'isbn' => 'nullable|string|max:13|unique:books,isbn,' . $bookId,
            'isbn13' => 'nullable|string|max:13|unique:books,isbn13,' . $bookId,
            'description' => 'nullable|string',
            'publisher_id' => 'sometimes|exists:publishers,id',
            'publication_year' => 'nullable|integer|min:1000|max:' . date('Y'),
            'pages' => 'nullable|integer|min:1',
            'language' => 'sometimes|string|max:50',
            'price' => 'nullable|numeric|min:0',
            'format' => 'sometimes|in:hardcover,paperback,ebook,audiobook',
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_featured' => 'sometimes|boolean',
            'is_active' => 'sometimes|boolean',
            'authors' => 'sometimes|array',
            'authors.*' => 'exists:authors,id',
            'categories' => 'sometimes|array|min:1',
            'categories.*' => 'exists:categories,id',
        ];
    }
}
