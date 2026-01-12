<?php

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'date_of_birth' => 'nullable|date|before:today',
            'gender' => 'nullable|in:male,female,other',
            'avatar' => 'nullable|string', // URL or base64
            'bio' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'full_name.required' => 'Full name is required',
            'date_of_birth.before' => 'Date of birth must be before today',
            'gender.in' => 'Gender must be male, female, or other',
        ];
    }
}
