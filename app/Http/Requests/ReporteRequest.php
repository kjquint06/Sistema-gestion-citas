<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ReporteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Si no se envía rango, se usa el mes actual.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'desde' => $this->filled('desde') ? $this->input('desde') : now()->startOfMonth()->toDateString(),
            'hasta' => $this->filled('hasta') ? $this->input('hasta') : now()->endOfMonth()->toDateString(),
        ]);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'desde' => ['required', 'date_format:Y-m-d'],
            'hasta' => ['required', 'date_format:Y-m-d', 'after_or_equal:desde'],
        ];
    }

    public function desde(): string
    {
        return $this->string('desde')->toString();
    }

    public function hasta(): string
    {
        return $this->string('hasta')->toString();
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'desde.date_format' => 'La fecha "Desde" no es válida.',
            'hasta.date_format' => 'La fecha "Hasta" no es válida.',
            'hasta.after_or_equal' => 'La fecha "Hasta" debe ser igual o posterior a "Desde".',
        ];
    }
}
