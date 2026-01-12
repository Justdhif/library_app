<?php

namespace App\Http\Requests\Return;

use Illuminate\Foundation\Http\FormRequest;

class ProcessReturnRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'borrowing_id' => ['required', 'exists:borrowings,id'],
            'return_condition' => ['required', 'in:good,fair,damaged,lost'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'damage_description' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'borrowing_id.required' => 'Borrowing ID is required',
            'borrowing_id.exists' => 'Borrowing not found',
            'return_condition.required' => 'Return condition is required',
            'return_condition.in' => 'Invalid return condition',
        ];
    }
}
