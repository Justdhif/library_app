<?php

namespace App\Http\Requests\Rating;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRatingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'rating' => 'sometimes|integer|min:1|max:5',
            'review' => 'nullable|string|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'rating.min' => 'Rating must be at least 1',
            'rating.max' => 'Rating cannot exceed 5',
        ];
    }
}
