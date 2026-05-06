<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjectRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'key' => ['required', 'string', 'min:2', 'max:10', 'regex:/^[A-Z]+$/', 'unique:projects,key'],
            'icon' => ['nullable', 'url', 'max:2048'],
            'issue_types' => ['required', 'array', 'min:1'],
            'issue_types.*' => ['required', 'string', 'max:50'],
            'categories' => ['nullable', 'array'],
            'categories.*' => ['string', 'max:50'],
            'versions' => ['nullable', 'array'],
            'versions.*' => ['string', 'max:50'],
        ];
    }
    
    public function messages(): array
    {
        return [
            'key.regex' => 'The project key must consist of only uppercase alphabetical characters.',
        ];
    }
}
