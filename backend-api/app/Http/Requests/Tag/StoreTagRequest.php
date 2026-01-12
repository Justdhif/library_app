<?php

namespace App\Http\Requests\Tag;

use Illuminate\Foundation\Http\FormRequest;

class StoreTagRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:50|unique:tags',
            'taggable_type' => 'required|in:App\\Models\\Book',
            'taggable_id' => 'required|integer',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Tag name is required',
            'name.unique' => 'Tag already exists',
            'name.max' => 'Tag name cannot exceed 50 characters',
        ];
    }
}
