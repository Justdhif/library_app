<?php

namespace App\Http\Requests\Borrowing;

use Illuminate\Foundation\Http\FormRequest;

class StoreBorrowingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => 'required|exists:users,id',
            'book_copy_ids' => 'required|array|min:1|max:5',
            'book_copy_ids.*' => 'required|exists:book_copies,id',
            'due_date' => 'nullable|date|after:today',
            'notes' => 'nullable|string|max:500',
            'quick_request' => 'nullable|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.required' => 'User is required',
            'user_id.exists' => 'Selected user does not exist',
            'book_copy_ids.required' => 'At least one book is required',
            'book_copy_ids.array' => 'Book copies must be an array',
            'book_copy_ids.min' => 'At least one book is required',
            'book_copy_ids.max' => 'Maximum 5 books can be borrowed at once',
            'book_copy_ids.*.exists' => 'One or more selected book copies do not exist',
        ];
    }
}
