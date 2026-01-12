<?php

namespace App\Http\Requests\Borrowing;

use Illuminate\Foundation\Http\FormRequest;

class ReturnBorrowingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'condition' => 'required|in:excellent,good,fair,poor,damaged,lost',
            'notes' => 'nullable|string|max:500',
            'item_ids' => 'nullable|array',
            'item_ids.*' => 'exists:borrowing_items,id',
        ];
    }

    public function messages(): array
    {
        return [
            'condition.required' => 'Book condition is required when returning',
            'condition.in' => 'Invalid book condition',
            'item_ids.array' => 'Item IDs must be an array',
            'item_ids.*.exists' => 'One or more item IDs are invalid',
        ];
    }
}
