<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProjectRequest extends FormRequest
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
        $projectId = $this->route('project')->id ?? $this->route('project');

        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'icon' => ['nullable', 'url', 'max:2048'],
            'issue_types' => ['sometimes', 'array', 'min:1'],
            'issue_types.*' => ['required', 'string', 'max:50'],
            'categories' => ['nullable', 'array'],
            'categories.*' => ['string', 'max:50'],
            'milestones' => ['nullable', 'array'],
            'milestones.*' => ['string', 'max:50'],
            'versions' => ['nullable', 'array'],
            'versions.*' => ['string', 'max:50'],
        ];
    }
}
