<?php

namespace App\Http\Requests\Author;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAuthorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:255',
            'biography' => 'nullable|string',
            'birth_date' => 'nullable|date|before:today',
            'death_date' => 'nullable|date|after:birth_date',
            'nationality' => 'nullable|string|max:100',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max
            'is_active' => 'nullable|boolean',
            'social_links' => 'nullable|array',
            'social_links.*.platform' => 'required_with:social_links|string|max:50',
            'social_links.*.url' => 'required_with:social_links|url|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'birth_date.before' => 'Birth date must be in the past',
            'death_date.after' => 'Death date must be after birth date',
            'photo.image' => 'Photo must be an image file',
            'photo.mimes' => 'Photo must be a file of type: jpeg, png, jpg, gif',
            'photo.max' => 'Photo size must not exceed 5MB',
        ];
    }
}
