<?php

namespace App\Http\Requests\BookCopy;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBookCopyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $bookCopyId = $this->route('book_copy');

        return [
            'barcode' => 'sometimes|string|max:50|unique:book_copies,barcode,' . $bookCopyId,
            'call_number' => 'sometimes|string|max:50',
            'condition' => 'sometimes|in:new,good,fair,poor',
            'status' => 'sometimes|in:available,borrowed,damaged,lost,maintenance',
            'location' => 'nullable|string|max:100',
            'shelf_number' => 'nullable|string|max:50',
            'acquisition_date' => 'nullable|date',
            'acquisition_price' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:500',
        ];
    }
}
