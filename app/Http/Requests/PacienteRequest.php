<?php

namespace App\Http\Requests;

use App\Models\Paciente;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PacienteRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->tieneRol(User::ROL_RECEPCIONISTA, User::ROL_ADMIN) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Paciente|null $paciente */
        $paciente = $this->route('paciente');

        return [
            'nombre' => ['required', 'string', 'max:255'],
            'documento' => [
                'required',
                'string',
                'max:20',
                Rule::unique('pacientes', 'documento')->ignore($paciente?->id),
            ],
            'telefono' => ['required', 'string', 'max:20'],
            'correo' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($paciente?->usuario_id),
            ],
            'fecha_nacimiento' => ['required', 'date', 'before_or_equal:today'],
            'sexo' => ['required', Rule::in(['Femenino', 'Masculino'])],
            'direccion' => ['nullable', 'string', 'max:255'],
            'contacto_emergencia' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre es obligatorio.',
            'documento.required' => 'El documento es obligatorio.',
            'documento.unique' => 'Ya existe un paciente con ese documento.',
            'documento.max' => 'El documento no puede tener más de 20 caracteres.',
            'telefono.required' => 'El telefono es obligatorio.',
            'correo.required' => 'El correo es obligatorio.',
            'correo.email' => 'El correo no es valido.',
            'correo.unique' => 'Ya existe un usuario con ese correo.',
            'fecha_nacimiento.required' => 'La fecha de nacimiento es obligatoria.',
            'fecha_nacimiento.before_or_equal' => 'La fecha de nacimiento no puede ser futura.',
            'sexo.required' => 'El sexo es obligatorio.',
            'sexo.in' => 'Selecciona un sexo valido.',
        ];
    }
}
