<?php

namespace App\Http\Requests\Publisher;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePublisherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $publisherId = $this->route('publisher');

        return [
            'name' => 'sometimes|string|max:255|unique:publishers,name,' . $publisherId,
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|url|max:255',
            'description' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'name.unique' => 'Publisher name already exists',
            'email.email' => 'Please provide a valid email address',
            'website.url' => 'Please provide a valid URL',
        ];
    }
}
