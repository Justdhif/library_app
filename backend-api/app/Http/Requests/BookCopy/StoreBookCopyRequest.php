<?php

namespace App\Http\Requests\BookCopy;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookCopyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'book_id' => 'required|exists:books,id',
            'barcode' => 'required|string|max:50|unique:book_copies',
            'call_number' => 'required|string|max:50',
            'condition' => 'required|in:new,good,fair,poor',
            'status' => 'required|in:available,borrowed,damaged,lost,maintenance',
            'location' => 'nullable|string|max:100',
            'shelf_number' => 'nullable|string|max:50',
            'acquisition_date' => 'nullable|date',
            'acquisition_price' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'book_id.required' => 'Book is required',
            'barcode.required' => 'Barcode is required',
            'barcode.unique' => 'Barcode already exists',
            'call_number.required' => 'Call number is required',
            'condition.required' => 'Book condition is required',
            'status.required' => 'Book status is required',
        ];
    }
}
