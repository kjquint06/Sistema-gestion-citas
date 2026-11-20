<?php

namespace App\Http\Requests;

use App\Models\Cita;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GuardarConsultaRequest extends FormRequest
{
    private const TIPOS_ANTECEDENTE = ['personal', 'familiar', 'quirurgico', 'habitos'];

    private const GRAVEDADES = ['leve', 'moderada', 'grave', 'por_evaluar'];

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $cita = $this->route('cita');

        return $cita instanceof Cita
            && $cita->medico_id === $this->user()->medico?->id;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'sintomas' => ['nullable', 'string', 'max:5000'],
            'diagnostico' => ['required', 'string', 'max:5000'],
            'notas' => ['nullable', 'string', 'max:5000'],

            'signos_vitales' => ['nullable', 'array'],
            'signos_vitales.presion' => ['nullable', 'string', 'max:20'],
            'signos_vitales.pulso' => ['nullable', 'integer', 'between:20,250'],
            'signos_vitales.peso' => ['nullable', 'numeric', 'between:1,500'],

            'recetas' => ['nullable', 'array'],
            'recetas.*.medicamento' => ['required', 'string', 'max:255'],
            'recetas.*.dosis' => ['required', 'string', 'max:255'],
            'recetas.*.frecuencia' => ['required', 'string', 'max:255'],
            'recetas.*.duracion' => ['required', 'string', 'max:255'],

            'antecedentes_nuevos' => ['nullable', 'array'],
            'antecedentes_nuevos.*.tipo' => ['required', 'string', Rule::in(self::TIPOS_ANTECEDENTE)],
            'antecedentes_nuevos.*.fecha' => ['nullable', 'date', 'before_or_equal:today'],
            'antecedentes_nuevos.*.descripcion' => ['required', 'string', 'max:2000'],

            'alergias_nuevas' => ['nullable', 'array'],
            'alergias_nuevas.*.alergeno' => ['required', 'string', 'max:255'],
            'alergias_nuevas.*.gravedad' => ['required', 'string', Rule::in(self::GRAVEDADES)],
            'alergias_nuevas.*.reaccion' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'diagnostico.required' => 'El diagnóstico es obligatorio para finalizar la consulta.',
        ];
    }
}
